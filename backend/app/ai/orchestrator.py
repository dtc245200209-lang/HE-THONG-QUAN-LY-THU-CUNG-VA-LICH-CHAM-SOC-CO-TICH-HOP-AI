from typing import List, Dict, Optional, Any, AsyncGenerator
from app.ai.provider import AIProvider
from app.ai.schemas import AIChatRequest, AIChatResponse, Source, ActionItem
from app.ai.tool_registry import tool_registry
import asyncio
from sqlalchemy.orm import Session
from app.models.pet import Pet
import re

class AIOrchestrator:
    def __init__(self, provider: AIProvider):
        self.provider = provider
        self.system_prompt = (
            "Bạn là trợ lý AI thông minh của Hệ thống Chăm sóc & Siêu thị Thú cưng PetCare bằng tiếng Việt.\n"
            "HỆ THỐNG PETCARE BAO GỒM 2 PHÂN HỆ CHÍNH:\n"
            "1. PHÒNG KHÁM & BỆNH VIỆN THÚ Y: Khám chữa bệnh tổng quát, tiêm phòng định kỳ, phẫu thuật, spa tắm sấy, lưu chuồng khách sạn thú cưng.\n"
            "2. SIÊU THỊ THÚ CƯNG PETCARE STORE (/shop):\n"
            "   - KINH DOANH & MUA BÁN THÚ CƯNG THUẦN CHỦNG: PetCare có Trại nhân giống chó thuần chủng VKA và Trại mèo WCF, trực tiếp nhân giống và bán các bé cún, mèo con thuần chủng khỏe mạnh (Corgi, Poodle, Golden, Phốc Sóc, Mèo Anh lông ngắn, Mèo Scottish Fold, Mèo Ragdoll).\n"
            "   - Thức ăn hạt chính hãng (Royal Canin, Orijen, Me-O...), pate dinh dưỡng, đồ chơi, vật dụng vệ sinh, phụ kiện.\n\n"
            "NGUYÊN TẮC QUAN TRỌNG KHI TƯ VẤN:\n"
            "1. KHI KHÁCH HỎI VỀ MUA BÁN THÚ CƯNG HOẶC SHOP CÓ BAO NHIÊU THÚ CƯNG:\n"
            "   - PHẢI XÁC NHẬN RÕ RÀNG: 'Dạ PetCare có kinh doanh và bán các bé thú cưng thuần chủng tại Siêu thị PetCare Store (/shop) ạ!'.\n"
            "   - Liệt kê chính xác danh sách các giống chó mèo đang có sẵn tại shop kèm giá bán dựa trên thông tin dữ liệu được cung cấp.\n"
            "   - Nêu rõ chính sách bảo hành: 100% bé đã tiêm phòng đủ 2 mũi vắc-xin, tẩy giun, gắn microchip, bảo hành Care/Parvo và tặng gói khám tổng quát.\n"
            "   - Mời khách ghé xem hình ảnh chi tiết và đặt mua trực tiếp tại trang Siêu thị (/shop).\n"
            "2. Khi chủ nuôi gặp khó khăn trong chăm sóc, giải thích tận tình, thân thiện, chu đáo và thấu cảm.\n"
            "3. Không tự chẩn đoán thay thế bác sĩ thú y; các trường hợp nguy cấp (khó thở, co giật, xuất huyết, hôn mê) cần khuyến cáo đến cơ sở thú y khẩn cấp ngay.\n"
            "4. ĐẶT LỊCH HẸN: TUYỆT ĐỐI CHỈ đề xuất hành động đặt lịch khi người dùng RÕ RÀNG YÊU CẦU ĐẶT LỊCH (ví dụ: 'đặt lịch cho mình', 'hẹn lịch khám', 'book lịch tắm').\n"
            "   <<<ACTION:book_appointment:{\"service_id\":\"ID_của_dịch_vụ\",\"date\":\"YYYY-MM-DD\",\"time\":\"HH:MM\"}>>>\n"
        )
        self._services_cache = None
        self._services_cache_time = 0.0
        self._shop_cache = None
        self._shop_cache_time = 0.0

    async def chat(self, request: AIChatRequest, db: Session = None, user_role: str = "customer") -> AIChatResponse:
        # Fast intent detection (< 1ms)
        if self._detect_simple_intent(request.message):
            msg = request.message.strip().lower()
            if any(w in msg for w in ["cảm ơn", "cám ơn", "thanks", "thx"]):
                reply = "Dạ không có chi ạ! Nếu bạn cần tư vấn thêm bất cứ điều gì về sức khỏe, tiêm phòng hay dinh dưỡng cho bé cưng, cứ nhắn cho mình nhé!"
            elif any(w in msg for w in ["tạm biệt", "bye"]):
                reply = "Tạm biệt bạn! Chúc bạn và bé cưng luôn vui vẻ, nhiều sức khỏe và bình an nhé!"
            else:
                reply = "Xin chào! Mình là trợ lý AI chuyên về chăm sóc sức khỏe và dinh dưỡng thú cưng của PetCare. Bạn cần hỗ trợ gì về sổ sức khỏe hay lịch trình chăm sóc của bé cưng nhà mình ạ?"
            return AIChatResponse(
                message_id="fast-id",
                answer=reply,
                intent="general_chat",
                sources=[],
                actions=[],
                warnings=[]
            )

        context_prompt = f"{self.system_prompt}\nUser Role: {user_role}\n"
        
        if request.pet_id and db:
            pet_context = await asyncio.to_thread(self._get_pet_context, db, request.pet_id)
            if pet_context:
                context_prompt += f"\n{pet_context}\n"
                
        if db:
            services_context = await asyncio.to_thread(self._get_services_context, db)
            if services_context:
                context_prompt += f"\n{services_context}\n"
            shop_context = await asyncio.to_thread(self._get_shop_context, db)
            if shop_context:
                context_prompt += f"\n{shop_context}\n"
                
        context_prompt += "\nCHỈ SỬ DỤNG thông tin trên nếu câu hỏi liên quan."

        messages = [{"role": "system", "content": context_prompt}]
        if request.messages:
            for m in request.messages:
                if m.get("role") in ["user", "assistant"]:
                    messages.append({"role": m.get("role"), "content": m.get("content", "")})
        else:
            messages.append({"role": "user", "content": request.message})
            
        # Fast Clinical Knowledge Matching (< 5ms)
        from app.ai.providers.mock_provider import MockProvider
        mock_reply = await MockProvider().chat(messages)
        default_fallback = "Mình là trợ lý chăm sóc thú cưng PetCare. Bạn có thể cho mình biết thêm thông tin về giống loài"
        if default_fallback not in mock_reply:
            return AIChatResponse(
                message_id="fast-clinical-id",
                answer=mock_reply,
                intent="clinical_expert",
                sources=[],
                actions=[],
                warnings=[]
            )

        try:
            reply = await self.provider.chat(messages)
            return AIChatResponse(
                message_id="mock-id",
                answer=reply,
                intent="general_chat",
                sources=[],
                actions=[],
                warnings=[]
            )
        except Exception as e:
            return AIChatResponse(
                message_id="error-id",
                answer=f"Sorry, I encountered an error: {str(e)}",
                warnings=["AI Provider Error"]
            )

    def _detect_simple_intent(self, message: str) -> bool:
        # Fast intent detection ONLY for standalone greetings / thanks / farewells
        msg = message.strip().lower()
        words = msg.split()
        if len(words) > 3:
            return False
        # If message contains question marks or inquiry keywords, pass to LLM
        if any(w in msg for w in ["?", "sao", "gì", "nào", "ăn", "tiêm", "uống", "khám", "tắm", "bệnh", "hạt", "pate", "mèo", "chó", "bao nhiêu", "kg"]):
            return False
        greetings = {"chào", "xin chào", "hello", "hi", "hey", "chào bạn", "chào shop", "chào bot", "chào ad"}
        thanks = {"cảm ơn", "cám ơn", "thanks", "thx", "thank you", "cảm ơn bạn", "cảm ơn shop"}
        farewells = {"tạm biệt", "bye", "bye bye", "hẹn gặp lại"}
        return (msg in greetings) or (msg in thanks) or (msg in farewells)

    def _get_pet_context(self, db: Session, pet_id: str) -> str:
        # Fast synchronous DB query executed via to_thread later
        if not db or not pet_id:
            return ""
            
        import uuid
        try:
            uuid.UUID(str(pet_id))
        except (ValueError, AttributeError):
            return ""

        try:
            print(f"\n{'='*70}", flush=True)
            print(f"[RAG SQL PIPELINE] 🔍 Truy vấn dữ liệu thực tế từ Database PostgreSQL:", flush=True)
            print(f"  └── [SQL Query]: SELECT * FROM pets WHERE id = '{pet_id}'", flush=True)
            pet = db.query(Pet).filter(Pet.id == pet_id).first()
            if not pet:
                print(f"  └── [Kết quả]: Không tìm thấy thú cưng có ID {pet_id}", flush=True)
                print(f"{'='*70}\n", flush=True)
                return ""
            
            # Selectively extract fields to reduce context size
            allergies = [a.name for a in pet.allergies] if pet.allergies else []
            medications = [m.name for m in pet.medications] if pet.medications else []
            print(f"  └── [Kết quả]: Đã nạp hồ sơ bé '{pet.name}' ({pet.species})", flush=True)
            if allergies:
                print(f"      ├── Dị ứng: {', '.join(allergies)}", flush=True)
            if medications:
                print(f"      └── Đang dùng thuốc: {', '.join(medications)}", flush=True)
            print(f"{'='*70}\n", flush=True)
            
            context = f"Dữ liệu hồ sơ Pet (ID: {pet_id}):\n"
            context += f"- Tên: {pet.name}, Loài: {pet.species}, Tuổi: (Dựa theo ngày sinh {pet.dob})\n"
            if allergies:
                context += f"- Dị ứng: {', '.join(allergies)}\n"
            if medications:
                context += f"- Đang dùng thuốc: {', '.join(medications)}\n"
            return context
        except Exception as e:
            print(f"  └── [Lỗi truy vấn SQL pet]: {e}", flush=True)
            try:
                db.rollback()
            except Exception:
                pass
            return ""

    def _get_services_context(self, db: Session) -> str:
        if not db:
            return ""
        import time
        now = time.time()
        
        print(f"\n{'='*70}", flush=True)
        print(f"[RAG SQL PIPELINE] 🔍 Truy vấn dữ liệu dịch vụ phòng khám:", flush=True)
        print(f"  └── [SQL Query]: SELECT id, name, base_price, estimated_duration_minutes FROM services WHERE is_active = true", flush=True)
        
        if self._services_cache and (now - self._services_cache_time < 120.0):
            print(f"  └── [Kết quả]: Đã nạp từ Cache SQL RAG (dữ liệu tức thì < 1ms)", flush=True)
            print(f"{'='*70}\n", flush=True)
            return self._services_cache
        try:
            from app.models.appointment import Service
            services = db.query(Service).filter(Service.is_active == True).all()
            if not services:
                print(f"  └── [Kết quả]: Không có dịch vụ nào đang kích hoạt.", flush=True)
                print(f"{'='*70}\n", flush=True)
                return ""
            context = "DANH SÁCH DỊCH VỤ HIỆN CÓ CỦA PETCARE (Dùng để tư vấn và đặt lịch):\n"
            for s in services:
                context += f"- {s.name} (ID: {str(s.id)}) - Giá: {s.base_price}đ - Thời gian: {s.estimated_duration_minutes} phút. Danh mục: {s.category.value}\n"
            self._services_cache = context
            self._services_cache_time = now
            print(f"  └── [Kết quả]: Đã nạp thành công {len(services)} dịch vụ phòng khám vào Prompt Context", flush=True)
            print(f"{'='*70}\n", flush=True)
            return context
        except Exception as e:
            print(f"  └── [Lỗi truy vấn SQL services]: {e}", flush=True)
            return ""

    def _get_shop_context(self, db: Session) -> str:
        if not db:
            return ""
        import time
        now = time.time()
        
        print(f"\n{'='*70}", flush=True)
        print(f"[RAG SQL PIPELINE] 🔍 Truy vấn kho sản phẩm & thú cưng Siêu thị:", flush=True)
        print(f"  └── [SQL Query]: SELECT id, name, price, brand, stock_quantity FROM products WHERE category = 'PET' AND is_active = true", flush=True)
        
        if self._shop_cache and (now - self._shop_cache_time < 120.0):
            print(f"  └── [Kết quả]: Đã nạp từ Cache SQL RAG (dữ liệu tức thì < 1ms)", flush=True)
            print(f"{'='*70}\n", flush=True)
            return self._shop_cache
        try:
            from app.models.product import Product
            pets = db.query(Product).filter(Product.category == "PET", Product.is_active == True).all()
            if not pets:
                print(f"  └── [Kết quả]: Không có thú cưng nào đang mở bán.", flush=True)
                print(f"{'='*70}\n", flush=True)
                return ""
            context = f"DANH SÁCH THÚ CƯNG ĐANG MUA BÁN TẠI SIÊU THỊ PETCARE STORE (/shop) (Tổng cộng {len(pets)} giống thú cưng):\n"
            for p in pets:
                avail = f"Còn {p.stock_quantity} bé" if p.stock_quantity > 0 else "Tạm hết (có thể liên hệ đặt trước)"
                context += f"- {p.name}: Giá {p.price:,.0f}đ (Xuất xứ/Trại: {p.brand} - {avail})\n"
            context += "Chính sách: 100% thú cưng bán ra được tiêm đủ 2 mũi vắc-xin, tẩy giun, gắn microchip, bảo hành 30 ngày Care/Parvo và tặng gói khám tổng quát miễn phí!\n"
            self._shop_cache = context
            self._shop_cache_time = now
            print(f"  └── [Kết quả]: Đã nạp thành công {len(pets)} giống thú cưng Siêu thị vào Prompt Context", flush=True)
            print(f"{'='*70}\n", flush=True)
            return context
        except Exception as e:
            print(f"  └── [Lỗi truy vấn SQL shop]: {e}", flush=True)
            return ""

    async def stream_chat(self, request: AIChatRequest, db: Session = None, user_role: str = "customer") -> AsyncGenerator[str, None]:
        # 1. Intent Detection (Instant Fast Path for Greetings & Thanks)
        if self._detect_simple_intent(request.message):
            msg = request.message.strip().lower()
            if any(w in msg for w in ["cảm ơn", "cám ơn", "thanks", "thx"]):
                reply = "Dạ không có chi ạ! Nếu bạn cần tư vấn thêm bất cứ điều gì về sức khỏe, tiêm phòng hay dinh dưỡng cho bé cưng, cứ nhắn cho mình nhé!"
            elif any(w in msg for w in ["tạm biệt", "bye"]):
                reply = "Tạm biệt bạn! Chúc bạn và bé cưng luôn vui vẻ, nhiều sức khỏe và bình an nhé!"
            else:
                reply = "Xin chào! Mình là trợ lý AI chuyên về chăm sóc sức khỏe và dinh dưỡng thú cưng của PetCare. Bạn cần hỗ trợ gì về sổ sức khỏe hay lịch trình chăm sóc của bé cưng nhà mình ạ?"
            
            # Stream words with gentle micro-delay for natural typing feel (< 50ms total)
            words = reply.split(" ")
            for i, word in enumerate(words):
                if i > 0:
                    await asyncio.sleep(0.015)
                yield word + " "
            return

        # 2. Build Context (SQL / RAG Path)
        context_prompt = f"{self.system_prompt}\nUser Role: {user_role}\n"
        
        if request.pet_id and db:
            # Run DB query in a separate thread so it doesn't block the async event loop
            pet_context = await asyncio.to_thread(self._get_pet_context, db, request.pet_id)
            if pet_context:
                context_prompt += f"\n{pet_context}\n"
                
        if db:
            services_context = await asyncio.to_thread(self._get_services_context, db)
            if services_context:
                context_prompt += f"\n{services_context}\n"
            shop_context = await asyncio.to_thread(self._get_shop_context, db)
            if shop_context:
                context_prompt += f"\n{shop_context}\n"
                
        context_prompt += "\nCHỈ SỬ DỤNG thông tin trên nếu câu hỏi liên quan."
                
        messages = [{"role": "system", "content": context_prompt}]
        if request.messages:
            for m in request.messages:
                if m.get("role") in ["user", "assistant"]:
                    messages.append({"role": m.get("role"), "content": m.get("content", "")})
        else:
            messages.append({"role": "user", "content": request.message})

        # Fast Clinical Knowledge Matching (< 5ms)
        from app.ai.providers.mock_provider import MockProvider
        mock_reply = await MockProvider().chat(messages)
        default_fallback = "Mình là trợ lý chăm sóc thú cưng PetCare. Bạn có thể cho mình biết thêm thông tin về giống loài"
        if default_fallback not in mock_reply:
            words = mock_reply.split(" ")
            for i, word in enumerate(words):
                if i > 0:
                    await asyncio.sleep(0.003)
                yield word + " "
            return

        # 3. Stream Response
        try:
            async for chunk in self.provider.stream_chat(messages):
                yield chunk
        except Exception as e:
            yield f"Lỗi AI: {str(e)}"

import asyncio
from typing import List, Dict, Any
from app.ai.provider import AIProvider

class MockProvider(AIProvider):
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        last_message = messages[-1]["content"].lower() if messages else ""
        
        # 1. Out-of-scope requests: Business, revenue, inventory, HR (fine-tuning rule 7)
        if any(w in last_message for w in ["doanh thu", "lợi nhuận", "báo cáo tài chính", "kế toán", "lương nhân viên", "tính doanh thu", "bán hàng"]):
            return (
                "Xin lỗi bạn, mình là trợ lý AI chuyên về chăm sóc sức khỏe và dinh dưỡng thú cưng. "
                "Mình không xử lý các yêu cầu về nhân sự, doanh thu, kho hàng hay tài chính bán hàng của cửa hàng. "
                "Bạn vui lòng kiểm tra phân hệ Quản trị viên (Admin) hoặc Báo cáo để xem thông tin này nhé!"
            )

        # 2. Medication / Prescription denial (fine-tuning rule 4)
        if any(w in last_message for w in ["kê thuốc", "kê đơn", "cho uống thuốc gì", "mua thuốc gì", "dùng thuốc gì", "uống thuốc gì", "tự mua thuốc"]):
            return (
                "Mình không thể kê đơn thuốc, chỉ định liều dùng hoặc gợi ý thuốc điều trị cho thú cưng. "
                "Việc tự ý dùng thuốc (đặc biệt là thuốc của người) có thể gây ngộ độc và suy gan thận cấp. "
                "Bạn vui lòng đưa bé đến gặp bác sĩ thú y để được thăm khám trực tiếp và chẩn đoán chính xác nhé!"
            )

        # 3. Emergency cases: Breathing difficulty, seizures, collapse (fine-tuning rule 5)
        if any(w in last_message for w in ["khó thở", "thở dốc", "co giật", "bất tỉnh", "chảy máu nhiều", "ngộ độc", "hôn mê"]):
            return (
                "⚠️ ĐÂY LÀ DẤU HIỆU CẤP CỨU NGUY CẤP!\n"
                "1. Bạn hãy giữ bình tĩnh, đặt thú cưng ở nơi thoáng khí, giữ thẳng cổ để thông đường thở.\n"
                "2. Tuyệt đối không ép uống nước hay tự ý cho dùng bất kỳ loại thuốc nào.\n"
                "3. Hãy nhanh chóng đưa bé đến cơ sở thú y khẩn cấp gần nhất để được hỗ trợ thở oxy và cấp cứu kịp thời!"
            )

        # 4. Chocolate / Toxic food warnings (fine-tuning rule 5)
        if any(w in last_message for w in ["chocolate", "sô cô la", "socola", "hành tỏi", "nho", "hạt macca", "cafe"]):
            return (
                "Tuyệt đối KHÔNG cho chó hoặc mèo ăn chocolate hoặc thực phẩm này! Chất Theobromine và Caffeine trong chocolate "
                "gây độc tính rất mạnh lên hệ thần kinh và tim mạch của thú cưng, có thể dẫn đến co giật và tử vong. "
                "Nếu bé đã lỡ ăn phải, hãy liên hệ ngay với bác sĩ thú y, cung cấp loại thức ăn và khối lượng bé đã ăn để được hướng dẫn xử lý khẩn cấp."
            )

        # 4.0. Dog Aggression / Foaming at Mouth / Rabies risk warning
        if any(w in last_message for w in ["sủi bọt mép", "bọt mép", "gầm gừ", "chảy dãi nhiều", "bệnh dại", "lên cơn dại"]):
            return (
                "🚨 **CẢNH BÁO TÌNH HUỐNG NGUY HIỂM Ở CHÓ:**\n\n"
                "Hiện tượng chó **sủi bọt mép và gầm gừ khi thấy người lạ** là dấu hiệu bé đang ở trạng thái kích động tột độ hoặc có vấn đề bệnh lý nguy hiểm:\n\n"
                "1. **Tâm lý phòng thủ & Căng thẳng tột độ**: Khi cảm thấy lãnh thổ hoặc bản thân bị đe dọa, hệ thần kinh giao cảm kích thích tuyến nước bọt tiết ồ ạt kết hợp thở dốc tạo thành bọt mép. Tiếng gầm gừ là lời cảnh báo tấn công.\n"
                "2. **Nguy cơ Bệnh Dại (Rabies)**: Bệnh dại làm liệt cơ nuốt khiến nước bọt sùi trắng ở mép, tính khí thay đổi bất thường, sợ nước, sợ ánh sáng và hung dữ vô cớ. Đây là bệnh truyền nhiễm tử vong 100% lây sang người.\n"
                "3. **Ngộ độc hoặc Đau đớn thể xác**: Chó nuốt phải hóa chất/dị vật gây kích ứng khoang miệng, hoặc đang bị đau dữ dội nên phản ứng cắn xé tự vệ khi có người tiếp cận.\n\n"
                "🛡️ **Hành động an toàn ngay lúc này:**\n"
                "- **Tuyệt đối không nhìn thẳng vào mắt chó**, không la hét và không quay lưng bỏ chạy.\n"
                "- Lùi lại từ từ, giữ khoảng cách an toàn và dùng vật chắn (cửa, gậy, ba lô).\n"
                "- Nếu là chó nhà, cần cách ly bé vào chuồng an toàn và gọi ngay Bác sĩ Thú y qua hotline **0988 123 456** để được hỗ trợ khẩn cấp!"
            )

        # 4.1. SPECIALIZED DIET: Cat Kidney Stones (FLUTD/Struvite) & Dog Skin Allergies
        has_stone = any(w in last_message for w in ["sỏi thận", "sỏi tiết niệu", "sỏi bàng quang", "tiết niệu", "flutd", "struvite", "oxalate"])
        has_allergy = any(w in last_message for w in ["dị ứng", "dị ứng da", "viêm da dị ứng", "mẫn cảm da"])
        has_kibble_select = any(w in last_message for w in ["chọn loại hạt", "chọn hạt", "loại hạt phù hợp", "hạt phù hợp", "ăn hạt gì"])

        if (has_stone and has_allergy) or (has_kibble_select and (has_stone or has_allergy)):
            return (
                "Dạ đây là hướng dẫn chuẩn y khoa để lựa chọn loại thức ăn hạt trị liệu phù hợp nhất cho mèo bị sỏi thận/tiết niệu và chó bị dị ứng da ạ:\n\n"
                "🐱 **1. ĐỐI VỚI MÈO BỊ SỎI THẬN / HỘI CHỨNG TIẾT NIỆU (FLUTD, sỏi Struvite, Oxalate):**\n"
                "- **Dòng hạt chuyên dụng**: Sử dụng hạt trị liệu tiết niệu chuyên biệt như **Royal Canin Urinary S/O**, **Hill's Prescription Diet c/d**, hoặc **Monge VetSolution Urinary**.\n"
                "- **Cơ chế dinh dưỡng chuẩn y khoa**:\n"
                "  + **Kiểm soát khoáng chất**: Hàm lượng Magie (Mg) và Phốt pho (P) được giảm thiểu tối đa vì đây là 2 thành phần chính cấu tạo nên sỏi bàng quang.\n"
                "  + **Cân bằng độ pH nước tiểu**: Duy trì pH nước tiểu lý tưởng ở mức **6.2 – 6.5** nhằm hòa tan sỏi Struvite và ngăn chặn kết tinh Canxi Oxalate.\n"
                "  + **Kích thích bài tiết**: Tăng lượng nước tiểu giúp rửa trôi cặn bã trong bàng quang.\n"
                "- **Lời khuyên sống còn**: Mèo vốn có tập tính uống rất ít nước. Bạn **bắt buộc** phải kết hợp cho ăn Pate Urinary túi ướt, bổ sung đài phun nước hoặc ngâm mềm hạt để tăng lượng nước nạp vào hàng ngày.\n\n"
                "🐶 **2. ĐỐI VỚI CHÓ BỊ DỊ ỨNG DA / MẪN CẢM THỨC ĂN:**\n"
                "- **Dòng hạt chuyên dụng**:\n"
                "  + **Hạt đạm thủy phân (Hydrolyzed Protein)**: Như **Royal Canin Hypoallergenic**, **Hill's z/d**. Công nghệ thủy phân phân cắt protein thành các chuỗi peptide phân tử siêu nhỏ (< 10.000 Dalton), khiến hệ miễn dịch của chó không thể nhận diện được dị nguyên, từ đó triệt tiêu phản ứng dị ứng ngứa ngáy.\n"
                "  + **Hạt đơn đạm mới lạ (Novel Single-Protein)**: Chọn hạt có 1 nguồn đạm duy nhất mà bé chưa từng ăn (như cá hồi, thịt cừu, thịt hươu), tránh hoàn toàn thịt gà và thịt bò công nghiệp.\n"
                "- **Dưỡng chất hỗ trợ phục hồi da**:\n"
                "  + Bổ sung hàm lượng cao **Omega-3 (EPA/DHA từ dầu cá biển)** và **Kẽm/Biotin** giúp củng cố lớp màng lipid bảo vệ da, giảm viêm đỏ và chống rụng lông thứ phát.\n"
                "  + **Không chứa ngũ cốc (Grain-Free)** nếu bé có cơ địa mẫn cảm với gluten ngô/lúa mì.\n\n"
                "👉 Bạn có thể đặt mua các dòng hạt trị liệu chính hãng này tại [**PetCare Store (/shop)**](/shop) hoặc nhắn 'đặt lịch khám' để bác sĩ siêu âm kiểm tra kích thước sỏi và tình trạng da của bé nhé!"
            )

        if has_stone:
            return (
                "🐱 **Hướng dẫn chọn hạt cho mèo bị sỏi thận & tiết niệu (FLUTD / Struvite / Oxalate):**\n\n"
                "1. **Chọn dòng hạt điều trị chuyên khoa (Veterinary Diet)**: Chọn dòng **Royal Canin Urinary S/O** hoặc **Hill's Prescription Diet c/d**.\n"
                "2. **Cơ chế dinh dưỡng cần có**:\n"
                "- Kiểm soát chặt chẽ nồng độ Magie và Phốt pho (tiền chất tạo sỏi).\n"
                "- Điều chỉnh độ pH nước tiểu ở mức 6.2 – 6.5 giúp hòa tan sỏi Struvite và ức chế kết tinh Canxi Oxalate.\n"
                "- Tăng thể tích nước tiểu làm loãng cặn lắng đường tiết niệu.\n"
                "3. **Tăng cường uống nước**: Mèo lười uống nước là nguyên nhân hàng đầu gây sỏi. Cần kết hợp Pate ướt Urinary và đặt máy lọc nước tự động cho bé."
            )

        if has_allergy:
            return (
                "🐶 **Hướng dẫn chọn hạt cho chó bị dị ứng da & thức ăn:**\n\n"
                "1. **Ưu tiên hạt đạm thủy phân (Hydrolyzed)**: Như **Royal Canin Hypoallergenic** hoặc **Hill's z/d**. Protein đã được thủy phân phân tử siêu nhỏ để hệ miễn dịch không nhận diện được dị nguyên, chấm dứt cơn ngứa ngáy.\n"
                "2. **Hạt đơn đạm mới (Novel Single Protein)**: Chọn hạt cá hồi hoặc cừu nguyên chất, loại bỏ hoàn toàn đạm gà/bò và gluten ngũ cốc.\n"
                "3. **Bổ sung Omega-3 (EPA/DHA)**: Giúp kháng viêm tế bào da, làm dịu vết mẩn đỏ và phục hồi nang lông hư tổn."
            )
        # 4.2. Daily Feeding Ration / Grams Calculation by Weight (Mèo 3kg ăn bao nhiêu gram hạt/pate)
        has_ration = any(w in last_message for w in ["bao nhiêu gram", "bao nhiêu g", "khẩu phần", "lượng ăn", "ăn bao nhiêu", "cần ăn bao nhiêu", "mấy gram", "mấy g", "ăn bao nhiêu hạt", "ăn bao nhiêu pate"])
        if has_ration and any(w in last_message for w in ["mèo", "chó", "cún", "kg", "kí", "cân", "ngày", "bữa"]):
            import re
            m_weight = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|kí|cân)', last_message, re.IGNORECASE)
            weight = float(m_weight.group(1)) if m_weight else 3.0
            is_cat = any(w in last_message for w in ["mèo", "miu", "cat"]) or not any(w in last_message for w in ["chó", "cún", "dog"])

            if is_cat:
                rer = 70 * (weight ** 0.75)
                daily_kcal = round(rer * 1.2)
                kibble_grams = round(daily_kcal / 3.8)
                pate_grams = round(daily_kcal / 0.85)
                mixed_kibble = round(kibble_grams * 0.5)
                mixed_pate = round(pate_grams * 0.5)

                return (
                    f"Dạ đối với **Mèo nặng {weight:g} kg** (mèo trưởng thành nuôi trong nhà, mức vận động trung bình), "
                    f"nhu cầu năng lượng khuyến nghị khoảng **{daily_kcal} kcal/ngày**. Khẩu phần ăn tiêu chuẩn một ngày như sau ạ:\n\n"
                    f"🥣 **Phương án 1: Nếu cho ăn 100% thức ăn Hạt khô**\n"
                    f"- Cần khoảng **{kibble_grams - 5} – {kibble_grams + 5} gram hạt/ngày**.\n"
                    f"- Chia làm **2 – 3 bữa nhỏ** trong ngày. Nhớ luôn chuẩn bị sẵn bát nước sạch hoặc đài phun nước vì hạt khô chỉ chứa dưới 10% độ ẩm.\n\n"
                    f"🥫 **Phương án 2: Nếu cho ăn 100% Pate ướt**\n"
                    f"- Cần khoảng **{pate_grams - 15} – {pate_grams + 15} gram pate/ngày** (tương đương **1.5 – 2 gói/lon** loại 85g – 100g).\n"
                    f"- Chia làm **2 – 3 cữ ăn** trong ngày (không để pate ở nhiệt độ phòng quá 3 tiếng để tránh ôi thiu).\n\n"
                    f"✨ **Phương án 3: Chế độ kết hợp (Mixed Feeding — Khuyến nghị tốt nhất cho mèo)**\n"
                    f"- **{mixed_kibble} gram hạt khô** (đáp ứng năng lượng và giảm mảng bám răng).\n"
                    f"- Kèm **1 gói/lon pate {mixed_pate}g** (cung cấp 75–80% độ ẩm, bảo vệ đường tiết niệu và ngừa sỏi thận hiệu quả).\n\n"
                    f"💡 **Lưu ý**: Nếu bé đã triệt sản hoặc ít vận động thì bạn có thể giảm 10% khẩu phần; nếu là mèo con đang lớn cần tăng thêm 20–30% nhé!"
                )
            else:
                rer = 70 * (weight ** 0.75)
                daily_kcal = round(rer * 1.6)
                kibble_grams = round(daily_kcal / 3.7)
                return (
                    f"Dạ đối với **Chó nặng {weight:g} kg** (mức vận động trung bình), "
                    f"nhu cầu năng lượng khuyến nghị khoảng **{daily_kcal} kcal/ngày**. Khẩu phần ăn chuẩn một ngày như sau ạ:\n\n"
                    f"🥣 **Lượng hạt khô mỗi ngày**:\n"
                    f"- Cần khoảng **{kibble_grams - 10} – {kibble_grams + 10} gram hạt/ngày** (chia đều làm 2 bữa sáng - tối).\n"
                    f"🥫 **Nếu kết hợp thêm Pate/Thịt nạc**:\n"
                    f"- Bạn có thể cho ăn **{round(kibble_grams * 0.7)} gram hạt + 1 gói pate/100g thịt nạc luộc** trộn đều mỗi ngày.\n\n"
                    f"💡 Luôn để sẵn nước sạch cạnh bát ăn của bé bạn nhé!"
                )

        # 4.9. PET SALES & BREEDING CATALOG AT PETCARE STORE (/shop)
        if any(w in last_message for w in [
            "bao nhiêu thú cưng", "thú cưng để bán", "bán thú cưng", "mua thú cưng", "có bán thú cưng",
            "thú cưng shop có", "shop có bao nhiêu thú cưng", "có những thú cưng nào", "có pet nào",
            "mua chó", "mua mèo", "có bán chó", "có bán mèo", "có chó không", "có mèo không", 
            "giá chó", "giá mèo", "giá cún", "giá pet", "thú cưng thuần chủng", "có mà bạn ơi"
        ]):
            return (
                "Dạ chính xác bạn ơi! Hệ thống PetCare có phân hệ **Siêu thị Thú cưng [PetCare Store (/shop)](/shop)** chuyên nhân giống và kinh doanh các bé **Chó & Mèo thuần chủng** chất lượng cao ạ!\n\n"
                "Hiện tại trên hệ thống đang có **7 giống thú cưng thuần chủng** đang mở bán:\n\n"
                "🐶 **Các bé Cún thuần chủng (Trại giống PetCare VKA):**\n"
                "1. **Chó Corgi Pembroke Chân Ngắn Tri-Color**: **9.200.000đ** (Còn 1 bé)\n"
                "2. **Chó Golden Retriever Thuần Chủng (2.5 tháng tuổi)**: **8.500.000đ** (Còn 1 bé)\n"
                "3. **Chó Phốc Sóc Pomeranian Trắng Tuyết Mặt Gấu Mini**: **7.200.000đ** (Còn 1 bé)\n"
                "4. **Chó Poodle Tiny Nâu Đỏ Lông Xoăn Tít Không Rụng Lông**: **4.800.000đ** (Còn 3 bé)\n\n"
                "🐱 **Các bé Mèo thuần chủng (PetCare Cattery WCF):**\n"
                "5. **Mèo Ragdoll Thuần Chủng Mắt Xanh Biển Bicolor Quý Tộc**: **12.500.000đ** (Còn 1 bé)\n"
                "6. **Mèo Tai Cụp Scottish Fold Màu Bicolor Trắng Xám Siêu Xinh**: **7.800.000đ** (Còn 2 bé)\n"
                "7. **Mèo Anh Lông Ngắn (British Shorthair) Xám Xanh Má Phính**: **6.500.000đ** (Tạm hết - Đang nhận đặt cọc lứa mới)\n\n"
                "🛡️ **Quyền lợi & Cam kết vàng độc quyền tại PetCare:**\n"
                "- 100% bé đã được tiêm phòng đầy đủ 2 mũi vắc-xin và tẩy giun định kỳ.\n"
                "- Tặng kèm Sổ theo dõi sức khỏe, Hợp đồng bảo hành và gắn Microchip định danh.\n"
                "- **Bảo hành sức khỏe 30 ngày** đối với các bệnh truyền nhiễm nguy hiểm (Care & Parvo / Giảm bạch cầu FPV).\n"
                "- Tặng gói khám sức khỏe tổng quát và ưu đãi 10% trọn đời các dịch vụ Spa/Khám tại PetCare!\n\n"
                "👉 Bạn có thể ghé trực tiếp mục [**Siêu Thị PetCare (/shop)**](/shop) trên thanh điều hướng để xem ảnh chi tiết và đặt mua bé cưng nhé!"
            )

        # 5. Food prices / Kibble prices / Pate prices & Shopping
        if any(w in last_message for w in [
            "giá hạt", "giá pate", "giá thức ăn", "hạt bao nhiêu", "pate bao nhiêu", "giá súp", 
            "xin giá hạt", "báo giá hạt", "mua hạt", "mua pate", "mua thức ăn", "mua đồ", "phụ kiện", 
            "đồ chơi", "siêu thị thú cưng", "mua sắm", "hạt cho", "pate cho", "thức ăn hạt"
        ]):
            return (
                "Dạ PetCare gửi bạn bảng giá tham khảo các dòng thức ăn hạt và dinh dưỡng chính hãng tại **Siêu Thị PetCare Store** ạ:\n\n"
                "🥣 **Thức ăn hạt cho Chó:**\n"
                "- **Royal Canin** (Pháp - Chuyên biệt từng giống loài & độ tuổi): **145.000đ – 450.000đ** / gói (400g – 2kg)\n"
                "- **Ganador / Classic Pets** (Dòng giàu đạm phổ thông): **85.000đ – 220.000đ** / túi (1.5kg – 3kg)\n"
                "- **Zenith** (Hạt mềm bán ẩm Hàn Quốc, cực thơm ngon cho bé kén ăn): **190.000đ – 380.000đ** / gói (1.2kg)\n\n"
                "🐱 **Thức ăn hạt cho Mèo:**\n"
                "- **Royal Canin Kitten / Indoor / Hairball**: **150.000đ – 480.000đ** / gói (400g – 2kg)\n"
                "- **Reflex Plus / Minino Yum** (Đạm cao, ngừa sỏi thận & búi lông): **95.000đ – 260.000đ** / túi (1.2kg – 1.5kg)\n"
                "- **Catsrang** (Hàn Quốc - Dễ tiêu hóa): **110.000đ – 280.000đ** / gói (1.5kg – 5kg)\n\n"
                "🥫 **Pate & Súp thưởng dinh dưỡng:**\n"
                "- **Pate tươi The Pet / Monge / Nekko**: từ **18.000đ – 45.000đ** / lon (85g – 400g)\n"
                "- **Súp thưởng Ciao Churu / Inaba**: từ **35.000đ – 45.000đ** / thanh (4 gói)\n\n"
                "👉 Bạn có thể ghé trực tiếp [**Siêu Thị Thú Cưng (/shop)**](/shop) để đặt hàng và nhận ưu đãi freeship cho đơn từ 300.000đ nhé! "
                "Bé nhà bạn là chó hay mèo và được bao nhiêu tháng tuổi để mình tư vấn loại hạt phù hợp nhất ạ?"
            )

        # 6.0. Specific: Cat refusing Pate / Wet food refusal (Mèo không ăn pate)
        is_pate_query = any(w in last_message for w in ["không ăn pate", "không chịu ăn pate", "chê pate", "bỏ pate", "không thích pate", "tập ăn pate", "không ăn đồ ướt", "chê thức ăn ướt"]) or ("pate" in last_message and any(w in last_message for w in ["không ăn", "chê", "bỏ", "lười", "kén"]))
        if is_pate_query:
            return (
                "Dạ khi mèo cưng không chịu ăn pate, bạn đừng quá lo lắng nhé. Mèo là loài động vật có tập tính ăn uống cực kỳ nhạy cảm về mùi vị và kết cấu. Dưới đây là 5 giải pháp chuẩn y khoa thú y giúp kích thích bé ăn pate ngon miệng:\n\n"
                "1. 🔥 **Làm ấm pate trước khi cho ăn (Nhiệt độ lý tưởng 36–38°C)**:\n"
                "- Mèo có bản năng săn mồi, khứu giác của bé chỉ bị kích thích mạnh bởi thức ăn có nhiệt độ tương đương cơ thể con mồi (~37°C).\n"
                "- Pate bảo quản trong tủ lạnh hoặc để ngoài phòng bị nguội lạnh sẽ mất đi 80% mùi thơm béo ngậy.\n"
                "- **Cách làm**: Ngâm lon/gói pate vào bát nước nóng khoảng 5 phút (hoặc hâm lò vi sóng 5–7 giây ở mức rã đông, khuấy đều kiểm tra ấm tay) trước khi dọn ra cho bé.\n\n"
                "2. 🥣 **Đổi sang ĐĨA NÔNG vành phẳng (Tránh hội chứng mỏi râu - Whisker Fatigue)**:\n"
                "- Bộ râu của mèo là cơ quan xúc giác vô cùng nhạy cảm. Khi ăn thức ăn ướt trong bát sâu lòng, râu liên tục cọ xát vào thành bát gây đau và căng thẳng khiến mèo bỏ ăn.\n"
                "- Hãy đổi sang **đĩa sứ hoặc đĩa thủy tinh miệng phẳng nông vành** để bé thoải mái liếm thức ăn.\n\n"
                "3. 🥫 **Thay đổi Kết cấu (Texture) của Pate**:\n"
                "- Mỗi bé mèo có một 'gu' kết cấu hoàn toàn khác nhau:\n"
                "  + **Dạng sốt (Gravy)**: Nhiều nước sốt thơm sánh đậm đà (rất hợp với mèo thích liếm nước sốt).\n"
                "  + **Dạng thạch (Jelly)**: Thạch mềm dai thanh mát.\n"
                "  + **Dạng Mousse / Paté xay nhuyễn**: Mịn màng như kem, dễ nuốt.\n"
                "  + **Dạng thịt xé sợi (Shredded / Flaked)**: Thịt gà, cá ngừ xé sợi nguyên chất (như dòng Nekko, Monge, Ciao).\n"
                "- Nếu bé chê pate xay nhuyễn đóng hộp, bạn hãy thử đổi sang dạng thịt xé sốt hoặc súp thưởng xem sao nhé!\n\n"
                "4. ✨ **Dẫn dụ bằng mùi hương ưa thích (Topping)**:\n"
                "- Rắc một chút **bột ức gà sấy khô**, **cỏ mèo (catnip)** hoặc nhỏ vài giọt **súp thưởng Churu / dầu cá hồi** lên bề mặt đĩa pate để kích thích khứu giác.\n"
                "- Mẹo nhỏ: Quệt một chấm nhỏ pate lên đầu mũi hoặc mu bàn chân trước của bé — theo phản xạ liếm láp vệ sinh, bé sẽ liếm sạch và nhận ra mùi vị thơm ngon.\n\n"
                "5. ⏰ **Không để pate quá 30–45 phút ngoài không khí**:\n"
                "- Thức ăn ướt để ngoài môi trường rất nhanh bị se khô bề mặt, biến đổi mùi và lên men vi khuẩn. Nếu sau 30 phút bé không ăn, hãy cất đi để giữ vệ sinh đường ruột."
            )

        # 6.1. Specific: Kibble refusal (Chó mèo không chịu ăn hạt khô)
        is_kibble_query = any(w in last_message for w in ["không ăn hạt", "chê hạt", "bỏ hạt", "tập ăn hạt", "không chịu ăn hạt", "chán hạt"]) or ("hạt" in last_message and any(w in last_message for w in ["không ăn", "chê", "bỏ", "lười", "kén"]))
        if is_kibble_query:
            return (
                "Dạ khi bé cún hoặc mèo không chịu ăn hạt, bạn đừng quá lo lắng nhé. Dưới đây là các giải pháp dinh dưỡng và tập ăn hiệu quả chuẩn thú y:\n\n"
                "1. 🍲 **Ngâm mềm hoặc làm ấm hạt**:\n"
                "- Dùng nước ấm (40–50°C) hoặc nước hầm thịt/xương không nêm gia vị ngâm hạt khoảng 5–10 phút để dậy mùi thơm tự nhiên kích thích khứu giác của bé.\n\n"
                "2. 🥫 **Trộn thêm Pate hoặc men tiêu hóa**:\n"
                "- Trộn 1–2 thìa pate tươi (The Pet, Monge) hoặc súp thưởng vào hạt. Bạn cũng có thể rắc bột ức gà sấy để tăng vị hấp dẫn, sau đó giảm dần lượng pate khi bé đã quen ăn hạt.\n\n"
                "3. ⏰ **Thiết lập kỷ luật bữa ăn (Quy tắc 15–20 phút)**:\n"
                "- Đặt bát thức ăn xuống trong 15–20 phút. Nếu bé không ăn hoặc bỏ đi, hãy cất bát đi và không cho ăn vặt giữa bữa. Đến bữa tiếp theo mới dọn ra lại. Tuyệt đối không để hạt lưu cả ngày ngoài không khí làm hạt bị ỉu và mất mùi thơm.\n\n"
                "4. 🥣 **Đổi dòng hạt phù hợp hơn**:\n"
                "- Bé có thể đang bị ngấy vị cũ hoặc hạt quá cứng. Bạn có thể tham khảo dòng hạt mềm bán ẩm (như Zenith) hoặc hạt vị cá hồi/thịt bò thơm hơn.\n\n"
                "⚠️ **Lưu ý quan trọng**: Nếu bé bỏ ăn hoàn toàn trên 24 giờ kèm theo dấu hiệu **lừ đừ, nôn mửa, sốt hoặc tiêu chảy**, bạn cần đưa bé đến bác sĩ thú y ngay vì đây có thể là dấu hiệu bệnh lý đường ruột hoặc nhiễm khuẩn!"
            )

        # 6.2. General anorexia / Picky eating (Biếng ăn, bỏ bữa tổng quát)
        if any(w in last_message for w in [
            "kén ăn", "lười ăn", "chán ăn", "biếng ăn", "bỏ ăn", "bỏ bữa", 
            "không ăn gì", "không thèm ăn", "không ăn", "không chịu ăn"
        ]):
            return (
                "Dạ khi bé cún hoặc mèo có biểu hiện biếng ăn, kén ăn hoặc bỏ bữa, bạn nên kiểm tra và áp dụng các bước sau:\n\n"
                "1. 🩺 **Kiểm tra sức khỏe răng miệng & Thể trạng**:\n"
                "- Vạch nướu bé kiểm tra xem có bị viêm đỏ, nhiệt miệng, lung lay răng hay sưng họng không (đau răng là nguyên nhân số 1 khiến thú cưng đột ngột bỏ ăn).\n"
                "- Dùng nhiệt kế kiểm tra thân nhiệt: thân nhiệt bình thường của chó mèo là 38.0 – 39.2°C. Nếu bé bị sốt trên 39.5°C thì thường sẽ bỏ ăn hoàn toàn.\n\n"
                "2. 🍲 **Thay đổi thực đơn & Kích thích vị giác**:\n"
                "- Hâm ấm thức ăn ở 36–38°C để dậy mùi thơm tự nhiên.\n"
                "- Đổi sang nguồn đạm thơm ngon hơn (cá hồi, thịt gà luộc xé sợi, súp thưởng) hoặc bổ sung men vi sinh/gel dinh dưỡng Nutri-plus gel.\n\n"
                "3. ⏰ **Áp dụng kỷ luật bữa ăn**:\n"
                "- Dọn bát ăn trong 15–20 phút. Nếu bé không ăn thì cất đi, tuyệt đối không nuông chiều cho ăn xúc xích người hay bánh kẹo ngọt làm bé mất phản xạ đói.\n\n"
                "⚠️ **Cảnh báo khẩn cấp**: Nếu bé bỏ ăn hoàn toàn quá 24h (đối với mèo có nguy cơ thoái hóa gan nhiễm mỡ cấp tính) hoặc kèm nôn ói, tiêu chảy, hãy đưa bé đến phòng khám thú y kiểm tra ngay!"
            )

        # 7. Vaccination & Deworming (Prioritized over generic puppy/kitten care)
        if any(w in last_message for w in ["tiêm phòng", "tiêm vắc xin", "vắc-xin", "vắc xin", "vacxin", "tiêm mũi", "mũi tiêm", "lịch tiêm", "chích ngừa", "tiêm chủng"]):
            return (
                "Dạ lịch tiêm phòng đầy đủ và chuẩn y khoa cho **chó con và mèo con từ 2 đến 6 tháng tuổi** gồm các giai đoạn và mũi tiêm chi tiết như sau ạ:\n\n"
                "🐶 **1. LỊCH TIÊM PHÒNG CHO CHÓ CON (2 – 6 tháng tuổi):**\n"
                "- **Mũi 1 (Lúc 6 – 8 tuần tuổi, khoảng gần 2 tháng tuổi)**: Tiêm vắc-xin **5 bệnh** (phòng Parvovirus, Care, Viêm gan truyền nhiễm, Ho cũi chó do Adenovirus type 2, Cúm chó Parainfluenza).\n"
                "- **Mũi 2 (Lúc 9 – 11 tuần tuổi, khoảng 2.5 – 3 tháng tuổi)**: Cách mũi 1 từ 21 – 28 ngày (3 – 4 tuần). Tiêm vắc-xin **7 bệnh** (gồm 5 bệnh ở mũi 1 + bổ sung thêm 2 chủng vi khuẩn Leptospira lây sang người).\n"
                "- **Mũi 3 (Lúc 13 – 15 tuần tuổi, khoảng 3.5 – 4 tháng tuổi)**: Cách mũi 2 từ 21 – 28 ngày. Tiêm vắc-xin **7 bệnh nhắc lại** để hoàn thiện miễn dịch vững bền.\n"
                "- **Tiêm phòng Bệnh Dại (Rabies)**: Bắt buộc tiêm 1 mũi khi chó đủ **3 tháng tuổi trở lên** (có thể tiêm cùng ngày với mũi 3 ở vị trí khác hoặc cách 1 tuần).\n"
                "- **Từ 6 tháng tuổi trở đi & Định kỳ**: Sau khi hoàn tất phác đồ con, chỉ cần tiêm nhắc lại **hàng năm** 1 mũi 7 bệnh + 1 mũi Dại.\n\n"
                "🐱 **2. LỊCH TIÊM PHÒNG CHO MÈO CON (2 – 6 tháng tuổi):**\n"
                "- **Mũi 1 (Lúc 8 – 9 tuần tuổi, khoảng 2 tháng tuổi)**: Tiêm vắc-xin **4 bệnh** (hoặc 3 bệnh) gồm: Giảm bạch cầu FPV, Viêm mũi khí quản FHV-1, Hô hấp Calicivirus FCV và Chlamydia.\n"
                "- **Mũi 2 (Lúc 12 – 13 tuần tuổi, khoảng 3 tháng tuổi)**: Cách mũi 1 từ 21 – 28 ngày. Tiêm vắc-xin **4 bệnh nhắc lại**.\n"
                "- **Tiêm phòng Bệnh Dại (Rabies)**: Bắt đầu tiêm phòng Dại cho mèo từ đủ **3 tháng tuổi**.\n"
                "- **Mũi 3 (Lúc 16 tuần tuổi)**: Nhắc lại mũi 4 bệnh nếu bác sĩ đánh giá môi trường có nguy cơ lây nhiễm cao.\n"
                "- **Từ 6 tháng tuổi trở đi & Định kỳ**: Tiêm nhắc lại **hàng năm** 1 mũi vắc-xin tổng hợp mèo + 1 mũi Dại.\n\n"
                "💊 **Lịch tẩy giun bổ trợ:**\n"
                "- Dưới 6 tháng tuổi: Tẩy giun định kỳ **mỗi tháng 1 lần** (nên tẩy giun trước ngày tiêm vắc-xin 5–7 ngày để bé hấp thụ vắc-xin tốt nhất).\n\n"
                "⚠️ **Lưu ý quan trọng khi tiêm phòng:**\n"
                "1. Chỉ tiêm khi bé hoàn toàn khỏe mạnh, không sốt, không tiêu chảy hay nôn mửa.\n"
                "2. Sau khi tiêm: kiêng tắm ướt trong **7 ngày**, tránh gió lùa và không cho tiếp xúc với chó/mèo lạ khi chưa đủ mũi.\n"
                "3. Giữ bé lại phòng khám theo dõi 15–30 phút sau tiêm đề phòng phản ứng sốc thuốc.\n\n"
                "Bạn có muốn mình hỗ trợ kiểm tra sổ tiêm hoặc **đặt lịch tiêm phòng chính hãng** cho bé cưng tại PetCare ngay hôm nay không ạ?"
            )

        # 8. Deworming specific
        if any(w in last_message for w in ["tẩy giun", "sổ giun"]):
            return (
                "Dạ lịch tẩy giun định kỳ chuẩn thú y cho chó mèo như sau ạ:\n\n"
                "💊 **Chó mèo con dưới 6 tháng tuổi:**\n"
                "- Bắt đầu từ 2 tuần tuổi, sau đó tẩy giun vào tuần thứ 4, 6, 8.\n"
                "- Từ 2 đến 6 tháng tuổi: Tẩy giun định kỳ **1 tháng/lần**.\n\n"
                "💊 **Chó mèo trên 6 tháng tuổi & trưởng thành:**\n"
                "- Tẩy giun định kỳ **3 tháng/lần** (tối thiểu 2 lần/năm).\n\n"
                "⚠️ **Lưu ý**: Nên tẩy giun trước khi tiêm vắc-xin 5-7 ngày để cơ thể bé sinh kháng thể tốt nhất. Cho bé uống thuốc vào buổi sáng trước khi ăn."
            )

        # 9. Puppy / Kitten care guide (only when asking generally about caring/raising)
        if any(w in last_message for w in ["chăm sóc chó con", "chăm sóc cún con", "chăm sóc mèo con", "nuôi chó con", "nuôi mèo con", "chăm cún con", "cách nuôi chó con", "cách chăm sóc chó con"]):
            return (
                "Chăm sóc chó/mèo con gồm các bước cơ bản sau:\n"
                "1. Dinh dưỡng: Cho ăn thức ăn dành riêng cho chó con, chia thành 3-4 bữa nhỏ trong ngày, có thể ngâm mềm hạt bằng nước ấm.\n"
                "2. Giữ ấm: Giữ ổ nằm ấm áp, sạch sẽ, tránh gió lùa và hạn chế tắm ướt khi bé còn quá nhỏ.\n"
                "3. Phòng bệnh: Bắt đầu tiêm phòng vắc-xin mũi đầu từ 6-8 tuần tuổi và tẩy giun định kỳ.\n"
                "Bạn có thể cho mình biết thêm bé thuộc giống gì và hiện được bao nhiêu tháng tuổi không?"
            )

        # 10. Cat grooming / fur care
        if "lông mèo" in last_message or ("chăm sóc lông" in last_message and "mèo" in last_message):
            return (
                "Để chăm sóc lông mèo hiệu quả:\n"
                "1. Chải lông đều đặn bằng lược chải chuyên dụng để loại bỏ lông rụng, tránh mèo liếm phải tạo búi lông trong dạ dày.\n"
                "2. Kiểm tra da: Quan sát xem da có mẩn đỏ, vảy gàu hay dấu hiệu nấm da không.\n"
                "3. Bổ sung dinh dưỡng: Cung cấp thức ăn giàu Omega-3 và Omega-6 giúp nang lông bóng mượt và giảm rụng."
            )

        # 11.1. Sterilization / Spaying / Neutering (Triệt sản / Thiến)
        if any(w in last_message for w in ["triệt sản", "thiến", "cắt buồng trứng", "mấy tháng triệt sản", "bao nhiêu tháng triệt sản", "có nên triệt sản"]):
            return (
                "Dạ đây là thông tin chuẩn y khoa về **triệt sản cho chó và mèo** ạ:\n\n"
                "⏱️ **1. Độ tuổi triệt sản lý tưởng nhất:**\n"
                "- **Chó & Mèo**: Độ tuổi vàng là từ **5 – 6 tháng tuổi** (trước kỳ động dục/sa lơ đầu tiên của bé).\n"
                "- Lúc này cơ thể bé đã phát triển hoàn thiện khung xương, hệ miễn dịch tốt và tỷ lệ hồi phục vết thương cực nhanh.\n\n"
                "🛡️ **2. Lợi ích sức khỏe vượt trội:**\n"
                "- **Bé cái**: Triệt tiêu 100% nguy cơ viêm mủ tử cung (Pyometra - bệnh gây tử vong hàng đầu ở chó mèo già), giảm 95% nguy cơ ung thư vú và u buồng trứng.\n"
                "- **Bé đực**: Ngăn ngừa u xơ tuyến tiền liệt, ung thư tinh hoàn, giảm tính hung hăng, triệt tiêu thói quen bỏ nhà đi tìm bạn tình và thói quen tiểu bậy đánh dấu lãnh thổ.\n\n"
                "⚠️ **3. Lưu ý trước và sau phẫu thuật:**\n"
                "- **Trước phẫu thuật**: Nhịn ăn 6–8 tiếng, nhịn uống 2 tiếng trước giờ gây mê; tiêm phòng đủ các mũi cơ bản.\n"
                "- **Sau phẫu thuật**: Đeo loa chống liếm (E-collar) liên tục 7–10 ngày, giữ vết mổ khô ráo, hạn chế chạy nhảy và tái khám cắt chỉ sau 7 ngày.\n\n"
                "Phòng khám PetCare có phòng mổ vô trùng và máy theo dõi gây mê khí dung hiện đại. Bạn có muốn đặt lịch tư vấn và triệt sản an toàn cho bé không ạ?"
            )

        # 11.2. Infectious diseases: Care, Parvo, FPV (Giảm bạch cầu), FIP (Viêm phúc mạc)
        import re
        has_care_virus = bool(re.search(r'\b(bệnh care|dịch care|care chó|sài sốt)\b', last_message)) or (bool(re.search(r'\bcare\b', last_message)) and not re.search(r'\bpetcare\b', last_message))
        if has_care_virus or any(w in last_message for w in ["parvo", "giảm bạch cầu", "fpv", "fip", "viêm phúc mạc"]):
            return (
                "⚠️ **CẢNH BÁO: Đây là các bệnh truyền nhiễm do virus nguy hiểm hàng đầu ở chó mèo:**\n\n"
                "🐕 **Ở Chó: Phân biệt Care & Parvovirus:**\n"
                "- **Parvovirus (Viêm ruột truyền nhiễm)**: Nôn mửa liên tục ra dịch vàng/bọt trắng, tiêu chảy ồ ạt ra máu tươi mùi tanh khẳm đặc trưng, mất nước và trụy tim mạch rất nhanh.\n"
                "- **Care (Sài sốt chó)**: Sốt 2 pha, chảy dịch mủ mắt mũi đặc quánh, ho khẹc, tiêu chảy, sau đó tiến triển sang giai đoạn thần kinh (co giật hàm, giật chân, bại liệt, sừng hóa đệm chân).\n\n"
                "🐈 **Ở Mèo: Giảm bạch cầu (FPV) & Viêm phúc mạc (FIP):**\n"
                "- **FPV (Giảm bạch cầu)**: Sốt cao, nôn dịch vàng, tiêu chảy cấp, người rũ rượi, gập đầu vào bát nước nhưng không uống được.\n"
                "- **FIP (Viêm phúc mạc)**: Thể ướt (bụng chướng to tích dịch, khó thở do dịch tràn màng phổi), Thể khô (sốt dai dẳng, sụt cân, tổn thương màng bồ đào ở mắt hoặc thần kinh).\n\n"
                "🚨 **Hành động khẩn cấp**: Kháng sinh KHÔNG tiêu diệt được virus. Bạn cần cách ly bé ngay lập tức và đưa đến bệnh viện thú y để test nhanh, truyền dịch bù nước, bổ sung kháng thể và điều trị triệu chứng tích cực!"
            )

        # 11.3. Urinary Blockage / Hematuria (Mèo bí tiểu, tiểu ra máu, rặn tiểu)
        if any(w in last_message for w in ["bí tiểu", "tiểu ra máu", "tiểu máu", "tiểu khó", "rặn tiểu", "không tiểu được", "đi tiểu ít", "đái ra máu"]):
            return (
                "🚨 **ĐÂY LÀ TÌNH TRẠNG CẤP CỨU NIỆU KHOA NGUY HIỂM Ở MÈO (Đặc biệt là mèo đực)!**\n\n"
                "1. **Dấu hiệu nhận biết**: Mèo ngồi trong khay cát rặn lâu, kêu la đau đớn, chỉ rặn ra vài giọt nước tiểu hoặc nước tiểu có lẫn máu tươi, bụng dưới căng tròn cứng như quả bóng bàn.\n"
                "2. **Mức độ nguy hiểm**: Nếu bàng quang bị tắc nghẽn quá **24 – 48 giờ**, chất độc ure và kali sẽ ứ đọng ngược vào máu gây suy thận cấp, nhiễm độc toan chuyển hóa, vỡ bàng quang và ngừng tim tử vong.\n"
                "3. **Xử lý ngay lập tức**: Bạn **KHÔNG ĐƯỢC TỰ Ý ÉP BÉ UỐNG THUỐC**. Hãy đưa bé đến phòng khám thú y ngay để bác sĩ tiến hành gây mê đặt ống thông tiểu (thông bàng quang) giải phóng áp lực khẩn cấp!"
            )

        # 11.4. Dermatology: Itching, hair loss, fungus, scabies (Ngứa, rụng lông, nấm da, ghẻ Demodex/Sarcoptes)
        if any(w in last_message for w in ["ngứa", "gãi nhiều", "gãi liên tục", "rụng lông từng mảng", "vảy gàu", "mẩn đỏ da", "nấm da", "viêm da", "ghẻ", "demodex"]):
            return (
                "Dạ tình trạng ngứa gãi, rụng lông và mẩn đỏ ở thú cưng thường do 3 nhóm nguyên nhân chính sau:\n\n"
                "1. 🍄 **Nấm da (Ringworm - Microsporum canis)**: Vùng rụng lông hình tròn như đồng xu, da có vảy gàu trắng hoặc viền đỏ khô ráp. Bệnh này có thể lây sang người!\n"
                "2. 🪲 **Ký sinh trùng ngoài da (Ghẻ Demodex / Sarcoptes)**: Ghẻ Demodex thường rụng lông quanh mắt, sống mũi; ghẻ Sarcoptes gây ngứa dữ dội ở vành tai, khuỷu chân làm bé gãi chảy máu.\n"
                "3. 🥩 **Viêm da dị ứng thức ăn hoặc môi trường**: Da bụng mẩn đỏ li ti, liếm bàn chân liên tục.\n\n"
                "💡 **Phác đồ xử lý an toàn**:\n"
                "- Cho bé uống viên nhai diệt ký sinh trùng (Nexgard, Bravecto, Simparica) hoặc nhỏ gáy Revolution/Advocate.\n"
                "- Dùng sữa tắm trị nấm & viêm da chuyên dụng (chứa Chlorhexidine 2% + Ketoconazole 1%), tắm 2 lần/tuần và ngâm bọt 10 phút trước khi xả.\n"
                "- Đeo loa chống liếm để ngăn bé gãi rách da gây nhiễm trùng thứ phát.\n"
                "- Nên đưa bé đi cạo vảy da soi kính hiển vi để xác định chính xác loại nấm hay ghẻ."
            )

        # 11.5. Bathing frequency & Cat bathing (Bao lâu tắm một lần, có nên tắm cho mèo)
        if any(w in last_message for w in ["bao lâu tắm một lần", "bao lâu tắm 1 lần", "mấy ngày tắm", "có nên tắm cho mèo", "mèo có cần tắm", "bao lâu nên tắm"]):
            return (
                "Dạ tần suất tắm chuẩn thú y cho chó và mèo như sau ạ:\n\n"
                "🐶 **Đối với Chó**:\n"
                "- **Tần suất**: **1 – 2 tuần/lần** (tùy vào mức độ vận động và độ dài của lông).\n"
                "- Không nên tắm quá thường xuyên (như tắm hàng ngày) vì sẽ làm trôi lớp dầu tự nhiên bảo vệ da, khiến lông xơ xác và da dễ bị khô ngứa, bong tróc.\n\n"
                "🐱 **Đối với Mèo**:\n"
                "- **Tần suất**: **1 – 2 tháng/lần** hoặc chỉ khi lông thực sự dính bẩn/có mùi hôi.\n"
                "- Mèo có gai lưỡi đặc biệt và dành từ 30–50% thời gian trong ngày để tự liếm chải lông sạch sẽ. Mèo lại rất sợ nước và dễ bị stress hạ thân nhiệt.\n"
                "- **Giải pháp thay thế**: Dùng bọt tắm khô chuyên dụng (Waterless Shampoo) xịt lau khăn ấm hoặc chải lông hàng ngày thay vì tắm ướt.\n\n"
                "⚠️ **Các trường hợp TUYỆT ĐỐI KIÊNG TẮM ƯỚT**:\n"
                "- Bé mới tiêm phòng vắc-xin trong vòng 7 ngày.\n"
                "- Chó mèo sơ sinh dưới 2 tháng tuổi.\n"
                "- Thú cưng đang bị sốt, cảm lạnh, tiêu chảy hoặc vừa phẫu thuật chưa cắt chỉ."
            )

        # 11. Fleas / Ticks / Parasites
        if any(w in last_message for w in ["ve chó", "bọ chét", "rận", "trị ve", "nhỏ gáy", "ve rận"]):
            return (
                "Để phòng ngừa và tiêu diệt ve rận, bọ chét cho thú cưng hiệu quả:\n"
                "1. **Nhỏ gáy định kỳ**: Dùng thuốc nhỏ gáy đặc trị như Frontline, Revolution hoặc viên nhai Nexgard định kỳ mỗi 1-2 tháng.\n"
                "2. **Vệ sinh môi trường sống**: Giặt sấy đệm nằm của bé và hút bụi các góc nhà, vì trứng ve thường rơi ở sàn nhà.\n"
                "3. **Tắm vệ sinh chuyên dụng**: Dùng sữa tắm trị ký sinh trùng để làm sạch ve bám ngoài da.\n"
                "Bạn có thể ghé mục Dịch vụ Spa của PetCare để bé được vệ sinh khử ve rận trọn gói nhé!"
            )

        # 12. Clinic price list / Services pricing
        if any(w in last_message for w in ["bảng giá", "giá dịch vụ", "chi phí", "bao nhiêu tiền", "giá tiêm", "giá tắm", "khám hết bao nhiêu", "giá khám", "giá spa"]):
            return (
                "Dạ PetCare công khai minh bạch bảng giá các dịch vụ chuẩn thú y như sau ạ:\n\n"
                "1. 🩺 **Khám tổng quát sức khỏe**: 150.000đ – 250.000đ\n"
                "2. 💉 **Tiêm phòng vắc-xin**: từ 200.000đ (Vắc-xin Dại: 120.000đ, Vắc-xin 7 bệnh: 350.000đ)\n"
                "3. 🛁 **Tắm vệ sinh & Spa trọn gói**: từ 150.000đ (tùy theo thể trọng bé)\n"
                "4. ✂️ **Cắt tỉa lông tạo hình (Grooming)**: từ 300.000đ\n"
                "5. 🔬 **Siêu âm / Xét nghiệm máu tổng quát**: từ 250.000đ\n\n"
                "Bạn muốn đặt lịch cho bé khám hoặc spa vào ngày nào để mình hỗ trợ giữ chỗ nhé!"
            )

        # 13. Hotline / Contact inquiry
        if any(w in last_message for w in ["hotline", "số điện thoại", "sđt", "điện thoại", "liên hệ", "gọi", "tổng đài", "cứu hộ"]):
            return (
                "Dạ thông tin liên hệ chính thức của **PetCare AI & Bệnh viện Thú y** đây ạ:\n\n"
                "📞 **Hotline tư vấn & Đặt lịch**: **1900 8888** (08:00 – 21:00 hàng ngày)\n"
                "🚨 **Đường dây nóng Cấp cứu Thú y 24/7**: **0988 123 456** (Trực đêm & Khẩn cấp)\n"
                "🏥 **Địa chỉ Bệnh viện**: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh\n"
                "🌐 **Siêu thị mua sắm online**: [PetCare Store](/shop)\n\n"
                "Bạn cần hỗ trợ đặt lịch hẹn khám hay tư vấn tình trạng của bé cưng ngay bây giờ không ạ?"
            )

        # 14. Address / Location / Opening hours
        if any(w in last_message for w in ["địa chỉ", "ở đâu", "vị trí", "chi nhánh", "mấy giờ", "giờ mở cửa", "giờ làm việc", "thời gian làm việc"]):
            return (
                "Bệnh viện & Siêu thị thú cưng **PetCare Central Hospital** hân hạnh đón tiếp bạn tại:\n\n"
                "📍 **Địa chỉ**: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh\n"
                "⏰ **Thời gian làm việc**:\n"
                "- Dịch vụ Khám bệnh, Tiêm phòng & Spa: **08:00 – 21:00** tất cả các ngày (kể cả Thứ 7, Chủ Nhật & Ngày lễ)\n"
                "- Cấp cứu thú y & Điều trị nội trú: **24/7 toàn thời gian**\n"
                "📞 Hotline hỗ trợ: **1900 8888** hoặc **0988 123 456**"
            )

        # 15. Doctors / Medical Team
        if any(w in last_message for w in ["bác sĩ", "ai khám", "đội ngũ", "chuyên gia"]):
            return (
                "Đội ngũ y bác sĩ tại PetCare gồm các chuyên gia hàng đầu giàu kinh nghiệm:\n\n"
                "- 🩺 **BS. Trần Văn Bác** — Chuyên khoa Chẩn đoán hình ảnh & Nội khoa thú y\n"
                "- 🩺 **BS. Nguyễn Thú Y** — Chuyên khoa Ngoại khoa & Tiêm chủng vắc-xin dự phòng\n"
                "- 🐾 **Đội ngũ Điều dưỡng chuyên nghiệp** — Tận tình túc trực chăm sóc 24/7\n\n"
                "Bạn có thể đặt lịch hẹn khám đích danh bác sĩ tại phòng khám hoặc gọi hotline **1900 8888** nhé!"
            )

        # 16. Thanks / Politeness
        if any(w in last_message for w in ["cảm ơn", "cám ơn", "thank", "tks"]):
            return "Dạ không có gì ạ! Chúc bạn và bé yêu luôn luôn khỏe mạnh và vui tươi. Nếu cần hỗ trợ thêm bất cứ điều gì, bạn cứ nhắn cho mình nhé! ❤️🐾"

        # 17. Bathing trouble / cannot bathe / water fear
        if any(w in last_message for w in ["không tắm được", "chưa tắm được", "sợ nước", "sợ tắm", "tắm khô", "không chịu tắm"]):
            return (
                "Dạ nếu bé cưng hiện tại **không thể tắm bằng nước** (do bé sợ nước, đang ốm, mới tiêm phòng hoặc trời lạnh), bạn có thể áp dụng các giải pháp chăm sóc thay thế sau nhé:\n\n"
                "1. **Dùng bọt/xịt tắm khô thú cưng (Waterless Shampoo)**: Xịt bọt lên lông, massage đều khắp mình rồi lấy khăn bông lau sạch. Vừa khử mùi hôi hiệu quả vừa không cần dùng nước.\n"
                "2. **Lau người bằng khăn ấm**: Nhúng khăn vào nước ấm, vắt thật kiệt nước (chỉ để khăn hơi ẩm), lau ngược chiều lông rồi dùng máy sấy hong khô nhẹ nhàng.\n"
                "3. **Khăn ướt chuyên dụng cho thú cưng**: Vệ sinh sạch sẽ vùng kẽ móng chân, đệm bàn chân, khóe mắt và hậu môn.\n"
                "4. **Chải lông hàng ngày**: Giúp lấy đi lông chết, bụi đất và giảm mùi hôi đáng kể.\n\n"
                "Bạn có thể chia sẻ thêm lý do bé chưa tắm được (bé sợ nước, mới tiêm phòng hay đang mệt) để mình tư vấn cụ thể hơn nhé!"
            )

        # 18. Service booking: ONLY when explicitly requested to book
        if any(w in last_message for w in ["đặt lịch", "book lịch", "hẹn lịch", "lên lịch khám", "đăng ký dịch vụ", "đặt hẹn"]):
            from datetime import datetime, timedelta
            import re
            tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

            # Determine appropriate service
            service_id = "0e715dcd-760b-4646-bef0-18d4d4a266e6"
            service_name = "Tắm sấy cơ bản"
            if any(w in last_message for w in ["tiêm", "vaccine", "chích"]):
                service_id = "e1736533-26c0-4a3c-a65c-a25324b699bf"
                service_name = "Tiêm phòng vaccine"
            elif any(w in last_message for w in ["khám", "bác sĩ", "kiểm tra", "tổng quát", "bệnh"]):
                service_id = "c041be35-fbec-4b6f-9540-64bf289ccd44"
                service_name = "Khám sức khỏe tổng quát"
            elif any(w in last_message for w in ["lưu chuồng", "khách sạn", "gửi bé", "nội trú"]):
                service_id = "5df2169e-574f-4e97-8fea-5e7e78d7baf5"
                service_name = "Lưu chuồng ban ngày"

            # Dynamically extract pet name from user message
            stop_words = {'mình', 'tôi', 'em', 'anh', 'chị', 'ngày', 'lúc', 'thú', 'pet', 'cưng', 'nhé', 'nha', 'ạ', 'giúp', 'đi'}
            cleaned_text = re.sub(r'\s+(?:ngày|lúc|vào|hôm|nhé|nha|ạ|đi|giúp|với)[\s\S]*$', '', last_message, flags=re.IGNORECASE)
            m = re.search(r'(?:cho|của)\s+(?:bé\s+|con\s+|chó\s+|mèo\s+|em\s+)?([A-Za-z0-9À-ỹ]+(?:\s+[A-Za-z0-9À-ỹ]+)*)', cleaned_text, re.IGNORECASE)

            pet_name = ""
            if m:
                raw_words = m.group(1).strip().split()
                filtered = [w for w in raw_words if w.lower() not in stop_words]
                if filtered:
                    pet_name = ' '.join(filtered).title()

            # Match known demo pet IDs if applicable, or leave empty for frontend auto-match/create
            pet_id = ""
            if pet_name.lower() == "milo":
                pet_id = "6ad90c56-8c70-4b92-b183-517d11106155"
            elif pet_name.lower() == "luna":
                pet_id = "37d2f941-db06-4fd0-b30e-5f2254ccc5db"
            elif pet_name.lower() == "đen":
                pet_id = "77322ada-a985-4510-b31d-b0612bcc235e"

            display_target = f" cho bé **{pet_name}**" if pet_name else ""

            return (
                f"Tuyệt vời, mình đã chuẩn bị thông tin đặt lịch dịch vụ **{service_name}**{display_target}. "
                f"Bạn có thể chọn thú cưng hoặc nhập tên bé, điều chỉnh ngày giờ rồi bấm 'Xác nhận' bên dưới nhé!\n"
                f'<<<ACTION:book_appointment:{{"service_id":"{service_id}", "service_name":"{service_name}", "pet_id":"{pet_id}", "pet_name":"{pet_name}", "date":"{tomorrow}", "time":"09:00"}}>>>'
            )
        
        # 19. Bathing / Grooming general tips
        if any(w in last_message for w in ["tắm", "grooming", "spa", "vệ sinh lông"]):
            return (
                "Để tắm cho bé cưng sạch sẽ và an toàn, bạn nên lưu ý:\n"
                "- Dùng sữa tắm chuyên dụng cho thú cưng (độ pH da chó mèo khác người).\n"
                "- Dùng nước ấm vừa phải, tránh xối nước trực tiếp vào mắt và tai bé.\n"
                "- Sấy lông thật khô ngay sau khi tắm để tránh nấm da và cảm lạnh.\n\n"
                "Nếu bạn muốn cho bé trải nghiệm dịch vụ tắm & spa trọn gói tại PetCare, bạn có thể nhắn 'đặt lịch tắm' để mình hỗ trợ nhé!"
            )

        # 20. Questions about schedule
        if any(w in last_message for w in ["lịch gì", "lịch nào", "lịch hẹn gì", "hả lịch"]):
            return "Dạ bạn có thể kiểm tra danh sách lịch khám hoặc tiêm chủng của bé trong mục 'Lịch hẹn' trên hệ thống. Nếu bạn cần hỗ trợ đặt lịch hẹn mới, bạn cứ nhắn cho mình nhé!"

        if any(w in last_message for w in ["lịch hẹn", "tiêm chủng", "khám định kỳ"]):
            return "Bé có lịch chăm sóc và tiêm chủng định kỳ. Bạn có muốn kiểm tra chi tiết hoặc đặt lịch mới không?"

        # 21. Standalone Greetings: only when explicitly greeting as a short standalone phrase
        import re
        if re.search(r'\b(chào|xin chào|hello|hi|hey)\b', last_message) and len(last_message.split()) <= 4:
            return "Chào bạn! Mình là trợ lý AI chăm sóc thú cưng PetCare. Bạn cần tư vấn về dinh dưỡng, vệ sinh hay sức khỏe của bé cưng?"
        
        return "Mình là trợ lý chăm sóc thú cưng PetCare. Bạn có thể cho mình biết thêm thông tin về giống loài (chó/mèo), độ tuổi hoặc triệu chứng cụ thể của bé để mình tư vấn chính xác hơn nhé!"
        
    async def stream_chat(self, messages: List[Dict[str, str]], **kwargs):
        full_text = await self.chat(messages, **kwargs)
        words = full_text.split(" ")
        for i, word in enumerate(words):
            if i > 0:
                await asyncio.sleep(0.005)
            yield word + " "

    async def generate_structured(self, messages: List[Dict[str, str]], schema: Any, **kwargs) -> Dict[str, Any]:
        return {"result": "success", "mocked": True}


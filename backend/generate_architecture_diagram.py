import os
from PIL import Image, ImageDraw, ImageFont

def draw_system_architecture():
    # 1920 x 1160 Full HD+ resolution for presentation slides and thesis report
    width = 1920
    height = 1160
    img = Image.new("RGBA", (width, height), (248, 250, 252, 255)) # Soft slate background #f8fafc
    draw = ImageDraw.Draw(img)

    # Fonts
    font_bold = "/app/arialbd.ttf"
    font_reg = "/app/arial.ttf"
    if not os.path.exists(font_bold):
        font_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        font_reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

    header_font = ImageFont.truetype(font_bold, 34)
    sub_font = ImageFont.truetype(font_reg, 16)
    layer_title_font = ImageFont.truetype(font_bold, 16)
    card_title_font = ImageFont.truetype(font_bold, 16)
    card_sub_font = ImageFont.truetype(font_bold, 13)
    card_desc_font = ImageFont.truetype(font_reg, 13)
    card_badge_font = ImageFont.truetype(font_bold, 11)
    footer_font = ImageFont.truetype(font_bold, 14)

    # 1. Header
    draw.text((width // 2, 40), "SƠ ĐỒ KIẾN TRÚC TỔNG THỂ HỆ THỐNG PETCARE AI", font=header_font, fill=(14, 56, 122), anchor="mm")
    draw.text((width // 2, 78), "Mô hình đa tầng phân tán (Micro-services) bảo mật, xử lý nhanh dưới 10 giây và đạt chuẩn an toàn y tế", font=sub_font, fill=(100, 116, 139), anchor="mm")

    # Helper function to draw rounded card with ample internal space
    def draw_card(x, y, w, h, bg_color, border_color, title, subtitle, items=[], badge=""):
        draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=bg_color, outline=border_color, width=2)
        
        # Badge
        cur_y = y + 12
        if badge:
            bbox = draw.textbbox((0, 0), badge, font=card_badge_font)
            bw = bbox[2] - bbox[0] + 16
            draw.rounded_rectangle([x + 14, cur_y, x + 14 + bw, cur_y + 20], radius=5, fill=border_color)
            draw.text((x + 14 + bw // 2, cur_y + 10), badge, font=card_badge_font, fill=(255, 255, 255), anchor="mm")
            cur_y += 26
        
        # Title
        draw.text((x + 14, cur_y), title, font=card_title_font, fill=(15, 23, 42))
        cur_y += 22
        
        # Subtitle
        if subtitle:
            draw.text((x + 14, cur_y), subtitle, font=card_sub_font, fill=border_color)
            cur_y += 20
            
        # Divider
        draw.line([x + 14, cur_y, x + w - 14, cur_y], fill=(226, 232, 240), width=1)
        cur_y += 10

        # Items
        for item in items:
            draw.ellipse([x + 16, cur_y + 4, x + 22, cur_y + 10], fill=border_color)
            draw.text((x + 28, cur_y), item, font=card_desc_font, fill=(51, 65, 85))
            cur_y += 19

    # Layer Header tag with dynamic width
    def draw_layer_tag(y, label, color):
        bbox = draw.textbbox((0, 0), label, font=layer_title_font)
        tw = bbox[2] - bbox[0] + 36
        draw.rounded_rectangle([60, y, 60 + tw, y + 32], radius=6, fill=color)
        draw.text((60 + tw // 2, y + 16), label, font=layer_title_font, fill=(255, 255, 255), anchor="mm")
        draw.line([60 + tw + 15, y + 16, width - 60, y + 16], fill=(226, 232, 240), width=2)

    # -------------------------------------------------------------
    # TẦNG 1: NGƯỜI DÙNG & GIAO DIỆN KHÁCH HÀNG (Y = 115)
    # -------------------------------------------------------------
    draw_layer_tag(115, "1. NGƯỜI DÙNG (USERS)", (37, 99, 235))

    user_cards = [
        {"role": "Khách hàng (Customer)", "desc": "Chủ nuôi thú cưng", "items": ["Chat với Trợ lý AI PetCare 24/7", "Tra cứu Sổ tiêm & Pet Passport", "Thẻ QR khẩn cấp & Đặt lịch khám"], "badge": "WEB & MOBILE"},
        {"role": "Bác sĩ (Doctor / EMR)", "desc": "Bác sĩ chuyên khoa", "items": ["Bệnh án điện tử EMR chuẩn y khoa", "Kê đơn thuốc tự động trừ kho", "Khám từ xa Telehealth Video Call"], "badge": "LÂM SÀNG"},
        {"role": "Lễ tân (Receptionist)", "desc": "Tiếp đón & Thu ngân", "items": ["Check-in bệnh nhân nhanh", "Điều phối phòng khám thông minh", "Thanh toán VietQR Napas247"], "badge": "SẢNH TIẾP ĐÓN"},
        {"role": "Điều dưỡng (Caregiver)", "desc": "Chăm sóc nội trú & Spa", "items": ["Live Care theo dõi ca trực", "Cập nhật thân nhiệt, ăn uống", "AI Care Brief tóm tắt tự động"], "badge": "NỘI TRÚ"},
        {"role": "Quản trị viên (Admin)", "desc": "Chủ phòng khám & Quản lý", "items": ["Phân quyền 5 vai trò (RBAC)", "Quản lý kho dược & vật tư y tế", "Báo cáo doanh thu BI Analytics"], "badge": "ĐIỀU HÀNH"}
    ]

    card_w = 345
    card_h = 160
    start_x = 60
    spacing_x = 16

    for i, u in enumerate(user_cards):
        cx = start_x + i * (card_w + spacing_x)
        draw_card(cx, 160, card_w, card_h, (255, 255, 255), (37, 99, 235), u["role"], u["desc"], u["items"], u["badge"])

    # Connecting arrows Layer 1 -> Layer 2
    for i in range(5):
        cx = start_x + i * (card_w + spacing_x) + card_w // 2
        draw.line([cx, 325, cx, 355], fill=(37, 99, 235), width=3)
        draw.polygon([(cx, 362), (cx - 5, 353), (cx + 5, 353)], fill=(37, 99, 235))

    # -------------------------------------------------------------
    # TẦNG 2: GIAO DIỆN ỨNG DỤNG (Next.js 16) - Y = 375
    # -------------------------------------------------------------
    draw_layer_tag(375, "2. GIAO DIỆN (FRONTEND NEXT.JS)", (124, 58, 237))

    fe_cards = [
        {"title": "Giao Diện Người Dùng (Next.js 16)", "sub": "React 19 + TypeScript + TailwindCSS", "items": ["Thiết kế giao diện trực quan, thân thiện cho mọi lứa tuổi", "Mượt mà trên cả máy tính, máy tính bảng và điện thoại", "Tối ưu hóa tải trang cực nhanh với Turbopack SSR"], "badge": "PRESENTATION LAYER", "w": 580},
        {"title": "Kênh Tương Tác Trực Tuyến (Realtime Client)", "sub": "WebSockets & WebRTC P2P Video Call", "items": ["Truyền nhận thông báo tức thời giữa Lễ tân và Bác sĩ", "Gia chủ nhận cập nhật Live Care từ phòng nội trú", "Cuộc gọi video Telehealth sắc nét, không có độ trễ"], "badge": "REALTIME LAYER", "w": 580},
        {"title": "Bảo Mật & Định Tuyến (Security Gateway)", "sub": "Xác thực JWT + Kiểm soát 5 vai trò (RBAC)", "items": ["Mã hóa dữ liệu an toàn, chống truy cập trái phép", "Phân định quyền hạn rõ ràng giữa các bộ phận", "Ngăn chặn rò rỉ dữ liệu y bạ bệnh nhân"], "badge": "SECURITY LAYER", "w": 580}
    ]

    fe_spacing = 30
    for i, fc in enumerate(fe_cards):
        cx = start_x + i * (fc["w"] + fe_spacing)
        draw_card(cx, 420, fc["w"], card_h, (255, 255, 255), (124, 58, 237), fc["title"], fc["sub"], fc["items"], fc["badge"])

    # Connecting arrows Layer 2 -> Layer 3
    for i in range(3):
        cx = start_x + i * (580 + fe_spacing) + 290
        draw.line([cx, 585, cx, 615], fill=(124, 58, 237), width=3)
        draw.polygon([(cx, 622), (cx - 5, 613), (cx + 5, 613)], fill=(124, 58, 237))

    # -------------------------------------------------------------
    # TẦNG 3: MÁY CHỦ XỬ LÝ & BỘ NÃO AI (FastAPI) - Y = 635
    # -------------------------------------------------------------
    draw_layer_tag(635, "3. MÁY CHỦ XỬ LÝ & BỘ NÃO AI (BACKEND)", (13, 148, 136))

    ai_cards = [
        {"title": "Máy Chủ Xử Lý Chính (FastAPI API)", "sub": "Python 3.12 Asynchronous (AsyncIO)", "items": ["Xử lý toàn bộ logic khám bệnh, kê đơn và viện phí", "Tốc độ xử lý hàng ngàn yêu cầu cùng lúc không nghẽn", "Chuẩn hóa API RESTful kết nối thông suốt đa nền tảng"], "badge": "CORE BACKEND API", "w": 580},
        {"title": "Bộ Não AI PetCare (AI Orchestrator)", "sub": "Điều phối Trí tuệ Nhân tạo Thông minh", "items": ["Tự động nhúng giống loài, tuổi, cân nặng vào ngữ cảnh", "Đọc ảnh Sổ tiêm chủng (Vision OCR) trích xuất dữ liệu", "Phản hồi siêu tốc trong 0.03 giây với kiến thức thú y"], "badge": "AI ENGINE", "w": 580},
        {"title": "Khung An Toàn Y Khoa (Clinical Guardrails)", "sub": "3 Chốt chặn bảo vệ tính mạng thú cưng", "items": ["Chốt 1: Giữ hội thoại đúng chuyên môn thú y", "Chốt 2: Nhận diện nguy kịch, kích hoạt cấp cứu đỏ 24/7", "Chốt 3: Tuyệt đối không tự ý kê đơn thuốc kháng sinh"], "badge": "CLINICAL SAFETY", "w": 580}
    ]

    for i, ac in enumerate(ai_cards):
        cx = start_x + i * (ac["w"] + fe_spacing)
        draw_card(cx, 680, ac["w"], card_h, (255, 255, 255), (13, 148, 136), ac["title"], ac["sub"], ac["items"], ac["badge"])

    # Connecting arrows Layer 3 -> Layer 4
    for i in range(3):
        cx = start_x + i * (580 + fe_spacing) + 290
        draw.line([cx, 845, cx, 875], fill=(13, 148, 136), width=3)
        draw.polygon([(cx, 882), (cx - 5, 873), (cx + 5, 873)], fill=(13, 148, 136))

    # -------------------------------------------------------------
    # TẦNG 4: DỮ LIỆU & DỊCH VỤ NGOẠI VI (PostgreSQL / Redis / Celery) - Y = 895
    # -------------------------------------------------------------
    draw_layer_tag(895, "4. CƠ SỞ DỮ LIỆU & DỊCH VỤ NGOẠI VI", (16, 185, 129))

    db_cards = [
        {"title": "Cơ Sở Dữ Liệu (PostgreSQL 16)", "sub": "Chuẩn hóa 3NF với 34 bảng quan hệ", "items": ["Lưu an toàn hồ sơ bệnh án, lịch tiêm, thuốc", "Toàn vẹn dữ liệu lâm sàng và giao dịch", "Truy vấn dữ liệu thần tốc và bảo mật cao"], "badge": "RELATIONAL DB", "w": 430},
        {"title": "Bộ Nhớ Tăng Tốc (Redis 7 Cache)", "sub": "Bộ đệm dữ liệu siêu tốc độ trong RAM", "items": ["Lưu đệm thông tin dịch vụ và câu trả lời AI", "Bảo đảm phản hồi chatbot chỉ trong mili-giây", "Kênh truyền tin Message Broker cho WebSocket"], "badge": "IN-MEMORY CACHE", "w": 430},
        {"title": "Xử Lý Tự Động (Celery Workers)", "sub": "Bộ máy xử lý tác vụ ngầm định kỳ", "items": ["Tự động gửi email nhắc lịch tiêm trước ngày hẹn", "Tổng hợp báo cáo doanh thu phòng khám cuối ngày", "Tự động phân luồng xử lý không làm chậm máy chủ"], "badge": "ASYNC WORKER", "w": 430},
        {"title": "Kết Nối Đám Mây & Thanh Toán", "sub": "Google Gemini AI & VietQR Napas247", "items": ["Trí tuệ nhân tạo Google Gemini tư vấn chuyên sâu", "Cổng thanh toán tự động VietQR sinh mã QR", "Webhook xác nhận chuyển khoản ngân hàng tức thì"], "badge": "CLOUD & FINTECH", "w": 430}
    ]

    db_spacing = 23
    for i, dc in enumerate(db_cards):
        cx = start_x + i * (dc["w"] + db_spacing)
        draw_card(cx, 940, dc["w"], card_h, (255, 255, 255), (16, 185, 129), dc["title"], dc["sub"], dc["items"], dc["badge"])

    # -------------------------------------------------------------
    # FOOTER BANNER - Y = 1115
    # -------------------------------------------------------------
    draw.rounded_rectangle([60, 1110, width - 60, 1145], radius=8, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    footer_text = "HỆ THỐNG QUẢN LÝ PHÒNG KHÁM THÚ Y & TRỢ LÝ AI PETCARE | KHOA CNTT - ĐẠI HỌC CNTT & TRUYỀN THÔNG (ICTU) 2026"
    draw.text((width // 2, 1128), footer_text, font=footer_font, fill=(14, 56, 122), anchor="mm")

    # Save
    out_assets = "/app/slides_assets/system_architecture.png"
    img.save(out_assets, format="PNG")
    print(f"Successfully generated refined System Architecture Diagram at: {out_assets}")

if __name__ == "__main__":
    draw_system_architecture()

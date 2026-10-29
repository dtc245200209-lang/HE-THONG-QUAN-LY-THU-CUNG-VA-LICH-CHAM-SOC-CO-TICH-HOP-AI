import os
from PIL import Image, ImageDraw, ImageFont

def create_pipeline_diagram():
    # Dimensions for crisp, high-res presentation graphic (1600 x 750)
    width = 1600
    height = 750
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Load Arial fonts
    font_dir = "/app"
    font_bold_path = os.path.join(font_dir, "arialbd.ttf")
    font_reg_path = os.path.join(font_dir, "arial.ttf")

    if not os.path.exists(font_bold_path):
        font_bold_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        font_reg_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

    title_font = ImageFont.truetype(font_bold_path, 34)
    card_title_font = ImageFont.truetype(font_bold_path, 22)
    card_step_font = ImageFont.truetype(font_bold_path, 16)
    body_bold_font = ImageFont.truetype(font_bold_path, 17)
    body_reg_font = ImageFont.truetype(font_reg_path, 16)
    footer_font = ImageFont.truetype(font_reg_path, 15)

    # 1. Main Header
    draw.text((width // 2, 50), "SƠ ĐỒ LUỒNG XỬ LÝ CỦA TRỢ LÝ AI PETCARE", font=title_font, fill=(14, 56, 122), anchor="mm")
    draw.text((width // 2, 92), "Quy trình từ lúc người dùng gửi câu hỏi đến khi AI trả lời an toàn, chuẩn y khoa", font=body_reg_font, fill=(100, 116, 139), anchor="mm")

    # 2. Four Process Cards
    cards_data = [
        {
            "step": "BƯỚC 1: ĐẦU VÀO",
            "title": "Tiếp Nhận Câu Hỏi",
            "bg_color": (239, 246, 255),       # Soft Blue
            "border_color": (59, 130, 246),    # Blue 500
            "title_color": (29, 78, 216),      # Blue 700
            "badge_bg": (219, 234, 254),
            "points": [
                ("Tin nhắn từ người dùng:", "Khách hỏi triệu chứng (nôn, bỏ ăn, ngứa da)."),
                ("Ảnh chụp y tế:", "Sổ tiêm chủng, đơn thuốc hoặc vùng da bị thương."),
                ("Giao diện sử dụng:", "Khung chat trên Web và ứng dụng điện thoại.")
            ]
        },
        {
            "step": "BƯỚC 2: DỮ LIỆU",
            "title": "Tra Cứu Hồ Sơ Thú Cưng",
            "bg_color": (245, 243, 255),       # Soft Purple
            "border_color": (139, 92, 246),    # Purple 500
            "title_color": (109, 40, 217),     # Purple 700
            "badge_bg": (237, 233, 254),
            "points": [
                ("Thông tin cơ bản:", "Tự động lấy tên, giống loài (chó/mèo), tuổi, cân nặng."),
                ("Lịch sử tiêm phòng:", "Tra cứu các mũi vaccine và tẩy giun định kỳ."),
                ("Tiền sử bệnh lý:", "Cảnh báo dị ứng thuốc và bệnh mãn tính (nếu có).")
            ]
        },
        {
            "step": "BƯỚC 3: TRÍ TUỆ AI",
            "title": "Bộ Não AI & An Toàn Y Tế",
            "bg_color": (240, 253, 250),       # Soft Teal
            "border_color": (20, 184, 166),    # Teal 500
            "title_color": (15, 118, 110),     # Teal 700
            "badge_bg": (204, 251, 241),
            "points": [
                ("Phát hiện nguy kịch:", "Nếu co giật, nuốt dị vật -> Bật cảnh báo cấp cứu."),
                ("Khung an toàn y khoa:", "Tuyệt đối không tự kê đơn kháng sinh bừa bãi."),
                ("Mô hình AI chuyên gia:", "Google Gemini kết hợp kiến thức thú y chuẩn.")
            ]
        },
        {
            "step": "BƯỚC 4: KẾT QUẢ",
            "title": "Phản Hồi & Hướng Dẫn",
            "bg_color": (236, 253, 245),       # Soft Emerald
            "border_color": (16, 185, 129),    # Emerald 500
            "title_color": (4, 120, 87),       # Emerald 700
            "badge_bg": (209, 250, 229),
            "points": [
                ("Lời khuyên dễ hiểu:", "Hướng dẫn chăm sóc, vệ sinh và dinh dưỡng tại nhà."),
                ("Số điện thoại khẩn cấp:", "Hotline bác sĩ trực 24/7 khi gặp ca nguy kịch."),
                ("Hành động tiếp theo:", "Nút bấm 'Đặt lịch hẹn khám' với bác sĩ thú y.")
            ]
        }
    ]

    card_width = 330
    card_height = 490
    spacing = 40
    start_x = (width - (4 * card_width + 3 * spacing)) // 2
    top_y = 150

    for i, data in enumerate(cards_data):
        cx = start_x + i * (card_width + spacing)
        cy = top_y

        # Draw card background with rounded corners
        draw.rounded_rectangle([cx, cy, cx + card_width, cy + card_height], radius=18, fill=data["bg_color"], outline=data["border_color"], width=3)

        # Draw Step Badge
        badge_w = 170
        badge_h = 32
        badge_x = cx + (card_width - badge_w) // 2
        badge_y = cy + 20
        draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=10, fill=data["badge_bg"], outline=data["border_color"], width=1)
        draw.text((cx + card_width // 2, badge_y + badge_h // 2), data["step"], font=card_step_font, fill=data["title_color"], anchor="mm")

        # Draw Card Title
        draw.text((cx + card_width // 2, cy + 85), data["title"], font=card_title_font, fill=(30, 41, 59), anchor="mm")

        # Divider line
        draw.line([cx + 25, cy + 115, cx + card_width - 25, cy + 115], fill=data["border_color"], width=2)

        # Draw Points
        cur_y = cy + 135
        for header, detail in data["points"]:
            # Bullet icon
            draw.ellipse([cx + 25, cur_y + 4, cx + 35, cur_y + 14], fill=data["border_color"])
            # Header text
            draw.text((cx + 42, cur_y), header, font=body_bold_font, fill=data["title_color"])
            cur_y += 24
            
            # Detail text with line wrap
            words = detail.split()
            line = ""
            for word in words:
                test_line = line + " " + word if line else word
                bbox = draw.textbbox((0, 0), test_line, font=body_reg_font)
                if bbox[2] - bbox[0] > (card_width - 65):
                    draw.text((cx + 42, cur_y), line, font=body_reg_font, fill=(51, 65, 85))
                    cur_y += 22
                    line = word
                else:
                    line = test_line
            if line:
                draw.text((cx + 42, cur_y), line, font=body_reg_font, fill=(51, 65, 85))
                cur_y += 22
            cur_y += 18

        # Draw Connecting Arrow to next card
        if i < 3:
            arrow_x = cx + card_width + 8
            arrow_y = cy + card_height // 2
            arrow_len = spacing - 16
            
            # Shaft
            draw.line([arrow_x, arrow_y, arrow_x + arrow_len, arrow_y], fill=(14, 56, 122), width=4)
            # Arrow head
            draw.polygon([
                (arrow_x + arrow_len + 8, arrow_y),
                (arrow_x + arrow_len - 6, arrow_y - 8),
                (arrow_x + arrow_len - 6, arrow_y + 8)
            ], fill=(14, 56, 122))

    # 3. Footer Banner
    draw.rounded_rectangle([start_x, height - 70, start_x + 4 * card_width + 3 * spacing, height - 20], radius=10, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    footer_text = "NGUYÊN TẮC CỐT LÕI: Phản hồi nhanh (<10s)  |  An toàn y tế 100%  |  Không tự kê đơn  |  Dễ hiểu với gia chủ"
    draw.text((width // 2, height - 45), footer_text, font=body_bold_font, fill=(14, 56, 122), anchor="mm")

    # Save to file
    out_path = "/app/slides_assets/ai_pipeline.png"
    img.save(out_path, format="PNG")
    print(f"Generated clean, beautiful pipeline diagram at: {out_path}")

if __name__ == "__main__":
    create_pipeline_diagram()

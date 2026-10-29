import os
from PIL import Image, ImageDraw, ImageFont

def generate_veterinary_lab_report():
    # Kích thước chuẩn A4 tỷ lệ dọc (1200 x 1700)
    width = 1200
    height = 1700
    img = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Fonts
    font_bold = "/app/arialbd.ttf"
    font_reg = "/app/arial.ttf"
    if not os.path.exists(font_bold):
        font_bold = "arialbd.ttf"
        font_reg = "arial.ttf"

    title_font = ImageFont.truetype(font_bold, 24)
    subtitle_font = ImageFont.truetype(font_bold, 17)
    header_small = ImageFont.truetype(font_reg, 12)
    section_title = ImageFont.truetype(font_bold, 14)
    label_font = ImageFont.truetype(font_bold, 12)
    val_font = ImageFont.truetype(font_reg, 12)
    table_header = ImageFont.truetype(font_bold, 12)
    table_cell = ImageFont.truetype(font_reg, 12)
    table_cell_bold = ImageFont.truetype(font_bold, 12)
    footer_font = ImageFont.truetype(font_reg, 11)

    # Palette
    C_PRIMARY = (14, 56, 122)      # Deep Navy Blue
    C_SECONDARY = (13, 148, 136)   # Medical Teal
    C_DARK = (30, 41, 59)          # Dark Slate
    C_MUTED = (100, 116, 139)      # Muted Gray
    C_BORDER = (203, 213, 225)     # Border Slate
    C_LIGHT_BG = (248, 250, 252)   # Table Alt Row
    C_HEADER_BG = (238, 242, 255)  # Light Indigo
    C_GREEN = (16, 185, 129)       # Normal Green
    C_RED_STAMP = (220, 38, 38)    # Red Stamp

    # 1. Viền trang tài liệu
    draw.rectangle([20, 20, width - 20, height - 20], outline=C_BORDER, width=2)
    draw.rectangle([24, 24, width - 24, height - 24], outline=(226, 232, 240), width=1)

    # 2. Header phòng khám
    draw.text((50, 42), "BỆNH VIỆN THÚ Y QUỐC TẾ PETCARE", font=title_font, fill=C_PRIMARY)
    draw.text((50, 74), "TRUNG TÂM XÉT NGHIỆM CHẨN ĐOÁN LÂM SÀNG THÚ CƯNG", font=subtitle_font, fill=C_SECONDARY)
    draw.text((50, 100), "Địa chỉ: 126 Hoàng Quốc Việt, Cầu Giấy, Hà Nội | Hotline: 0988.123.456 | Website: www.petcareai.local", font=header_small, fill=C_MUTED)

    # Dải phân cách header
    draw.line([50, 125, width - 50, 125], fill=C_PRIMARY, width=3)
    draw.line([50, 130, width - 50, 130], fill=C_SECONDARY, width=1)

    # 3. Tiêu đề phiếu xét nghiệm
    draw.text((width // 2, 160), "PHIẾU KẾT QUẢ XÉT NGHIỆM HUYẾT HỌC & SINH HÓA MÁU", font=title_font, fill=C_PRIMARY, anchor="mm")
    draw.text((width // 2, 190), "(VETERINARY CLINICAL PATHOLOGY & BLOOD ANALYSIS REPORT)", font=header_small, fill=C_MUTED, anchor="mm")

    # Mã barcode giả lập & Mã số phiếu
    draw.text((width - 50, 145), "Mã hồ sơ: #XN-2026-1022-MILO", font=label_font, fill=C_DARK, anchor="ra")
    draw.text((width - 50, 165), "Số vào viện: 6AD90C56", font=header_small, fill=C_MUTED, anchor="ra")

    # 4. Hộp thông tin thú cưng & chủ nuôi
    box_y = 215
    box_h = 135
    draw.rounded_rectangle([50, box_y, width - 50, box_y + box_h], radius=8, fill=C_LIGHT_BG, outline=C_BORDER, width=1)
    
    # Header hộp
    draw.rounded_rectangle([50, box_y, width - 50, box_y + 30], radius=8, fill=C_HEADER_BG, outline=C_BORDER, width=1)
    draw.text((65, box_y + 7), "THÔNG TIN BỆNH NHÂN THÚ CƯNG (PATIENT PROFILE)", font=section_title, fill=C_PRIMARY)

    # Cột 1: Thông tin thú cưng
    col1_x = 65
    row1_y = box_y + 40
    draw.text((col1_x, row1_y), "Tên thú cưng:", font=label_font, fill=C_DARK)
    draw.text((col1_x + 95, row1_y), "MILO (Bé Mèo)", font=title_font, fill=C_PRIMARY)

    draw.text((col1_x, row1_y + 30), "Giống loài:", font=label_font, fill=C_DARK)
    draw.text((col1_x + 95, row1_y + 30), "Mèo Anh lông ngắn (British Shorthair)", font=val_font, fill=C_DARK)

    draw.text((col1_x, row1_y + 55), "Tuổi / Giới tính:", font=label_font, fill=C_DARK)
    draw.text((col1_x + 95, row1_y + 55), "18 tháng tuổi  |  Đực (Đã triệt sản)", font=val_font, fill=C_DARK)

    # Cột 2: Cân nặng & Chủ nuôi
    col2_x = 460
    draw.text((col2_x, row1_y), "Cân nặng:", font=label_font, fill=C_DARK)
    draw.text((col2_x + 85, row1_y), "4.8 kg (Thể trạng chuẩn)", font=table_cell_bold, fill=C_DARK)

    draw.text((col2_x, row1_y + 30), "Chủ thú cưng:", font=label_font, fill=C_DARK)
    draw.text((col2_x + 85, row1_y + 30), "Nguyễn Khách Hàng", font=val_font, fill=C_DARK)

    draw.text((col2_x, row1_y + 55), "Số điện thoại:", font=label_font, fill=C_DARK)
    draw.text((col2_x + 85, row1_y + 55), "0912.888.999", font=val_font, fill=C_DARK)

    # Cột 3: Bác sĩ & Ngày giờ
    col3_x = 800
    draw.text((col3_x, row1_y), "Bác sĩ chỉ định:", font=label_font, fill=C_DARK)
    draw.text((col3_x + 105, row1_y), "BS. Đoàn Thị Cẩm Tú", font=table_cell_bold, fill=C_PRIMARY)

    draw.text((col3_x, row1_y + 30), "Ngày lấy mẫu:", font=label_font, fill=C_DARK)
    draw.text((col3_x + 105, row1_y + 30), "22/10/2026 - 08:30", font=val_font, fill=C_DARK)

    draw.text((col3_x, row1_y + 55), "Ngày in kết quả:", font=label_font, fill=C_DARK)
    draw.text((col3_x + 105, row1_y + 55), "22/10/2026 - 09:15", font=val_font, fill=C_DARK)

    # 5. Bảng 1: HUYẾT HỌC TỔNG QUÁT (CBC)
    cur_y = box_y + box_h + 20
    draw.text((50, cur_y), "I. KẾT QUẢ HUYẾT HỌC TỔNG QUÁT (COMPLETE BLOOD COUNT - CBC)", font=section_title, fill=C_PRIMARY)
    cur_y += 24

    # Vẽ bảng CBC
    headers = [("TÊN CHỈ SỐ", 280), ("KẾT QUẢ", 140), ("TRỊ SỐ THAM CHIẾU (MÈO)", 220), ("ĐƠN VỊ", 120), ("ĐÁNH GIÁ LÂM SÀNG", 180)]
    table_x = 50
    table_w = width - 100
    
    # Table header
    draw.rectangle([table_x, cur_y, table_x + table_w, cur_y + 28], fill=C_PRIMARY)
    col_x = table_x
    for h_text, h_w in headers:
        draw.text((col_x + 10, cur_y + 7), h_text, font=table_header, fill=(255, 255, 255))
        col_x += h_w
    cur_y += 28

    cbc_rows = [
        ("WBC (Số lượng bạch cầu)", "11.2", "5.5 - 19.5", "10^9 / L", "BÌNH THƯỜNG", C_GREEN),
        ("RBC (Số lượng hồng cầu)", "6.8", "5.0 - 10.0", "10^12 / L", "BÌNH THƯỜNG", C_GREEN),
        ("HGB (Huyết sắc tố Hemoglobin)", "12.4", "8.0 - 15.0", "g / dL", "BÌNH THƯỜNG", C_GREEN),
        ("HCT (Thể tích khối hồng cầu)", "36.2", "24.0 - 45.0", "%", "BÌNH THƯỜNG", C_GREEN),
        ("MCV (Thể tích trung bình HC)", "45.1", "39.0 - 55.0", "fL", "BÌNH THƯỜNG", C_GREEN),
        ("MCH (Lượng HST trung bình)", "15.3", "12.5 - 17.5", "pg", "BÌNH THƯỜNG", C_GREEN),
        ("PLT (Số lượng tiểu cầu)", "285", "150 - 600", "10^9 / L", "BÌNH THƯỜNG", C_GREEN),
        ("LYM% (Bạch cầu Lympho)", "28.5", "20.0 - 45.0", "%", "BÌNH THƯỜNG", C_GREEN),
        ("NEU% (Bạch cầu trung tính)", "64.2", "35.0 - 75.0", "%", "BÌNH THƯỜNG", C_GREEN),
    ]

    for idx, row in enumerate(cbc_rows):
        bg = C_LIGHT_BG if idx % 2 == 1 else (255, 255, 255)
        draw.rectangle([table_x, cur_y, table_x + table_w, cur_y + 26], fill=bg)
        draw.line([table_x, cur_y + 26, table_x + table_w, cur_y + 26], fill=C_BORDER, width=1)
        
        col_x = table_x
        draw.text((col_x + 10, cur_y + 5), row[0], font=table_cell, fill=C_DARK)
        col_x += headers[0][1]
        
        draw.text((col_x + 10, cur_y + 5), row[1], font=table_cell_bold, fill=C_PRIMARY)
        col_x += headers[1][1]
        
        draw.text((col_x + 10, cur_y + 5), row[2], font=table_cell, fill=C_MUTED)
        col_x += headers[2][1]
        
        draw.text((col_x + 10, cur_y + 5), row[3], font=table_cell, fill=C_DARK)
        col_x += headers[3][1]
        
        # Pill status
        draw.rounded_rectangle([col_x + 8, cur_y + 4, col_x + 140, cur_y + 22], radius=4, fill=(209, 250, 229))
        draw.text((col_x + 74, cur_y + 13), row[4], font=ImageFont.truetype(font_bold, 10), fill=(6, 95, 70), anchor="mm")
        
        cur_y += 26

    # 6. Bảng 2: SINH HÓA MÁU (BIOCHEMISTRY)
    cur_y += 20
    draw.text((50, cur_y), "II. KẾT QUẢ SINH HÓA MÁU & CHỨC NĂNG CƠ QUAN (BIOCHEMISTRY)", font=section_title, fill=C_PRIMARY)
    cur_y += 24

    draw.rectangle([table_x, cur_y, table_x + table_w, cur_y + 28], fill=C_SECONDARY)
    col_x = table_x
    for h_text, h_w in headers:
        draw.text((col_x + 10, cur_y + 7), h_text, font=table_header, fill=(255, 255, 255))
        col_x += h_w
    cur_y += 28

    bio_rows = [
        ("ALT / GPT (Đánh giá men gan)", "32", "12 - 130", "U / L", "BÌNH THƯỜNG", C_GREEN),
        ("AST / GOT (Đánh giá tế bào gan)", "28", "0 - 48", "U / L", "BÌNH THƯỜNG", C_GREEN),
        ("BUN / Urea (Chức năng lọc thận)", "18.5", "16.0 - 36.0", "mg / dL", "BÌNH THƯỜNG", C_GREEN),
        ("Creatinine (Chức năng bài tiết thận)", "0.9", "0.8 - 2.4", "mg / dL", "BÌNH THƯỜNG", C_GREEN),
        ("Glucose (Đường huyết lúc đói)", "95", "74 - 159", "mg / dL", "BÌNH THƯỜNG", C_GREEN),
        ("Albumin (Protein huyết thanh)", "3.4", "2.5 - 3.9", "g / dL", "BÌNH THƯỜNG", C_GREEN),
        ("Total Protein (Protein toàn phần)", "7.1", "5.7 - 8.9", "g / dL", "BÌNH THƯỜNG", C_GREEN),
    ]

    for idx, row in enumerate(bio_rows):
        bg = C_LIGHT_BG if idx % 2 == 1 else (255, 255, 255)
        draw.rectangle([table_x, cur_y, table_x + table_w, cur_y + 26], fill=bg)
        draw.line([table_x, cur_y + 26, table_x + table_w, cur_y + 26], fill=C_BORDER, width=1)
        
        col_x = table_x
        draw.text((col_x + 10, cur_y + 5), row[0], font=table_cell, fill=C_DARK)
        col_x += headers[0][1]
        
        draw.text((col_x + 10, cur_y + 5), row[1], font=table_cell_bold, fill=C_SECONDARY)
        col_x += headers[1][1]
        
        draw.text((col_x + 10, cur_y + 5), row[2], font=table_cell, fill=C_MUTED)
        col_x += headers[2][1]
        
        draw.text((col_x + 10, cur_y + 5), row[3], font=table_cell, fill=C_DARK)
        col_x += headers[3][1]
        
        draw.rounded_rectangle([col_x + 8, cur_y + 4, col_x + 140, cur_y + 22], radius=4, fill=(209, 250, 229))
        draw.text((col_x + 74, cur_y + 13), row[4], font=ImageFont.truetype(font_bold, 10), fill=(6, 95, 70), anchor="mm")
        
        cur_y += 26

    # 7. Kết luận của Bác sĩ chuyên khoa
    cur_y += 25
    conc_box_h = 135
    draw.rounded_rectangle([50, cur_y, width - 50, cur_y + conc_box_h], radius=8, fill=(254, 252, 232), outline=(254, 240, 138), width=1)
    draw.text((65, cur_y + 12), "III. KẾT LUẬN & ĐỀ NGHỊ CỦA BÁC SĨ XÉT NGHIỆM (CLINICAL SUMMARY)", font=section_title, fill=(133, 77, 14))
    
    concl_text_1 = "1. Toàn bộ các chỉ số huyết học (bạch cầu, hồng cầu, tiểu cầu) và sinh hóa gan thận của bé Milo đều nằm trong ngưỡng tham chiếu sinh lý lý tưởng."
    concl_text_2 = "2. Không phát hiện dấu hiệu viêm nhiễm cấp tính, thiếu máu hay suy giảm chức năng nội tạng."
    concl_text_3 = "3. Khuyến nghị: Bé Milo hoàn toàn đủ điều kiện sức khỏe để tiêm chủng vắc-xin 4 bệnh nhắc lại và tẩy giun định kỳ theo lịch hẹn."
    
    draw.text((65, cur_y + 40), concl_text_1, font=table_cell_bold, fill=C_DARK)
    draw.text((65, cur_y + 65), concl_text_2, font=table_cell, fill=C_DARK)
    draw.text((65, cur_y + 90), concl_text_3, font=table_cell_bold, fill=C_PRIMARY)

    # 8. Chữ ký & Dấu đỏ tròn
    sign_y = cur_y + conc_box_h + 30
    draw.text((150, sign_y), "KỸ THUẬT VIÊN XÉT NGHIỆM", font=label_font, fill=C_DARK, anchor="mm")
    draw.text((150, sign_y + 20), "(Ký và ghi rõ họ tên)", font=footer_font, fill=C_MUTED, anchor="mm")
    draw.text((150, sign_y + 90), "CN. Lê Thị Phương", font=table_cell_bold, fill=C_DARK, anchor="mm")

    draw.text((width - 200, sign_y), "BÁC SĨ CHẨN ĐOÁN LÂM SÀNG", font=label_font, fill=C_DARK, anchor="mm")
    draw.text((width - 200, sign_y + 20), "Ngày 22 tháng 10 năm 2026", font=footer_font, fill=C_MUTED, anchor="mm")
    draw.text((width - 200, sign_y + 90), "BS. Đoàn Thị Cẩm Tú", font=table_cell_bold, fill=C_PRIMARY, anchor="mm")

    # Dấu đỏ tròn chứng thực phòng khám
    stamp_cx = width - 200
    stamp_cy = sign_y + 55
    draw.ellipse([stamp_cx - 50, stamp_cy - 50, stamp_cx + 50, stamp_cy + 50], outline=C_RED_STAMP, width=3)
    draw.ellipse([stamp_cx - 44, stamp_cy - 44, stamp_cx + 44, stamp_cy + 44], outline=C_RED_STAMP, width=1)
    stamp_font = ImageFont.truetype(font_bold, 9)
    draw.text((stamp_cx, stamp_cy - 22), "BỆNH VIỆN THÚ Y", font=stamp_font, fill=C_RED_STAMP, anchor="mm")
    draw.text((stamp_cx, stamp_cy - 6), "PETCARE AI", font=ImageFont.truetype(font_bold, 11), fill=C_RED_STAMP, anchor="mm")
    draw.text((stamp_cx, stamp_cy + 10), "★ ĐÃ XÁC THỰC ★", font=stamp_font, fill=C_RED_STAMP, anchor="mm")
    draw.text((stamp_cx, stamp_cy + 24), "TRUNG TÂM XN", font=stamp_font, fill=C_RED_STAMP, anchor="mm")

    # 9. Footer
    draw.line([50, height - 50, width - 50, height - 50], fill=C_BORDER, width=1)
    draw.text((50, height - 38), "Hệ thống Bệnh án Điện tử PetCare AI - Phiếu kết quả có giá trị đối chiếu trong vòng 30 ngày kể từ ngày xét nghiệm.", font=footer_font, fill=C_MUTED)
    draw.text((width - 50, height - 38), "Trang 1 / 1", font=footer_font, fill=C_MUTED, anchor="ra")

    # Lưu ảnh vào backend/uploads/
    os.makedirs("/app/uploads", exist_ok=True)
    out_path = "/app/uploads/phieu_xet_nghiem_mau_milo.png"
    img.save(out_path, "PNG", quality=95)
    print(f"Generated veterinary lab report at: {out_path}")

if __name__ == "__main__":
    generate_veterinary_lab_report()

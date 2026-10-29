import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    template_path = "/app/template_ictu.pptx"
    prs = Presentation(template_path)
    
    # Palette matching ICTU academic branding
    COLOR_PRIMARY = RGBColor(14, 56, 122)     # ICTU Deep Blue #0e387a
    COLOR_SECONDARY = RGBColor(13, 148, 136) # Medical Teal #0d9488
    COLOR_DARK = RGBColor(30, 41, 59)        # Slate Dark #1e293b
    COLOR_MUTED = RGBColor(100, 116, 139)    # Slate Muted #64748b
    COLOR_CARD_BG = RGBColor(248, 250, 252)  # Card Soft Gray #f8fafc
    COLOR_BORDER = RGBColor(203, 213, 225)   # Border #cbd5e1
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_GREEN = RGBColor(16, 185, 129)     # Success Green #10b981
    COLOR_RED = RGBColor(220, 38, 38)        # Emergency Red #dc2626
    COLOR_AMBER = RGBColor(217, 119, 6)      # Amber #d97706

    FONT_FAMILY = "Arial"

    # Helper function to style text frame
    def set_font(p, size_pt, bold=False, color_rgb=COLOR_DARK, align=PP_ALIGN.LEFT):
        p.font.name = FONT_FAMILY
        p.font.size = Pt(size_pt)
        p.font.bold = bold
        p.font.color.rgb = color_rgb
        p.alignment = align

    # Slide 1: Trang tiêu đề (Sử dụng Slide 0 từ template ICTU)
    slide0 = prs.slides[0]
    title_box = slide0.placeholders[0]
    title_box.text = "PETCARE AI - HỆ THỐNG QUẢN LÝ PHÒNG KHÁM\n& TRỢ LÝ AI CHĂM SÓC THÚ CƯNG TOÀN DIỆN"
    for p in title_box.text_frame.paragraphs:
        set_font(p, 20, bold=True, color_rgb=COLOR_PRIMARY, align=PP_ALIGN.CENTER)
        
    sub_box = slide0.placeholders[1]
    sub_box.text = "HỌC PHẦN: PHÁT TRIỂN ỨNG DỤNG AI\nGVHD: TS. Trần Quang Quý | SVTH: Nhóm Đồ Án Chuyên Ngành\nKhoa Công nghệ Thông tin - Đại học CNTT & Truyền thông (ICTU) - 2026"
    for p in sub_box.text_frame.paragraphs:
        set_font(p, 12, bold=False, color_rgb=COLOR_DARK, align=PP_ALIGN.CENTER)

    slide0.notes_slide.notes_text_frame.text = (
        "Kính thưa Thầy/Cô trong Hội đồng và Giảng viên hướng dẫn TS. Trần Quang Quý, "
        "hôm nay nhóm chúng em xin phép được trình bày báo cáo đề tài đồ án môn học "
        "Phát triển ứng dụng AI với đề tài: 'Xây dựng hệ thống quản lý phòng khám thú y "
        "và Trợ lý AI chăm sóc thú cưng toàn diện - PetCare AI'."
    )

    # Function to create standard content slide
    def add_standard_slide(title_text, subtitle_badge="", speaker_notes=""):
        slide = prs.slides.add_slide(prs.slide_layouts[4]) # Layout 'Nur Titel' (Title Only)
        title_box = slide.placeholders[0]
        title_box.text = title_text
        for p in title_box.text_frame.paragraphs:
            set_font(p, 18, bold=True, color_rgb=COLOR_PRIMARY)
        
        # Subtitle badge if specified
        if subtitle_badge:
            tx = slide.shapes.add_textbox(Inches(0.6), Inches(0.72), Inches(8.8), Inches(0.28))
            tf = tx.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = subtitle_badge.upper()
            set_font(p, 9.5, bold=True, color_rgb=COLOR_SECONDARY)
            
        if speaker_notes:
            slide.notes_slide.notes_text_frame.text = speaker_notes
            
        return slide

    def add_card(slide, left, top, width, height, title, items, title_color=COLOR_PRIMARY, bg_color=COLOR_CARD_BG, border_color=COLOR_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        
        tf = shape.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.18)
        tf.margin_right = Inches(0.18)
        tf.margin_top = Inches(0.14)
        tf.margin_bottom = Inches(0.14)
        
        p = tf.paragraphs[0]
        p.text = title
        set_font(p, 12.5, bold=True, color_rgb=title_color)
        p.space_after = Pt(6)
        
        for item in items:
            p2 = tf.add_paragraph()
            p2.text = f"•  {item}"
            set_font(p2, 10.5, color_rgb=COLOR_DARK)
            p2.space_after = Pt(4)

    def add_image_card(slide, img_path, left, top, width, height, caption=""):
        if os.path.exists(img_path):
            pic = slide.shapes.add_picture(img_path, left, top, width, height)
            if caption:
                tx = slide.shapes.add_textbox(left, top + height + Inches(0.05), width, Inches(0.3))
                p = tx.text_frame.paragraphs[0]
                p.text = caption
                set_font(p, 8.5, color_rgb=COLOR_MUTED, align=PP_ALIGN.CENTER)

    # Slide 2: Bối cảnh & Tính cấp thiết (Tận dụng slide 1 của template)
    slide1 = prs.slides[1]
    title1 = slide1.placeholders[0]
    title1.text = "1. Bối cảnh & Tính cấp thiết của Đề tài"
    for p in title1.text_frame.paragraphs:
        set_font(p, 18, bold=True, color_rgb=COLOR_PRIMARY)
        
    sp = slide1.placeholders[1]._element
    sp.getparent().remove(sp) # remove generic bullet placeholder
    
    add_card(slide1, Inches(0.6), Inches(1.1), Inches(4.3), Inches(3.4), 
             "Thực trạng ngành Thú cưng & Y tế Thú y", 
             [
                 "Tăng trưởng thị trường: Tỷ lệ nuôi thú cưng tại Việt Nam tăng >15%/năm.",
                 "Nhu cầu y tế bùng nổ: Gia tăng mạnh nhu cầu phòng dịch, tiêm phòng và điều trị bệnh.",
                 "Khoảng trống kiến thức: Chủ nuôi thường lúng túng khi xử lý sơ cứu ngộ độc, sốc nhiệt.",
                 "Hiện trạng phòng khám: Đa số cơ sở vừa và nhỏ vẫn ghi sổ tay hoặc dùng file Excel phân mảnh."
             ])
    add_card(slide1, Inches(5.1), Inches(1.1), Inches(4.3), Inches(3.4), 
             "4 Điểm nghẽn Cốt lõi cần Giải quyết", 
             [
                 "Quá tải tư vấn: Đội ngũ y tế mất nhiều thời gian trả lời câu hỏi lặp lại.",
                 "Bệnh án phân tán: Thiếu lịch sử tiêm phòng, dị ứng thuốc khi đổi ca trực.",
                 "Cấp cứu chậm trễ: Thiếu công cụ phân luồng khẩn cấp 24/7 ngoài giờ hành chính.",
                 "Nhu cầu cấp thiết: Cần một nền tảng chuyển đổi số toàn diện tích hợp Trợ lý AI có kiểm duyệt y khoa."
             ], title_color=COLOR_RED, border_color=RGBColor(254, 202, 202))

    slide1.notes_slide.notes_text_frame.text = (
        "Xuất phát từ thực tế thị trường thú cưng tăng trưởng trên 15% mỗi năm, các phòng khám thú y hiện nay "
        "đang đối mặt với 4 điểm nghẽn lớn: quá tải tư vấn, bệnh án phân tán, thiếu công cụ cấp cứu kịp thời và "
        "theo dõi nội trú rời rạc. Đề tài PetCare AI ra đời nhằm giải quyết triệt để các bài toán này."
    )

    # Slide 3: Mục tiêu & Phạm vi
    s3 = add_standard_slide(
        "2. Mục tiêu & Phạm vi Nghiên cứu", 
        "Xây dựng Hệ sinh thái Quản lý & Trợ lý Chuyên khoa",
        "Mục tiêu cốt lõi của đề tài là xây dựng hệ thống quản lý chuẩn y khoa đi kèm Trợ lý AI tư vấn 24/7 dưới 650ms. Ranh giới hệ thống được xác định rõ: AI chỉ đóng vai trò hỗ trợ, không thay thế bác sĩ và không tự ý kê đơn thuốc."
    )
    add_card(s3, Inches(0.6), Inches(1.1), Inches(4.3), Inches(3.4),
             "4 Mục tiêu Nghiên cứu Cụ thể",
             [
                 "Mục tiêu 1: Xây dựng Trợ lý AI tư vấn sức khỏe thú cưng 24/7 (Độ trễ <650ms).",
                 "Mục tiêu 2: Số hóa toàn diện hồ sơ bệnh án điện tử (EMR) chuẩn phòng khám.",
                 "Mục tiêu 3: Tối ưu quy trình vận hành (Lễ tân, Điều dưỡng, Telehealth, VietQR).",
                 "Mục tiêu 4: Thiết lập Khung an toàn y khoa 3 chốt chặn, loại bỏ nguy cơ ảo giác."
             ], title_color=COLOR_SECONDARY)
    add_card(s3, Inches(5.1), Inches(1.1), Inches(4.3), Inches(3.4),
             "Phạm vi & Ranh giới An toàn Y tế",
             [
                 "Đối tượng phục vụ: Chó, Mèo và các loài thú cưng phổ biến tại đô thị.",
                 "Vai trò của AI: Tư vấn triệu chứng, phân luồng cấp cứu, giải thích bệnh án.",
                 "Nguyên tắc 1: AI TUYỆT ĐỐI KHÔNG thay thế chẩn đoán chuyên sâu của Bác sĩ.",
                 "Nguyên tắc 2: AI TUYỆT ĐỐI KHÔNG tự kê đơn hoạt chất đặc trị liều lượng cao."
             ])

    # Slide 4: Cơ sở lý thuyết AI & SFT
    s4 = add_standard_slide(
        "3. Cơ sở Lý thuyết: Transformer & Fine-Tuning",
        "Nền tảng Công nghệ Trí tuệ Nhân tạo Hiện đại",
        "Chúng em ứng dụng kiến trúc Transformer kết hợp cơ chế Multi-Head Attention và kỹ thuật Prompt Engineering y khoa. Hệ thống tự động nhúng thông tin giống loài, độ tuổi vào ngữ cảnh để câu trả lời mang tính cá nhân hóa cao nhất."
    )
    add_card(s4, Inches(0.6), Inches(1.1), Inches(4.3), Inches(3.4),
             "Kiến trúc Transformer & Mô hình LLM",
             [
                 "Cơ chế Multi-Head Self-Attention: Mô hình hóa mối quan hệ từ vựng và ngữ cảnh sâu.",
                 "Lựa chọn Model: Google Gemini 2.5/3.8 Flash, GPT-4o-mini và Ollama Llama-3.",
                 "Khả năng suy luận: Tận dụng Reasoning và In-context Learning để giải thích bệnh học.",
                 "Multimodal Vision: Đọc hiểu và trích xuất dữ liệu từ ảnh chụp sổ tiêm qua OCR."
             ])
    add_card(s4, Inches(5.1), Inches(1.1), Inches(4.3), Inches(3.4),
             "Kỹ thuật SFT & Tinh chỉnh Ngữ cảnh",
             [
                 "System Prompt Engineering: Định hình persona Bác sĩ Thú y chuẩn mực, từ tốn.",
                 "Dynamic Context Injection: Tự động nhúng Giống loài, Tuổi, Cân nặng vào câu hỏi.",
                 "Clinical Guardrails: Kiểm duyệt đầu vào / đầu ra theo 6 tiêu chuẩn an toàn thú y.",
                 "Cơ chế chuyển đổi (Failover): Tự động chuyển đổi giữa Cloud AI và Local AI an toàn."
             ], title_color=COLOR_SECONDARY)

    # Slide 5: Khung an toàn Y khoa 3 Chốt chặn
    s5 = add_standard_slide(
        "4. Khung An toàn Y khoa 3 Chốt chặn (Clinical Guardrails)",
        "Đảm bảo Chuẩn mực Đạo đức & An toàn Sức khỏe Thú cưng",
        "Điểm đột phá của dự án là bộ 3 chốt chặn an toàn: Chốt 1 sàng lọc phạm vi thú y, Chốt 2 kích hoạt cấp cứu tức thời khi phát hiện nguy kịch, Chốt 3 nghiêm cấm kê đơn thuốc kháng sinh bừa bãi."
    )
    add_card(s5, Inches(0.6), Inches(1.1), Inches(2.8), Inches(3.4),
             "Chốt 1: In-Scope Guard",
             [
                 "Kiểm soát phạm vi hội thoại.",
                 "Từ chối các chủ đề ngoài thú y (chính trị, code, tài chính,...).",
                 "Bảo toàn tài nguyên AI phục vụ đúng nghiệp vụ y tế lâm sàng."
             ], title_color=COLOR_PRIMARY)
    add_card(s5, Inches(3.6), Inches(1.1), Inches(2.8), Inches(3.4),
             "Chốt 2: Emergency Triage",
             [
                 "Nhận diện từ khóa nguy kịch (co giật, sốc nhiệt, xuất huyết).",
                 "Kích hoạt trạng thái [KHẨN CẤP].",
                 "Hướng dẫn sơ cứu tức thời và cung cấp số hotline phòng khám."
             ], title_color=COLOR_RED, border_color=RGBColor(254, 202, 202))
    add_card(s5, Inches(6.6), Inches(1.1), Inches(2.8), Inches(3.4),
             "Chốt 3: Non-Prescribe",
             [
                 "Tuyệt đối cấm kê liều thuốc đặc trị (kháng sinh, corticoid).",
                 "Yêu cầu mang thú cưng đi khám.",
                 "Tự động gắn thông điệp miễn trừ trách nhiệm pháp lý y tế."
             ], title_color=COLOR_SECONDARY)

    # Slide 6: Kiến trúc Kỹ thuật Tổng thể (with image)
    s6 = add_standard_slide(
        "5. Kiến trúc Hệ thống & Luồng Xử lý AI",
        "Quy trình Đơn giản - Hoạt động Liền mạch - Chuẩn Y tế",
        "Kính thưa Hội đồng, hệ thống PetCare AI hoạt động qua 4 bước rất rõ ràng: Bước 1 tiếp nhận câu hỏi của gia chủ; Bước 2 tự động tra cứu hồ sơ giống loài, cân nặng và lịch tiêm; Bước 3 bộ não AI phân tích và kiểm duyệt an toàn y tế; Bước 4 xuất lời khuyên dễ hiểu kèm nút đặt lịch khám bác sĩ."
    )
    add_card(s6, Inches(0.6), Inches(1.1), Inches(3.9), Inches(3.4),
             "Thành phần Cốt lõi của Hệ thống",
             [
                 "Giao diện người dùng (Next.js): Dễ dùng trên cả máy tính và điện thoại.",
                 "Máy chủ xử lý (FastAPI Python): Tiếp nhận yêu cầu, điều phối bảo mật.",
                 "Cơ sở dữ liệu (PostgreSQL): Lưu trữ an toàn hồ sơ bệnh án, lịch tiêm, đơn thuốc.",
                 "Bộ đệm tăng tốc (Redis): Đảm bảo tốc độ phản hồi siêu tốc dưới 10 giây.",
                 "Khám từ xa (Telehealth WebRTC): Gọi video trực tiếp giữa Bác sĩ và chủ nuôi."
             ])
    add_image_card(s6, "/app/slides_assets/system_architecture.png", Inches(4.7), Inches(1.1), Inches(4.7), Inches(3.4), "Sơ đồ Kiến trúc Đa tầng Micro-services của PetCare AI")

    # Slide 7: Cơ sở Dữ liệu 34 Thực thể
    s7 = add_standard_slide(
        "6. Thiết kế Cơ sở Dữ liệu Quan hệ (34 Thực thể)",
        "Chuẩn hóa 3NF - Đảm bảo Tính Toàn vẹn Dữ liệu Nghiệp vụ",
        "Hệ thống được thiết kế với 34 bảng quan hệ chuẩn 3NF, phân tách rõ ràng thành 5 phân vùng nghiệp vụ từ tiếp đón, khám lâm sàng cho đến điều trị nội trú và quản lý giao dịch."
    )
    add_card(s7, Inches(0.6), Inches(1.1), Inches(4.3), Inches(1.6),
             "Cụm 1: Quản trị & Người dùng (RBAC)",
             ["users, roles, permissions, audit_logs", "Xác thực JWT, bảo mật dữ liệu y tế"],
             title_color=COLOR_PRIMARY)
    add_card(s7, Inches(5.1), Inches(1.1), Inches(4.3), Inches(1.6),
             "Cụm 2: Thú cưng & Hồ sơ Sổ tiêm",
             ["pets, species, breeds, vaccinations", "Microchip ID & Lịch sử tiêm phòng số"],
             title_color=COLOR_SECONDARY)
    add_card(s7, Inches(0.6), Inches(2.9), Inches(4.3), Inches(1.6),
             "Cụm 3: Khám lâm sàng & Bệnh án (EMR)",
             ["appointments, clinical_records, prescriptions", "medications, lab_tests & hình ảnh cận lâm sàng"],
             title_color=COLOR_AMBER)
    add_card(s7, Inches(5.1), Inches(2.9), Inches(4.3), Inches(1.6),
             "Cụm 4 & 5: Nội trú & AI Billing",
             ["hospitalizations, daily_care_logs, cages", "ai_sessions, guardrail_logs, vietqr_transactions"],
             title_color=COLOR_PRIMARY)

    # Slide 8: Phân hệ Khách hàng & Chatbot AI (with image)
    s8 = add_standard_slide(
        "7. Phân hệ Khách hàng: Chatbot AI & Sổ Tiêm Số",
        "Giao diện Thân thiện - Trải nghiệm Liền mạch 24/7",
        "Giao diện phân hệ Khách hàng cho phép chủ nuôi trò chuyện trực tiếp với Trợ lý AI, tra cứu sổ tiêm phòng điện tử và quản lý thẻ QR khẩn cấp gắn trên vòng cổ thú cưng."
    )
    add_card(s8, Inches(0.6), Inches(1.1), Inches(4.1), Inches(3.4),
             "Tính năng Nổi bật Khách hàng",
             [
                 "Trợ lý AI PetCare: Hỗ trợ 24/7 giải đáp triệu chứng và mẹo chăm sóc.",
                 "Pet Passport điện tử: Tra cứu lịch tiêm chủng, sổ giun định kỳ.",
                 "Thẻ QR Khẩn cấp: Quét xem số điện thoại chủ nuôi khi thất lạc thú cưng.",
                 "Đặt lịch khám online & Nhận thông báo tự động trước giờ hẹn."
             ])
    add_image_card(s8, "/app/slides_assets/chatbot_ui.png", Inches(4.9), Inches(1.1), Inches(4.5), Inches(3.4), "Hình: Giao diện Trợ lý AI tư vấn và cảnh báo lâm sàng")

    # Slide 9: Phân hệ Bác sĩ: EMR & Telehealth
    s9 = add_standard_slide(
        "8. Phân hệ Bác sĩ: Bệnh án Điện tử (EMR) & Telehealth",
        "Số hóa Toàn diện Quy trình Khám chữa Bệnh Lâm sàng",
        "Bác sĩ có thể nhập liệu bệnh án điện tử có cấu trúc, kê đơn tương tác thuốc và thực hiện các cuộc gọi khám bệnh từ xa Telehealth chất lượng cao qua WebRTC."
    )
    add_card(s9, Inches(0.6), Inches(1.1), Inches(4.3), Inches(3.4),
             "Bệnh án Điện tử (EMR Chuẩn hóa)",
             [
                 "Nhập liệu lâm sàng có cấu trúc: Triệu chứng, Chẩn đoán, Phác đồ.",
                 "Kê đơn thuốc tự động: Tích hợp kho dược và cảnh báo tương tác thuốc.",
                 "Xem lại toàn bộ lịch sử khám chữa bệnh qua dòng thời gian (Timeline).",
                 "Xuất phiếu khám bệnh và đơn thuốc điện tử (PDF/In tức thì)."
             ], title_color=COLOR_PRIMARY)
    add_card(s9, Inches(5.1), Inches(1.1), Inches(4.3), Inches(3.4),
             "Telehealth Khám bệnh Từ xa (WebRTC)",
             [
                 "Tích hợp WebRTC P2P Video Call độ nét cao, không giật lag.",
                 "Bác sĩ vừa quan sát thú cưng vừa tra cứu song song bệnh án.",
                 "Tiện lợi cho chủ nuôi ở xa hoặc thú cưng gặp khó khăn khi di chuyển.",
                 "Ghi nhận kết quả khám và xuất đơn thuốc ngay trong cuộc gọi."
             ], title_color=COLOR_SECONDARY)

    # Slide 10: Phân hệ Lễ tân: Điều phối & VietQR (with image)
    s10 = add_standard_slide(
        "9. Phân hệ Lễ tân: Tiếp đón, Điều phối & VietQR",
        "Rút ngắn Thời gian Tiếp đón & Tự động hóa Thanh toán",
        "Bàn tiếp đón lễ tân hỗ trợ check-in nhanh dưới 30 giây và tích hợp chuẩn VietQR Napas247, giúp khách hàng quét mã thanh toán không tiền mặt và hệ thống tự động gạch nợ."
    )
    add_card(s10, Inches(0.6), Inches(1.1), Inches(4.1), Inches(3.4),
             "Quy trình Tiếp đón & Thanh toán",
             [
                 "Bàn điều phối lễ tân: Check-in nhanh bằng QR code / số điện thoại.",
                 "Phân luồng thông minh: Tự động điều phối thú cưng vào phòng khám phù hợp.",
                 "Chuẩn VietQR Napas247: Tự động tạo mã QR chứa đầy đủ số tiền và nội dung.",
                 "Đồng bộ Webhook: Nhận thông báo giao dịch thành công và gạch nợ tức thì."
             ])
    add_image_card(s10, "/app/slides_assets/receptionist_ui.png", Inches(4.9), Inches(1.1), Inches(4.5), Inches(3.4), "Hình: Màn hình tiếp đón lễ tân và điều phối khám")

    # Slide 11: Phân hệ Điều dưỡng & AI Care Brief (with image)
    s11 = add_standard_slide(
        "10. Phân hệ Điều dưỡng & AI Care Brief",
        "Theo dõi Nội trú & Tự động Tóm tắt Nhật ký Chăm sóc",
        "Tính năng AI Care Brief giúp điều dưỡng và bác sĩ tiết kiệm thời gian giao ban: thay vì đọc nhật ký rải rác, AI tự động tổng hợp diễn biến 24h điều trị thành bản tóm tắt 30 giây."
    )
    add_card(s11, Inches(0.6), Inches(1.1), Inches(4.1), Inches(3.4),
             "Theo dõi Nội trú & AI Care Brief",
             [
                 "Live Care Monitoring: Cập nhật thân nhiệt, dinh dưỡng, dịch truyền theo ca.",
                 "Tính năng AI Care Brief: LLM tự động tổng hợp toàn bộ nhật ký điều trị.",
                 "Tiết kiệm thời gian: Bác sĩ nắm bắt nhanh diễn biến bệnh chỉ trong 30 giây.",
                 "Gửi thông báo tiến triển sức khỏe định kỳ cho chủ nuôi yên tâm."
             ])
    add_image_card(s11, "/app/slides_assets/ai_care_brief.png", Inches(4.9), Inches(1.1), Inches(4.5), Inches(3.4), "Hình: Cửa sổ AI Care Brief tự động trích xuất diễn biến phục hồi")

    # Slide 12: Phân hệ Quản trị viên (Admin & BI)
    s12 = add_standard_slide(
        "11. Phân hệ Quản trị viên: Quản trị & BI Analytics",
        "Điều hành Toàn diện Cơ sở Phòng khám Dựa trên Dữ liệu",
        "Phân hệ Admin cung cấp công cụ quản trị phân quyền RBAC, theo dõi kho dược phẩm và bảng phân tích kinh doanh BI theo thời gian thực."
    )
    add_card(s12, Inches(0.6), Inches(1.1), Inches(4.3), Inches(3.4),
             "Quản trị Hệ thống & Dược kho",
             [
                 "Phân quyền theo vai trò (RBAC): Admin, Bác sĩ, Lễ tân, Điều dưỡng, Khách hàng.",
                 "Audit Log toàn diện: Ghi nhận mọi thao tác sửa/xóa dữ liệu lâm sàng.",
                 "Quản lý kho Dược & Vật tư: Cảnh báo tự động khi thuốc sắp hết hoặc cận date.",
                 "Cấu hình hệ thống: Thiết lập tham số phòng khám và thông tin cơ sở."
             ], title_color=COLOR_PRIMARY)
    add_card(s12, Inches(5.1), Inches(1.1), Inches(4.3), Inches(3.4),
             "Phân tích Kinh doanh (BI Dashboard)",
             [
                 "Biểu đồ doanh thu trực quan theo ngày, tuần, tháng theo thời gian thực.",
                 "Thống kê tần suất bệnh lý phổ biến và tỷ lệ khỏi bệnh thành công.",
                 "Đánh giá hiệu suất phục vụ của đội ngũ Bác sĩ và Điều dưỡng.",
                 "Theo dõi chỉ số tương tác AI để không ngừng tối ưu trải nghiệm khách hàng."
             ], title_color=COLOR_SECONDARY)

    # Slide 13: Đánh giá Thực nghiệm & Kiểm thử Lâm sàng
    s13 = add_standard_slide(
        "12. Kết quả Thực nghiệm & Kiểm thử Lâm sàng",
        "Đánh giá Nghiêm ngặt theo Chuẩn Kỹ thuật & Y tế Thú y",
        "Kết quả kiểm thử lâm sàng trên 6 tình huống mẫu cho thấy hệ thống đạt 100% tỷ lệ an toàn y tế, độ trễ phản hồi dưới 650ms và vượt qua 100% các bài kiểm thử backend/frontend."
    )
    
    rows, cols = 7, 4
    table_shape = s13.shapes.add_table(rows, cols, Inches(0.6), Inches(1.1), Inches(8.8), Inches(2.2))
    table = table_shape.table
    table.columns[0].width = Inches(1.3)
    table.columns[1].width = Inches(3.6)
    table.columns[2].width = Inches(2.5)
    table.columns[3].width = Inches(1.4)
    
    headers = ["Mã Test", "Tình huống Lâm sàng", "Tiêu chí Đánh giá", "Kết quả"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_PRIMARY
        p = cell.text_frame.paragraphs[0]
        set_font(p, 10.5, bold=True, color_rgb=COLOR_WHITE)
        
    test_data = [
        ("TEST-01", "Mèo nôn ra búi lông", "Tư vấn chế độ dinh dưỡng & chải lông", "100% PASS"),
        ("TEST-02", "Chó co giật sau ăn bả", "Bật cảnh báo đỏ khẩn cấp, hướng dẫn sơ cứu", "100% PASS"),
        ("TEST-03", "Hỏi xin liều thuốc kháng sinh", "Từ chối kê đơn, yêu cầu khám trực tiếp", "100% PASS"),
        ("TEST-04", "Hỏi câu chuyện phi y tế", "In-Scope từ chối lịch sự, giữ phạm vi", "100% PASS"),
        ("TEST-05", "Đọc ảnh Sổ tiêm chủng (OCR)", "Trích xuất đúng loại vaccine & ngày tiêm", "100% PASS"),
        ("TEST-06", "Tóm tắt bệnh án nội trú", "AI Care Brief trích xuất đúng chỉ số sinh tồn", "100% PASS")
    ]
    
    for i, row in enumerate(test_data):
        for j, val in enumerate(row):
            cell = table.cell(i+1, j)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            if j == 3:
                set_font(p, 9.5, bold=True, color_rgb=COLOR_GREEN)
            elif j == 0:
                set_font(p, 9.5, bold=True, color_rgb=COLOR_PRIMARY)
            else:
                set_font(p, 9.5, color_rgb=COLOR_DARK)

    add_card(s13, Inches(0.6), Inches(3.45), Inches(8.8), Inches(1.05),
             "Tổng hợp Chỉ số Kỹ thuật & Độ an toàn Y tế:",
             [
                 "Độ trễ trung bình AI: <650ms (Cloud Gemini / Ollama Local) | Tuân thủ 6/6 tiêu chuẩn An toàn Y tế: 100% PASS.",
                 "Kiểm thử hệ thống Backend: 19/19 API Tests PASS | Frontend: 57/57 Next.js Routes biên dịch thành công (0 Lỗi)."
             ], title_color=COLOR_SECONDARY)

    # Slide 14: Kết luận & Hướng phát triển
    s14 = add_standard_slide(
        "13. Kết luận & Hướng Phát triển Tương lai",
        "Tổng kết Toàn diện Đề tài & Định hướng Mở rộng Ứng dụng",
        "Nhóm chúng em đã hoàn thành toàn diện các mục tiêu đề ra và sẵn sàng đưa sản phẩm vào triển khai thực tế. Chúng em xin chân thành cảm ơn Thầy TS. Trần Quang Quý và Hội đồng đã chú ý lắng nghe!"
    )
    add_card(s14, Inches(0.6), Inches(1.1), Inches(4.3), Inches(3.4),
             "Kết luận Đề tài",
             [
                 "Hoàn thành toàn diện 100% mục tiêu nghiên cứu đã đăng ký.",
                 "Xây dựng thành công hệ sinh thái Quản lý Phòng khám kết hợp Trợ lý AI.",
                 "Khung an toàn y khoa 3 chốt chặn loại bỏ hoàn toàn nguy cơ dùng thuốc sai cách.",
                 "Sản phẩm đạt độ hoàn thiện cao, sẵn sàng triển khai tại phòng khám thực tế."
             ], title_color=COLOR_PRIMARY)
    add_card(s14, Inches(5.1), Inches(1.1), Inches(4.3), Inches(3.4),
             "Định hướng Phát triển Tiếp theo",
             [
                 "Nâng cấp RAG (Retrieval-Augmented Generation) kết hợp Vector DB (Milvus/Qdrant).",
                 "Phát triển ứng dụng Mobile App (React Native / Flutter) cho chủ thú cưng.",
                 "Ứng dụng Computer Vision chuyên sâu chẩn đoán tổn thương da và phim X-quang.",
                 "Kết nối IoT vòng cổ thông minh theo dõi nhịp tim và bước chạy của thú cưng."
             ], title_color=COLOR_SECONDARY)

    output_pptx = "/app/BAO_CAO_THUYET_TRINH_PETCARE_AI.pptx"
    prs.save(output_pptx)
    print(f"Presentation saved successfully to {output_pptx} with {len(prs.slides)} slides.")

if __name__ == "__main__":
    create_deck()

import re
import os
import subprocess
import markdown

def generate_html_report():
    md_path = "/app/BAO_CAO_HOC_PHAN_PETCARE_AI.md"
    if not os.path.exists(md_path):
        md_path = "BAO_CAO_HOC_PHAN_PETCARE_AI.md"
    if not os.path.exists(md_path):
        md_path = "d:/Duan/petCare/BAO_CAO_HOC_PHAN_PETCARE_AI.md"

    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    # Remove the duplicate title block from markdown so only the designed cover page appears
    if "## LỜI CAM ĐOAN" in md_content:
        parts = md_content.split("## LỜI CAM ĐOAN", 1)
        md_content = "## LỜI CAM ĐOAN" + parts[1]
    elif "LỜI CAM ĐOAN" in md_content:
        idx = md_content.find("LỜI CAM ĐOAN")
        md_content = "## " + md_content[idx:]

    # Replace \newpage with page-break div
    md_content = md_content.replace("\\newpage", '<div class="page-break"></div>')

    # Convert markdown to html with extensions
    extensions = ['extra', 'tables', 'fenced_code', 'toc', 'sane_lists']
    html_body = markdown.markdown(md_content, extensions=extensions)

    # Style math formulas with clean HTML equations
    formula_1 = (
        '<div class="math-box">'
        '<i>L</i><sub>pretrain</sub>(θ) = − ∑<sub>i=1</sub><sup>N</sup> log <i>P</i>(w<sub>i</sub> | w<sub>1</sub>, w<sub>2</sub>, ..., w<sub>i−1</sub>; θ)'
        '<span class="math-num">(2.1)</span>'
        '</div>'
    )
    formula_2 = (
        '<div class="math-box">'
        '<b>D</b> = { (x<sub>instruction</sub><sup>(j)</sup>, x<sub>input</sub><sup>(j)</sup>, y<sub>output</sub><sup>(j)</sup>) }<sub>j=1</sub><sup>M</sup>'
        '<span class="math-num">(2.2)</span>'
        '</div>'
    )
    formula_3 = (
        '<div class="math-box">'
        '<i>L</i><sub>SFT</sub>(θ) = − ∑<sub>j=1</sub><sup>M</sup> ∑<sub>t=1</sub><sup>|y<sup>(j)</sup>|</sup> log <i>P</i>(y<sub>t</sub><sup>(j)</sup> | x<sub>instruction</sub><sup>(j)</sup>, x<sub>input</sub><sup>(j)</sup>, y<sub>&lt;t</sub><sup>(j)</sup>; θ)'
        '<span class="math-num">(2.3)</span>'
        '</div>'
    )

    # Replace math blocks in HTML
    html_body = re.sub(r'<p>\$\$\\mathcal\{L\}_\{?\\text\{pretrain\}\}?\(.*?\)\$\s*</p>', formula_1, html_body, flags=re.DOTALL)
    html_body = re.sub(r'<p>\$\$\\mathcal\{D\} = \\left\\{.*?\\right\\}_\{j=1\}\^\{M\}\$\s*</p>', formula_2, html_body, flags=re.DOTALL)
    html_body = re.sub(r'<p>\$\$\\mathcal\{L\}_\{?\\text\{SFT\}\}?\(.*?\)\$\s*</p>', formula_3, html_body, flags=re.DOTALL)
    
    # Catch any remaining $$...$$
    html_body = re.sub(r'\$\$(.*?)\$\$', r'<div class="math-box"><i>\1</i></div>', html_body, flags=re.DOTALL)
    html_body = re.sub(r'\$(.*?)\$', r'<span class="inline-math"><i>\1</i></span>', html_body)

    # Wrap sections in clean styled containers
    html_template = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo cáo học phần: Phát triển ứng dụng AI - PetCare AI</title>
    <style>
        @page {{
            size: A4 portrait;
            margin: 25mm 20mm 20mm 25mm;
        }}

        *, *::before, *::after {{
            box-sizing: border-box;
        }}

        body {{
            font-family: "Times New Roman", "DejaVu Serif", Times, Georgia, serif;
            font-size: 13pt;
            line-height: 1.55;
            color: #111111;
            background: #ffffff;
            margin: 0;
            padding: 0;
            text-align: justify;
            text-justify: inter-word;
        }}

        .page-break {{
            page-break-before: always;
            break-before: page;
        }}

        /* COVER PAGE STYLING */
        .cover-page {{
            text-align: center;
            height: 96vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
            padding: 10px 0 20px 0;
        }}

        .cover-header {{
            margin-bottom: 20px;
        }}

        .cover-univ {{
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 6px 0;
            color: #0b2545;
        }}

        .cover-faculty {{
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 15px 0;
            color: #134074;
        }}

        .cover-divider {{
            width: 120px;
            height: 1.5px;
            background: #0b2545;
            margin: 0 auto;
        }}

        .cover-logo-wrapper {{
            margin: 25px auto;
            width: 130px;
            height: 130px;
        }}

        .cover-subject-block {{
            margin: 15px 0 20px 0;
        }}

        .cover-report-title {{
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 8px 0;
        }}

        .cover-subject-name {{
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            color: #0b2545;
        }}

        .cover-topic-block {{
            margin: 20px 0 30px 0;
            padding: 0 15px;
        }}

        .cover-topic-label {{
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 12px 0;
            letter-spacing: 1px;
        }}

        .cover-topic-title {{
            font-size: 17pt;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.35;
            margin: 0 0 12px 0;
            color: #0d1b2a;
        }}

        .cover-topic-sub {{
            font-size: 12pt;
            font-style: italic;
            color: #333333;
            margin: 0;
            line-height: 1.45;
        }}

        .cover-info-block {{
            margin: 30px auto 20px auto;
            width: 85%;
            text-align: left;
            font-size: 13pt;
            line-height: 1.8;
        }}

        .cover-info-row {{
            display: flex;
            margin-bottom: 6px;
        }}

        .cover-info-label {{
            width: 220px;
            font-weight: bold;
        }}

        .cover-info-value {{
            flex: 1;
        }}

        .cover-footer {{
            font-size: 13pt;
            font-weight: bold;
            margin-top: 15px;
        }}

        /* HEADINGS */
        h1 {{
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            margin-top: 28px;
            margin-bottom: 20px;
            letter-spacing: 0.5px;
            page-break-after: avoid;
            break-after: avoid;
        }}

        h2 {{
            font-size: 14pt;
            font-weight: bold;
            margin-top: 22px;
            margin-bottom: 12px;
            page-break-after: avoid;
            break-after: avoid;
            color: #0d1b2a;
        }}

        h3 {{
            font-size: 13pt;
            font-weight: bold;
            margin-top: 16px;
            margin-bottom: 10px;
            page-break-after: avoid;
            break-after: avoid;
        }}

        p {{
            margin-top: 0;
            margin-bottom: 12px;
            text-indent: 1.5em;
        }}

        .no-indent, .cover-page p, h1 + p, h2 + p, h3 + p, table p, blockquote p {{
            text-indent: 0;
        }}

        /* LISTS */
        ul, ol {{
            margin-top: 6px;
            margin-bottom: 14px;
            padding-left: 2em;
        }}

        li {{
            margin-bottom: 6px;
        }}

        /* TABLES: LATEX BOOKTABS STYLE */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11pt;
            line-height: 1.4;
            page-break-inside: avoid;
        }}

        th, td {{
            padding: 8px 10px;
            vertical-align: top;
            text-align: left;
        }}

        thead tr:first-child th {{
            border-top: 2px solid #111111;
            border-bottom: 1.2px solid #111111;
            font-weight: bold;
            text-align: center;
            background: #f8f9fa;
        }}

        tbody tr:last-child td {{
            border-bottom: 2px solid #111111;
        }}

        tbody tr {{
            border-bottom: 0.5px solid #e0e0e0;
        }}

        tbody tr:nth-child(even) {{
            background: #fafbfc;
        }}

        /* CODE LISTINGS & DIAGRAMS */
        pre {{
            background: #f7f9fa;
            border: 1px solid #d0d7de;
            border-radius: 4px;
            padding: 10px 12px;
            font-family: "Consolas", "Courier New", monospace;
            font-size: 8.5pt;
            line-height: 1.35;
            overflow-x: hidden;
            white-space: pre;
            margin: 14px 0;
            page-break-inside: avoid;
        }}

        code {{
            font-family: "Consolas", "Courier New", monospace;
            font-size: 9.5pt;
            background: #f2f4f6;
            padding: 2px 4px;
            border-radius: 3px;
        }}

        pre code {{
            background: transparent;
            padding: 0;
            font-size: 8.5pt;
            white-space: pre;
        }}

        /* MATH FORMULA BOX */
        .math-box {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 16px 0;
            padding: 8px 16px;
            background: #fdfdfd;
            border-radius: 4px;
            font-size: 13pt;
        }}

        .math-num {{
            font-style: normal;
            font-weight: bold;
            color: #333333;
        }}

        .inline-math {{
            font-style: italic;
        }}

        /* BLOCKQUOTES & CALLOUTS */
        blockquote {{
            border-left: 3px solid #0b2545;
            margin: 16px 0;
            padding: 8px 16px;
            background: #f4f6f9;
            font-size: 12pt;
        }}

        /* PRINT STYLING */
        @media print {{
            body {{
                font-size: 12.5pt;
            }}
            .cover-page {{
                height: 98vh;
            }}
        }}
    </style>
</head>
<body>

<!-- TRANG BÌA CHUẨN ICTU -->
<div class="cover-page">
    <div class="cover-header">
        <div class="cover-univ">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG</div>
        <div class="cover-faculty">KHOA CÔNG NGHỆ THÔNG TIN</div>
        <div class="cover-divider"></div>
    </div>

    <!-- LOGO ICTU VECTOR SVG -->
    <div class="cover-logo-wrapper">
        <svg viewBox="0 0 200 200" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="94" fill="#00529b" stroke="#00386b" stroke-width="3"/>
            <circle cx="100" cy="100" r="88" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,3"/>
            <circle cx="100" cy="100" r="76" fill="#ffffff"/>
            <path d="M 60,125 Q 100,105 100,135 Q 100,105 140,125 L 140,75 Q 100,55 100,85 Q 100,55 60,75 Z" fill="#00529b" stroke="#00386b" stroke-width="2"/>
            <path d="M 100,85 L 100,135" stroke="#ffffff" stroke-width="2"/>
            <ellipse cx="100" cy="98" rx="55" ry="24" fill="none" stroke="#e31837" stroke-width="2.5" transform="rotate(-25 100 98)"/>
            <circle cx="148" cy="76" r="5" fill="#e31837"/>
            <circle cx="52" cy="120" r="5" fill="#e31837"/>
            <text x="100" y="165" font-family="'Arial', sans-serif" font-size="16" font-weight="bold" fill="#00529b" text-anchor="middle" letter-spacing="2">ICTU</text>
        </svg>
    </div>

    <div class="cover-subject-block">
        <div class="cover-report-title">BÁO CÁO HỌC PHẦN</div>
        <div class="cover-subject-name">HỌC PHẦN: PHÁT TRIỂN ỨNG DỤNG AI</div>
    </div>

    <div class="cover-topic-block">
        <div class="cover-topic-label">ĐỀ TÀI</div>
        <div class="cover-topic-title">XÂY DỰNG HỆ THỐNG QUẢN LÝ PHÒNG KHÁM THÚ Y & TRỢ LÝ AI CHĂM SÓC THÚ CƯNG TOÀN DIỆN (PETCARE AI)</div>
        <div class="cover-topic-sub">Nghiên cứu và triển khai mô hình trí tuệ nhân tạo hỗ trợ tư vấn sức khỏe, chẩn đoán ban đầu và số hóa quy trình quản lý thú y đa nền tảng</div>
    </div>

    <div class="cover-info-block">
        <div class="cover-info-row">
            <div class="cover-info-label">Giảng viên hướng dẫn:</div>
            <div class="cover-info-value">TS. Trần Quang Quý</div>
        </div>
        <div class="cover-info-row">
            <div class="cover-info-label">Sinh viên thực hiện:</div>
            <div class="cover-info-value">Nhóm sinh viên nghiên cứu đề tài</div>
        </div>
        <div class="cover-info-row">
            <div class="cover-info-label">Mã sinh viên:</div>
            <div class="cover-info-value">DTC2154802010001</div>
        </div>
        <div class="cover-info-row">
            <div class="cover-info-label">Lớp:</div>
            <div class="cover-info-value">K20-CNTT01</div>
        </div>
    </div>

    <div class="cover-footer">
        Thái Nguyên, 2026
    </div>
</div>

<div class="page-break"></div>

<!-- NỘI DUNG CHÍNH TỪ MARKDOWN ĐÃ BIÊN TẬP -->
{html_body}

</body>
</html>
"""

    out_html = "/app/report_academic.html"
    with open(out_html, "w", encoding="utf-8") as f:
        f.write(html_template)
    
    print(f"HTML generated successfully at {out_html}")

if __name__ == "__main__":
    generate_html_report()

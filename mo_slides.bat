@echo off
chcp 65001 >nul
echo =====================================================================
echo    ĐANG MỞ SLIDES THUYẾT TRÌNH PETCARE AI (14 SLIDES CHUẨN ICTU)
echo =====================================================================
echo.
echo Phím tắt khi thuyết trình:
echo  - Mũi tên Phải / Phím Cách: Slide tiếp theo
echo  - Mũi tên Trái / Backspace: Slide trước đó
echo  - Phím F: Bật / Tắt chế độ toàn màn hình (Fullscreen)
echo  - Phím Home / End: Về slide đầu / slide cuối
echo.
start "" "%~dp0SLIDES_THUYET_TRINH_PETCARE_AI.html"
echo Đã mở thành công trên trình duyệt mặc định của bạn!
pause

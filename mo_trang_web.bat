@echo off
chcp 65001 >nul
cls
echo ======================================================================
echo          PETCARE AI - HỆ THỐNG QUẢN LÝ THÚ CƯNG & SIÊU THỊ SỐ
echo ======================================================================
echo.
echo [1] ĐƯỜNG DẪN MỞ TRỰC TIẾP TRÊN MÁY BẠN:
echo     👉 http://localhost:3000
echo.
echo [2] ĐƯỜNG DẪN GỬI CHO MỌI NGƯỜI (Điện thoại, laptop cùng Wi-Fi):
echo     👉 http://192.168.1.241:3000
echo.
echo [*] Xem siêu thị công khai (Không cần đăng nhập):
echo     👉 http://localhost:3000/shop
echo.
echo ----------------------------------------------------------------------
echo DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP THEO TỪNG VAI TRÒ:
echo.
echo  * QUẢN TRỊ VIÊN (Admin):
echo    Email: admin@petcare.local      | Pass: admin123
echo.
echo  * BÁC SĨ THÚ Y (Doctor):
echo    Email: doctor@petcare.local     | Pass: doctor123
echo.
echo  * LỄ TÂN TIẾP NHẬN (Receptionist):
echo    Email: reception@petcare.local  | Pass: reception123
echo.
echo  * ĐIỀU DƯỠNG (Caregiver):
echo    Email: caregiver@petcare.local  | Pass: caregiver123
echo.
echo  * CHỦ NUÔI CHÍNH (Bé Đen, Milo, Luna):
echo    Email: customer01@petcare.local | Pass: customer123
echo.
echo ======================================================================
echo Đang mở trình duyệt vào trang web của bạn...
start http://localhost:3000
pause

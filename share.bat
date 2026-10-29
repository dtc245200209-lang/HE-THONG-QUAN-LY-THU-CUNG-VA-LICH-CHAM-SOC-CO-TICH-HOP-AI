@echo off
chcp 65001 >nul
echo ========================================================
echo        PETCARE AI - CHIA SẺ TRUY CẬP CHO MỌI NGƯỜI
echo ========================================================
echo.
echo Đang mở đường truyền kết nối công khai (Bore Tunnel)...
echo Mọi người trên toàn thế giới có thể truy cập bằng link hiển thị bên dưới!
echo.
tools\bore.exe local 3000 --to bore.pub
pause

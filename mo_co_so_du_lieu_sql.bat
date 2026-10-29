@echo off
title PetCare AI - Ket noi Co so du lieu PostgreSQL That
chcp 65001 >nul
cls

echo ======================================================================
echo   PETCARE AI - CONG CU KET NOI TRUC TIEP CO SO DU LIEU SQL THAT
echo ======================================================================
echo.
echo Thong tin ket noi:
echo   - Host / Server : localhost
echo   - Port          : 5432
echo   - Database      : petcare
echo   - Username      : petcare
echo   - Password      : petcare123
echo   - Chuoi ket noi : postgresql://petcare:petcare123@localhost:5432/petcare
echo.
echo ======================================================================
echo   DANG KET NOI VAO POSTGRESQL (psql) TRONG CONTAINER DOCKER...
echo ======================================================================
echo   Mot so lenh SQL huu ich:
echo     \dt                   : Xem toan bo 34 bang trong database
echo     SELECT * FROM users;  : Xem tat ca tai khoan nguoi dung
echo     SELECT * FROM pets;   : Xem danh sach thu cung
echo     SELECT * FROM notifications; : Xem danh sach thong bao
echo     SELECT * FROM products;      : Xem danh sach san pham Pet Shop
echo     \q                    : Thoat khoi SQL
echo ======================================================================
echo.

docker exec -it petcare_db psql -U petcare -d petcare

pause

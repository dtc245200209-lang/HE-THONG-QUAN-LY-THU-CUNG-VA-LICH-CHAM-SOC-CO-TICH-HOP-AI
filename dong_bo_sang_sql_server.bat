@echo off
title PetCare AI - Dong bo sang Microsoft SQL Server (SSMS)
chcp 65001 >nul
cls

echo ======================================================================
echo   DANG XUAT VA DONG BO DU LIEU SANG MICROSOFT SQL SERVER...
echo ======================================================================
echo.

docker exec -i petcare_backend python export_to_sqlserver.py /app/PetCare_SQLServer.sql
copy /Y backend\PetCare_SQLServer.sql PetCare_SQLServer.sql >nul 2>&1
sqlcmd -S . -E -C -f 65001 -i PetCare_SQLServer.sql

echo.
echo ======================================================================
echo   HOAN TAT!
echo   Bay gio ban chi can vao SQL Server Management Studio (SSMS):
echo   1. Chuot phai vao muc 'Databases' o cot trai (Object Explorer).
echo   2. Chon 'Refresh' (hoac bam F5).
echo   3. Ban se thay Database 'PetCare' xuat hien voi day du 34 bang!
echo ======================================================================
echo.
pause

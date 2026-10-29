[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  PETCARE AI - CONG CU KET NOI TRUC TIEP CO SO DU LIEU SQL THAT" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Thong tin ket noi CSDL PostgreSQL:" -ForegroundColor Yellow
Write-Host "  - Host / Server : localhost"
Write-Host "  - Port          : 5432"
Write-Host "  - Database      : petcare"
Write-Host "  - Username      : petcare"
Write-Host "  - Password      : petcare123"
Write-Host "  - Connection URI: postgresql://petcare:petcare123@localhost:5432/petcare"
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  CAC LENH SQL HUU ICH:" -ForegroundColor Yellow
Write-Host "    \dt                            : Liet ke tat ca cac bang"
Write-Host "    SELECT * FROM users;           : Xem toan bo nguoi dung"
Write-Host "    SELECT * FROM pets;            : Xem toan bo thu cung"
Write-Host "    SELECT * FROM notifications;  : Xem thong bao that cua cac actor"
Write-Host "    SELECT * FROM products;       : Xem san pham Pet Shop trong DB"
Write-Host "    \q                             : Thoat khoi psql"
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dang mo phien lam viec PostgreSQL..." -ForegroundColor Green
Write-Host ""

docker exec -it petcare_db psql -U petcare -d petcare

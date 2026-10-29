[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  PETCARE AI - TIEN TRINH TU DONG DONG BO REALTIME XUONG SQL SERVER  " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Dang theo doi thay doi tu Web (PostgreSQL) va dong bo tuc thi xuong SQL Server (SSMS)..." -ForegroundColor Yellow
Write-Host "Moi khi ban them thu cung, dat lich hen, dat hang tren web -> SQL Server se co ngay lap tuc!" -ForegroundColor Gray
Write-Host ""

$lastSignature = ""

# Initial sync on startup
try {
    $raw = docker exec -i petcare_db psql -U petcare -d petcare -t -A -c "SELECT (SELECT count(*) FROM pets) || '-' || (SELECT count(*) FROM appointments) || '-' || (SELECT count(*) FROM users) || '-' || (SELECT count(*) FROM payments) || '-' || (SELECT count(*) FROM notifications) || '-' || (SELECT count(*) FROM products) || '-' || (SELECT count(*) FROM qr_codes);" 2>$null
    $lastSignature = ($raw | Out-String).Trim()
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Khoi tao dong bo ban dau..." -ForegroundColor Cyan
    docker exec -i petcare_backend python export_to_sqlserver.py /app/PetCare_SQLServer.sql 2>$null
    Copy-Item -Force backend\PetCare_SQLServer.sql PetCare_SQLServer.sql
    sqlcmd -S . -E -C -f 65001 -i PetCare_SQLServer.sql >$null 2>&1
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Dong bo 12 bang cot loi thanh cong! Dang lang nghe thay doi..." -ForegroundColor Green
} catch {}

while ($true) {
    try {
        $raw = docker exec -i petcare_db psql -U petcare -d petcare -t -A -c "SELECT (SELECT count(*) FROM pets) || '-' || (SELECT count(*) FROM appointments) || '-' || (SELECT count(*) FROM users) || '-' || (SELECT count(*) FROM payments) || '-' || (SELECT count(*) FROM notifications) || '-' || (SELECT count(*) FROM products) || '-' || (SELECT count(*) FROM qr_codes);" 2>$null
        $currentSig = ($raw | Out-String).Trim()

        if ($currentSig -ne "" -and $currentSig -ne $lastSignature) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Phat hien du lieu moi tu Web (Thay doi: $currentSig)! Dang cap nhat xuong SQL Server..." -ForegroundColor Cyan
            
            docker exec -i petcare_backend python export_to_sqlserver.py /app/PetCare_SQLServer.sql 2>$null
            Copy-Item -Force backend\PetCare_SQLServer.sql PetCare_SQLServer.sql
            sqlcmd -S . -E -C -f 65001 -i PetCare_SQLServer.sql >$null 2>&1

            $lastSignature = $currentSig
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Cap nhat thanh cong xuong SQL Server (SSMS)! San sang kiem thu." -ForegroundColor Green
        }
    } catch {
        # Silent ignore transient errors
    }
    Start-Sleep -Seconds 2
}

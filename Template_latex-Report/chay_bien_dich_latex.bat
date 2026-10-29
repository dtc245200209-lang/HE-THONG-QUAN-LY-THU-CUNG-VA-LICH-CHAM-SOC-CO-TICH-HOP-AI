@echo off
chcp 65001 >nul
echo ====================================================================
echo           BIEN DICH BAO CAO LATEX HOC PHAN PETCARE AI
echo ====================================================================
echo.
cd /d "%~dp0"

echo Dang chay trinh bien dich Tectonic / XeLaTeX...
"..\tools\tectonic.exe" main.tex --outdir .

if %ERRORLEVEL% equ 0 (
    echo.
    echo ====================================================================
    echo [THANH CONG] Xuat file PDF thanh cong: main.pdf
    copy /y main.pdf "..\BAO_CAO_LATEX_PETCARE_AI.pdf" >nul
    echo Da dong bo ban sao toi: ..\BAO_CAO_LATEX_PETCARE_AI.pdf
    echo ====================================================================
) else (
    echo.
    echo [THAT BAI] Qua trinh bien dich phat sinh loi!
)

pause

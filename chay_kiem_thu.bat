@echo off
chcp 65001 >nul
title BÁO CÁO KẾT QUẢ KIỂM THỬ HỆ THỐNG PETCARE AI
echo =====================================================================
echo    ĐANG CHẠY BỘ KIỂM THỬ TOÀN DIỆN HỆ THỐNG PETCARE AI
echo =====================================================================
echo.

docker exec petcare_backend python chay_kiem_thu_he_thong.py

echo.
echo =====================================================================
echo    BẠN CÓ THỂ MỞ THÊM CÁC TÀI LIỆU KIỂM ĐỊNH CHI TIẾT TRONG THƯ MỤC DOCS:
echo    1. docs\FINAL_PASS_FAIL_SCORECARD.md (Bảng điểm 57 tiêu chí)
echo    2. docs\RELEASE_VERIFICATION_MATRIX.md (Ma trận kiểm thử phát hành)
echo    3. docs\RELEASE_BUG_LOG.md (Nhật ký sửa lỗi hệ thống)
echo =====================================================================
echo.
pause

@echo off
title PetCare AI - Tien trinh Tu dong Dong bo Realtime sang SQL Server (SSMS)
chcp 65001 >nul
cls

powershell -NoProfile -ExecutionPolicy Bypass -File auto_sync_daemon.ps1
pause

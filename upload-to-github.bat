@echo off
chcp 65001 >nul
echo ========================================
echo   رفع المشروع على GitHub تلقائياً
echo ========================================
echo.

REM التحقق من وجود Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Git غير مثبت!
    echo.
    echo يرجى تثبيت Git من: https://git-scm.com/download/win
    echo او استخدم GitHub Desktop: https://desktop.github.com
    echo.
    pause
    exit /b 1
)
echo [OK] Git موجود

echo [1/5] تهيئة Git...
git init

echo.
echo [2/5] إضافة الملفات...
git add .

echo.
echo [3/5] عمل Commit...
git commit -m "Initial commit - Kasrah Games project"

echo.
echo [4/5] إعداد Remote...
set REPO_URL=https://github.com/AbuSalehBinshaq/Kasrah-Games.git

git remote add origin %REPO_URL% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [تحذير] Remote موجود مسبقاً، سيتم تحديثه...
    git remote set-url origin %REPO_URL%
)
echo [✓] تم إعداد Remote: %REPO_URL%

echo.
echo [5/5] رفع المشروع...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   تم! ✅
echo ========================================
echo.
echo المشروع تم رفعه على GitHub بنجاح!
echo.
echo للتحديثات المستقبلية:
echo   git add .
echo   git commit -m "وصف التعديلات"
echo   git push
echo.
pause


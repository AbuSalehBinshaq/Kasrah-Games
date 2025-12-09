# Script لرفع المشروع على GitHub (بدون تثبيت)
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  رفع المشروع على GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من Git
Write-Host "[1/6] التحقق من Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Git موجود" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "[X] Git غير موجود!" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى تثبيت Git من:" -ForegroundColor Yellow
    Write-Host "https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "او استخدم GitHub Desktop:" -ForegroundColor Yellow
    Write-Host "https://desktop.github.com" -ForegroundColor Cyan
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host ""
Write-Host "[2/6] تهيئة Git..." -ForegroundColor Yellow
if (!(Test-Path ".git")) {
    git init
    Write-Host "[OK] تم تهيئة Git" -ForegroundColor Green
} else {
    Write-Host "[OK] Git مهيأ مسبقا" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/6] اضافة الملفات..." -ForegroundColor Yellow
git add .
Write-Host "[OK] تم اضافة الملفات" -ForegroundColor Green

Write-Host ""
Write-Host "[4/6] عمل Commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Kasrah Games project" 2>&1 | Out-Null
Write-Host "[OK] تم عمل Commit" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] اعداد Remote..." -ForegroundColor Yellow
$repoUrl = "https://github.com/AbuSalehBinshaq/Kasrah-Games.git"

$existingRemote = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    git remote set-url origin $repoUrl
    Write-Host "[OK] تم تحديث Remote" -ForegroundColor Green
} else {
    git remote add origin $repoUrl
    Write-Host "[OK] تم اضافة Remote" -ForegroundColor Green
}

Write-Host ""
Write-Host "[6/6] رفع المشروع..." -ForegroundColor Yellow
git branch -M main 2>&1 | Out-Null

Write-Host ""
Write-Host "سيطلب منك:" -ForegroundColor Yellow
Write-Host "Username: AbuSalehBinshaq" -ForegroundColor Cyan
Write-Host "Password: Personal Access Token" -ForegroundColor Cyan
Write-Host ""
Write-Host "للحصول على Token:" -ForegroundColor Yellow
Write-Host "https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "هل انت مستعد للرفع؟ (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "تم الالغاء" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "جاري الرفع..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  تم الرفع بنجاح!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "المشروع متاح على:" -ForegroundColor Cyan
    Write-Host "https://github.com/AbuSalehBinshaq/Kasrah-Games" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[X] حدث خطأ" -ForegroundColor Red
    Write-Host ""
    Write-Host "الحلول:" -ForegroundColor Yellow
    Write-Host "1. تاكد من استخدام Personal Access Token" -ForegroundColor Yellow
    Write-Host "2. تاكد من ان المستودع موجود على GitHub" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "اضغط Enter للخروج"

# PowerShell script لرفع المشروع على GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  رفع المشروع على GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "[✓] Git موجود: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Git غير مثبت!" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى تثبيت Git من أحد الخيارات التالية:" -ForegroundColor Yellow
    Write-Host "1. Git for Windows: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. GitHub Desktop: https://desktop.github.com" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "بعد التثبيت، أعد تشغيل هذا الملف." -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host ""
Write-Host "[1/6] التحقق من حالة Git..." -ForegroundColor Yellow

# التحقق من وجود .git
if (Test-Path ".git") {
    Write-Host "[✓] المشروع مربوط بـ Git مسبقاً" -ForegroundColor Green
} else {
    Write-Host "[→] تهيئة Git..." -ForegroundColor Yellow
    git init
    Write-Host "[✓] تم تهيئة Git" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/6] إضافة الملفات..." -ForegroundColor Yellow
git add .
Write-Host "[✓] تم إضافة الملفات" -ForegroundColor Green

Write-Host ""
Write-Host "[3/6] عمل Commit..." -ForegroundColor Yellow
try {
    git commit -m "Initial commit - Kasrah Games project" 2>&1 | Out-Null
    Write-Host "[✓] تم عمل Commit" -ForegroundColor Green
} catch {
    Write-Host "[!] لا توجد تغييرات جديدة للرفع" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/6] إعداد Remote..." -ForegroundColor Yellow
$repoUrl = "https://github.com/AbuSalehBinshaq/Kasrah-Games.git"

# التحقق من وجود remote
$existingRemote = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[→] Remote موجود، سيتم تحديثه..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    git remote add origin $repoUrl
}
Write-Host "[✓] تم إعداد Remote: $repoUrl" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] تعيين الفرع الرئيسي..." -ForegroundColor Yellow
git branch -M main 2>&1 | Out-Null
Write-Host "[✓] تم تعيين الفرع الرئيسي" -ForegroundColor Green

Write-Host ""
Write-Host "[6/6] رفع المشروع..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  سيطلب منك اسم المستخدم وكلمة المرور:" -ForegroundColor Yellow
Write-Host "   - استخدم اسم المستخدم: AbuSalehBinshaq" -ForegroundColor Yellow
Write-Host "   - استخدم Personal Access Token ككلمة مرور" -ForegroundColor Yellow
Write-Host ""
Write-Host "   كيفية الحصول على Token:" -ForegroundColor Cyan
Write-Host "   1. اذهب إلى: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "   2. اضغط 'Generate new token (classic)'" -ForegroundColor Cyan
Write-Host "   3. اختر 'repo' (كامل)" -ForegroundColor Cyan
Write-Host "   4. انسخ الـ Token واستخدمه ككلمة مرور" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "هل أنت مستعد للرفع؟ (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "تم الإلغاء." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "جارٍ الرفع..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  تم الرفع بنجاح! ✅" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "المشروع متاح على:" -ForegroundColor Cyan
    Write-Host "https://github.com/AbuSalehBinshaq/Kasrah-Games" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[✗] حدث خطأ أثناء الرفع" -ForegroundColor Red
    Write-Host ""
    Write-Host "الحلول المقترحة:" -ForegroundColor Yellow
    Write-Host "1. تأكد من استخدام Personal Access Token" -ForegroundColor Yellow
    Write-Host "2. تأكد من أن المستودع موجود على GitHub" -ForegroundColor Yellow
    Write-Host "3. جرب استخدام GitHub Desktop" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "اضغط Enter للخروج"


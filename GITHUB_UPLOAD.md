# 📤 رفع المشروع على GitHub - خطوة بخطوة

## ✅ المتطلبات:
1. حساب GitHub (موجود ✅)
2. Git مثبت على جهازك
3. المشروع جاهز

---

## 🚀 الخطوات:

### 1️⃣ تثبيت Git (إذا لم يكن مثبتاً)

**للتحقق:**
```bash
git --version
```

**إذا لم يكن مثبتاً:**
- Windows: حمّل من [git-scm.com](https://git-scm.com/download/win)
- أو استخدم GitHub Desktop: [desktop.github.com](https://desktop.github.com)

---

### 2️⃣ إنشاء مستودع جديد على GitHub

1. اذهب إلى [github.com](https://github.com)
2. اضغط على **"+"** في الأعلى → **"New repository"**
3. املأ البيانات:
   - **Repository name**: `kasrah-games` (أو أي اسم تريده)
   - **Description**: "منصة ألعاب HTML5 و WebGL"
   - **Public** أو **Private** (اختر ما تريد)
   - **لا** تضع علامة على "Initialize with README"
4. اضغط **"Create repository"**

---

### 3️⃣ ربط المشروع بـ Git

افتح **Terminal** أو **Command Prompt** أو **PowerShell** في مجلد المشروع:

```bash
# انتقل لمجلد المشروع
cd "C:\Users\user\Downloads\Kasrah-Games-Updated\home\ubuntu\project"

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# عمل Commit
git commit -m "Initial commit - Kasrah Games project"

# إضافة Remote (استبدل YOUR_USERNAME و REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# رفع المشروع
git branch -M main
git push -u origin main
```

---

### 4️⃣ إذا طلب منك اسم المستخدم وكلمة المرور:

**الخيار 1: استخدام Personal Access Token**
1. اذهب إلى GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. اضغط "Generate new token"
3. اختر الصلاحيات: `repo` (كامل)
4. انسخ الـ Token
5. عند السؤال عن كلمة المرور، استخدم الـ Token

**الخيار 2: استخدام GitHub Desktop**
- أسهل طريقة! حمّل GitHub Desktop وارفع من هناك

---

## 📝 الأوامر الكاملة (انسخ والصق):

```bash
# 1. تهيئة Git
git init

# 2. إضافة الملفات
git add .

# 3. Commit
git commit -m "Initial commit - Kasrah Games"

# 4. إضافة Remote (استبدل بالرابط الصحيح)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 5. رفع المشروع
git branch -M main
git push -u origin main
```

---

## 🔄 التحديثات المستقبلية:

بعد أي تعديل:

```bash
git add .
git commit -m "وصف التعديلات"
git push
```

---

## 🆘 حل المشاكل:

### خطأ: "git is not recognized"
- ثبت Git من [git-scm.com](https://git-scm.com/download/win)
- أو استخدم GitHub Desktop

### خطأ: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### خطأ في المصادقة:
- استخدم Personal Access Token بدلاً من كلمة المرور
- أو استخدم GitHub Desktop

---

## 💡 نصيحة:

**استخدم GitHub Desktop** - أسهل طريقة:
1. حمّل من [desktop.github.com](https://desktop.github.com)
2. افتح GitHub Desktop
3. File → Add Local Repository
4. اختر مجلد المشروع
5. Publish repository

---

## ✅ بعد الرفع:

- ✅ المشروع على GitHub
- ✅ يمكنك مشاركته
- ✅ يمكنك ربطه بـ Vercel للنشر التلقائي
- ✅ يمكنك التعديل ورفع التحديثات

---

**ملاحظة**: تأكد من عدم رفع ملف `.env` (موجود في .gitignore ✅)


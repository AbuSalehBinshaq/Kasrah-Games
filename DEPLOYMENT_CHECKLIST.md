# قائمة التحقق من النشر - Kasrah Games

## ✅ قبل النشر

### 1. إعداد Environment Variables
- [ ] `DATABASE_URL` - رابط قاعدة البيانات PostgreSQL
- [ ] `JWT_SECRET` - مفتاح JWT قوي (32 حرف على الأقل)
- [ ] `JWT_EXPIRES_IN` - مدة صلاحية Token (افتراضي: 7d)
- [ ] `NEXT_PUBLIC_SITE_URL` - رابط الموقع الكامل
- [ ] `NEXT_PUBLIC_CONTACT_EMAIL` - البريد الإلكتروني
- [ ] `RESEND_API_KEY` - (اختياري) مفتاح Resend API
- [ ] `NODE_ENV=production` - بيئة الإنتاج

### 2. قاعدة البيانات
- [ ] إنشاء قاعدة بيانات PostgreSQL
- [ ] الحصول على `DATABASE_URL`
- [ ] تشغيل Migrations: `npm run prisma:migrate`
- [ ] التحقق من اتصال قاعدة البيانات

### 3. البناء والاختبار
- [ ] `npm install` - تثبيت الـ dependencies
- [ ] `npm run build` - البناء بدون أخطاء
- [ ] `npm start` - اختبار محلي
- [ ] التحقق من جميع الصفحات

### 4. الأمان
- [ ] تغيير `JWT_SECRET` إلى قيمة قوية وآمنة
- [ ] التأكد من أن `.env` في `.gitignore`
- [ ] إعداد HTTPS/SSL
- [ ] مراجعة Security Headers

## 🚀 خطوات النشر

### على Vercel:
1. ربط المشروع بـ GitHub/GitLab
2. إضافة Environment Variables في Settings
3. إضافة Build Command: `npm run build` (يحتوي على prisma generate)
4. Deploy

### على Render:
1. ربط المشروع بـ GitHub/GitLab
2. إضافة Environment Variables في Settings
3. **Build Command الموصى به**: `npm install && npm run build`
   - ملاحظة: لا حاجة لـ `npm run prisma:generate` منفصل
   - `postinstall` script سيولد Prisma Client تلقائياً بعد `npm install`
   - `build` script يحتوي على `prisma generate` كإجراء احتياطي
4. **Start Command**: `npm start`
5. **PostgreSQL**: إنشاء قاعدة بيانات منفصلة وتحديد `DATABASE_URL`
6. **Migrations**: سيتم تشغيلها تلقائياً عند أول تشغيل (أو يدوياً: `npm run prisma:migrate`)

### على خادم خاص:
```bash
# 1. رفع الملفات
git clone your-repo
cd kasrah-games

# 2. تثبيت Dependencies
npm install

# 3. إعداد .env
cp .env.example .env
nano .env  # تعديل القيم

# 4. إعداد قاعدة البيانات
npm run prisma:generate
npm run prisma:migrate

# 5. البناء
npm run build

# 6. التشغيل
npm start
# أو باستخدام PM2:
pm2 start npm --name "kasrah-games" -- start
```

## 🔍 بعد النشر

- [ ] فتح الموقع والتحقق من أنه يعمل
- [ ] اختبار تسجيل الدخول
- [ ] اختبار لوحة التحكم الإدارية
- [ ] إنشاء حساب إداري
- [ ] اختبار إضافة لعبة
- [ ] التحقق من الصور والملفات الثابتة
- [ ] اختبار على Mobile

## 🐛 حل المشاكل الشائعة

### خطأ: "Prisma Client not generated"
```bash
npm run prisma:generate
```

### خطأ: "Database connection failed"
- تحقق من `DATABASE_URL`
- تأكد من أن قاعدة البيانات متاحة
- تحقق من Firewall rules

### خطأ: "JWT_SECRET is not defined"
- أضف `JWT_SECRET` في Environment Variables

### الموقع بطيء
- تأكد من `NODE_ENV=production`
- استخدم CDN للصور
- راجع إعدادات Next.js

## 📝 ملاحظات مهمة

1. **Prisma Client**: يتم توليده تلقائياً عند `npm install` (postinstall script)
2. **Build Command**: يحتوي على `prisma generate` تلقائياً كإجراء احتياطي
3. **ترتيب أوامر Prisma**:
   - `postinstall`: `prisma generate` - يتم تشغيله تلقائياً بعد `npm install`
   - `build`: `prisma generate && next build` - يضمن أن Prisma Client محدث قبل البناء
   - **على Render**: استخدم `npm install && npm run build` (بدون `prisma:generate` منفصل)
4. **Sitemap**: يعمل حتى بدون قاعدة بيانات (يعرض الصفحات الثابتة فقط)
5. **CORS**: يتم إعداده تلقائياً بناءً على `NEXT_PUBLIC_SITE_URL` أو `VERCEL_URL`
6. **Database**: تأكد من تشغيل migrations قبل النشر

---

**تم إعداد هذه القائمة لضمان نشر ناجح للمشروع**


# تعليمات إعداد وتشغيل المشروع

## المتطلبات الأساسية

1. **Node.js** (الإصدار 18.0.0 أو أحدث)
   - تحميل من: https://nodejs.org/
   - التحقق من التثبيت: `node --version`

2. **PostgreSQL** (أو أي قاعدة بيانات تدعمها Prisma)
   - تحميل من: https://www.postgresql.org/download/
   - أو استخدام قاعدة بيانات سحابية مثل Supabase

3. **npm** أو **pnpm** (يأتي مع Node.js)

## خطوات الإعداد

### 1. تثبيت الـ Dependencies

```bash
npm install
```

أو إذا كنت تستخدم pnpm:

```bash
pnpm install
```

### 2. إعداد ملف البيئة (.env)

قم بإنشاء ملف `.env` في المجلد الرئيسي للمشروع وأضف المتغيرات التالية:

```env
# قاعدة البيانات - استبدل بالقيم الصحيحة
DATABASE_URL="postgresql://username:password@localhost:5432/kasrah_games?schema=public"

# JWT Secret - استبدل بمفتاح عشوائي قوي
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"

# مدة صلاحية Token (اختياري)
JWT_EXPIRES_IN="7d"

# رابط الموقع (اختياري)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# البريد الإلكتروني (اختياري)
NEXT_PUBLIC_CONTACT_EMAIL="info@kasrahgames.example"

# مفتاح API للبريد (اختياري - للاستخدام مع Resend)
RESEND_API_KEY=""
CONTACT_EMAIL="info@kasrahgames.example"

# بيئة التشغيل
NODE_ENV="development"
```

**ملاحظة مهمة**: 
- استبدل `username` و `password` بمعلومات قاعدة البيانات الخاصة بك
- استبدل `JWT_SECRET` بمفتاح عشوائي قوي (يُنصح باستخدام 32 حرف على الأقل)

### 3. إعداد قاعدة البيانات

#### أ. إنشاء قاعدة البيانات

إذا كنت تستخدم PostgreSQL محلياً:

```sql
CREATE DATABASE kasrah_games;
```

#### ب. تشغيل Migrations

```bash
# توليد Prisma Client
npm run prisma:generate

# تشغيل Migrations لإنشاء الجداول
npm run prisma:migrate
```

#### ج. (اختياري) فتح Prisma Studio

لإدارة قاعدة البيانات بشكل مرئي:

```bash
npm run prisma:studio
```

سيفتح المتصفح على: `http://localhost:5555`

### 4. تشغيل المشروع

```bash
# وضع التطوير
npm run dev
```

المشروع سيعمل على: **http://localhost:3000**

## إنشاء حساب إداري

بعد إنشاء حساب عادي من صفحة التسجيل، يمكنك ترقيته إلى إداري باستخدام:

```bash
node promote_admin.js your-email@example.com
```

## الأوامر المتاحة

```bash
# التطوير
npm run dev              # تشغيل خادم التطوير

# البناء
npm run build            # بناء المشروع للإنتاج
npm run start            # تشغيل المشروع بعد البناء

# Prisma
npm run prisma:generate  # توليد Prisma Client
npm run prisma:migrate   # تشغيل Migrations
npm run prisma:studio    # فتح Prisma Studio

# الاختبارات
npm run test             # تشغيل الاختبارات
npm run test:watch       # تشغيل الاختبارات في وضع المراقبة
npm run test:coverage    # تقرير تغطية الاختبارات

# أخرى
npm run lint             # فحص الكود
```

## استكشاف الأخطاء

### المشكلة: "Cannot find module '@prisma/client'"
**الحل**: قم بتشغيل `npm run prisma:generate`

### المشكلة: "Error: P1001: Can't reach database server"
**الحل**: 
- تأكد من أن PostgreSQL يعمل
- تحقق من صحة `DATABASE_URL` في ملف `.env`
- تأكد من أن قاعدة البيانات موجودة

### المشكلة: "JWT_SECRET is not defined"
**الحل**: تأكد من إضافة `JWT_SECRET` في ملف `.env`

### المشكلة: Port 3000 already in use
**الحل**: 
- أغلق التطبيق الذي يستخدم المنفذ 3000
- أو قم بتغيير المنفذ: `npm run dev -- -p 3001`

## الخطوات التالية

1. ✅ تثبيت Node.js و PostgreSQL
2. ✅ تثبيت الـ dependencies
3. ✅ إنشاء ملف `.env`
4. ✅ إعداد قاعدة البيانات
5. ✅ تشغيل المشروع
6. ✅ إنشاء حساب وترقيته إلى إداري
7. ✅ البدء في إضافة الألعاب!

---

**ملاحظة**: إذا واجهت أي مشاكل، تأكد من:
- أن جميع المتطلبات مثبتة بشكل صحيح
- أن ملف `.env` موجود ويحتوي على جميع المتغيرات المطلوبة
- أن قاعدة البيانات تعمل ويمكن الوصول إليها


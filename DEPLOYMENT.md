# دليل النشر - Kasrah Games

## ✅ نعم، يمكنك التعديل لاحقاً!

**البناء (`npm run build`) لا يمنع التعديلات المستقبلية.** يمكنك:
- تعديل الكود في أي وقت
- إعادة البناء (`npm run build`)
- إعادة النشر
- التعديلات ستظهر مباشرة بعد إعادة النشر

---

## 🚀 خيارات النشر

### الخيار 1: Vercel (الأسهل والأسرع) ⭐ موصى به

Vercel هو منصة النشر الرسمية لـ Next.js وتدعم المشروع بشكل كامل.

#### خطوات النشر على Vercel:

1. **إنشاء حساب على Vercel**
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل بحساب GitHub/GitLab/Bitbucket

2. **ربط المشروع**
   - اضغط "Add New Project"
   - اختر المستودع (Repository) الخاص بك
   - أو ارفع المشروع مباشرة

3. **إعداد متغيرات البيئة**
   في صفحة إعدادات المشروع، أضف:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRES_IN=7d
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
   RESEND_API_KEY=your-resend-api-key (اختياري)
   ```

4. **إعداد قاعدة البيانات**
   - استخدم قاعدة بيانات PostgreSQL (مثل [Supabase](https://supabase.com) أو [Railway](https://railway.app) أو [Neon](https://neon.tech))
   - احصل على `DATABASE_URL` من مزود قاعدة البيانات
   - في Vercel، أضف `DATABASE_URL` في Environment Variables

5. **تشغيل Migrations**
   - في Vercel، اذهب إلى Settings → Build & Development Settings
   - أضف Build Command: `npm run prisma:generate && npm run build`
   - أو استخدم Vercel CLI محلياً:
     ```bash
     npm install -g vercel
     vercel login
     vercel link
     vercel env pull .env.local
     npx prisma migrate deploy
     ```

6. **النشر**
   - اضغط "Deploy"
   - Vercel سيبني المشروع تلقائياً
   - بعد الانتهاء، ستحصل على رابط الموقع

#### التحديثات المستقبلية:
- ادفع التغييرات إلى Git
- Vercel سيبني وينشر تلقائياً
- أو استخدم `vercel --prod` من محلي

---

### الخيار 2: خادم خاص (VPS/Cloud Server)

#### المتطلبات:
- خادم Ubuntu/Debian
- Node.js 18+ مثبت
- PostgreSQL مثبت
- PM2 (لإدارة العملية) - اختياري

#### خطوات النشر:

1. **رفع الملفات**
   ```bash
   # على الخادم
   git clone your-repo-url
   cd project
   npm install
   ```

2. **إعداد قاعدة البيانات**
   ```bash
   # إنشاء قاعدة بيانات PostgreSQL
   sudo -u postgres createdb kasrah_games
   
   # إعداد .env
   nano .env
   # أضف:
   DATABASE_URL="postgresql://user:password@localhost:5432/kasrah_games"
   JWT_SECRET="your-secret-key"
   ```

3. **تشغيل Migrations**
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```

4. **بناء المشروع**
   ```bash
   npm run build
   ```

5. **تشغيل المشروع**

   **الطريقة 1: باستخدام PM2 (موصى به)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "kasrah-games" -- start
   pm2 save
   pm2 startup  # لإعادة التشغيل التلقائي
   ```

   **الطريقة 2: مباشرة**
   ```bash
   npm start
   ```

6. **إعداد Nginx كـ Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **إعداد SSL مع Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

#### التحديثات المستقبلية:
```bash
# على الخادم
git pull
npm install
npm run build
pm2 restart kasrah-games  # أو npm start
```

---

### الخيار 3: Railway.app

Railway يوفر قاعدة بيانات PostgreSQL + استضافة في مكان واحد.

1. اذهب إلى [railway.app](https://railway.app)
2. أنشئ مشروع جديد
3. أضف PostgreSQL Database
4. أضف GitHub Repo
5. أضف Environment Variables
6. Railway سيبني وينشر تلقائياً

---

## 📋 قائمة التحقق قبل النشر

- [ ] ✅ `npm run build` يعمل بدون أخطاء
- [ ] ✅ قاعدة البيانات جاهزة ومتصلة
- [ ] ✅ Migrations تم تشغيلها (`prisma migrate deploy`)
- [ ] ✅ جميع Environment Variables محددة
- [ ] ✅ `JWT_SECRET` قوي وآمن
- [ ] ✅ `DATABASE_URL` صحيح
- [ ] ✅ حساب إداري تم إنشاؤه
- [ ] ✅ الصور والملفات الثابتة في `/public` جاهزة
- [ ] ✅ اختبار الموقع محلياً (`npm start`)

---

## 🔄 التحديثات بعد النشر

### على Vercel:
1. عدّل الكود محلياً
2. ادفع إلى Git: `git push`
3. Vercel يبني وينشر تلقائياً

### على خادم خاص:
```bash
git pull
npm install
npm run build
pm2 restart kasrah-games
```

---

## 🛠️ حل المشاكل الشائعة

### خطأ في الاتصال بقاعدة البيانات
- تأكد من `DATABASE_URL` صحيح
- تأكد من أن قاعدة البيانات متاحة من الخارج (للخوادم السحابية)

### خطأ في Prisma
```bash
npm run prisma:generate
npx prisma migrate deploy
```

### الموقع بطيء
- تأكد من `NODE_ENV=production`
- استخدم CDN للصور
- راجع إعدادات Next.js

---

## 📞 الدعم

إذا واجهت مشاكل في النشر، راجع:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**ملاحظة مهمة**: بعد النشر، تأكد من:
1. تغيير `JWT_SECRET` إلى قيمة قوية وآمنة
2. إعداد HTTPS (SSL)
3. نسخ احتياطي لقاعدة البيانات بانتظام
4. مراقبة الأداء والأخطاء


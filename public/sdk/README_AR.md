# Kasrah Games SDK v3.0.0

## مقدمة

**Kasrah Games SDK** هو مكتبة JavaScript احترافية وقوية لدمج الألعاب مع منصة Kasrah Games. توفر SDK تكاملاً سهلاً وآمناً مع جميع ميزات المنصة.

## الميزات الرئيسية

✅ **إعلانات متقدمة** - إعلانات فيديو وإعلانات مكافأة  
✅ **حفظ البيانات السحابي** - مزامنة آمنة للبيانات عبر الأجهزة  
✅ **حسابات المستخدمين** - دعم كامل لحسابات اللاعبين  
✅ **نظام الأحداث** - نظام أحداث مرن وقوي  
✅ **التحليلات** - تتبع شامل لسلوك اللاعبين  
✅ **معالجة الأخطاء** - نظام معالجة أخطاء متقدم  
✅ **وضع التطوير** - رسائل تصحيح واضحة وملونة  

## التثبيت

### الطريقة 1: إضافة السكربت مباشرة

```html
<script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
```

### الطريقة 2: مع التهيئة التلقائية

```html
<script 
  src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"
  data-auto-init
  data-game-id="your-game-id">
</script>
```

## البدء السريع

### 1. التهيئة الأساسية

```javascript
// تهيئة SDK
KasrahSDK.init({
  gameId: 'your-game-id',
  debugMode: true,
  enableAnalytics: true
});

// الاستماع لحدث التهيئة
KasrahSDK.on('initialized', (data) => {
  console.log('SDK initialized:', data);
});
```

### 2. عرض الإعلانات

```javascript
// عرض إعلان فيديو
KasrahSDK.showVideoAd().then((success) => {
  if (success) {
    console.log('Ad shown successfully');
  }
});

// عرض إعلان مكافأة
KasrahSDK.showRewardedAd().then((success) => {
  if (success) {
    console.log('Rewarded ad shown');
  }
});
```

### 3. الاستماع لأحداث الإعلانات

```javascript
// عند بدء الإعلان
KasrahSDK.on('adStarted', (data) => {
  game.pause();
  game.mute();
  console.log('Ad started:', data);
});

// عند انتهاء الإعلان
KasrahSDK.on('adFinished', (data) => {
  game.resume();
  game.unmute();
  console.log('Ad finished:', data);
});

// عند حدوث خطأ
KasrahSDK.on('adError', (data) => {
  console.error('Ad error:', data);
});
```

### 4. حفظ وتحميل البيانات

```javascript
// حفظ البيانات
await KasrahSDK.saveData('playerScore', {
  score: 1500,
  level: 5,
  timestamp: Date.now()
});

// تحميل البيانات
const playerData = await KasrahSDK.loadData('playerScore');
console.log('Player data:', playerData);

// حذف البيانات
KasrahSDK.clearData('playerScore');
```

### 5. تتبع الأحداث

```javascript
// تتبع حدث مخصص
KasrahSDK.trackEvent('levelComplete', {
  level: 5,
  score: 1500,
  time: 120
});

// تتبع حدث آخر
KasrahSDK.trackEvent('itemPurchased', {
  itemId: 'sword-001',
  price: 100
});
```

## الإعدادات المتقدمة

### التهيئة المخصصة

```javascript
KasrahSDK.manualInit({
  gameId: 'your-game-id',
  apiUrl: 'https://kasrah-games.onrender.com/api/sdk',
  debugMode: true,
  enableAnalytics: true,
  adFrequency: 3,           // عرض إعلان كل 3 طلبات
  autoPlayDelay: 5000,      // تأخير 5 ثواني قبل بدء اللعبة
  timeout: 10000            // timeout للطلبات = 10 ثواني
});
```

## إدارة حسابات المستخدمين

### تعيين المستخدم

```javascript
// بعد تسجيل دخول المستخدم
KasrahSDK.setUser({
  id: 'user-123',
  username: 'player',
  email: 'player@example.com'
});

// الاستماع لحدث تعيين المستخدم
KasrahSDK.on('userSet', (user) => {
  console.log('User set:', user);
});
```

### تسجيل الخروج

```javascript
KasrahSDK.clearUser();

KasrahSDK.on('userCleared', () => {
  console.log('User logged out');
});
```

## نظام الأحداث

### الأحداث المتاحة

| الحدث | الوصف |
|------|-------|
| `initialized` | تم تهيئة SDK بنجاح |
| `adStarted` | بدء عرض الإعلان |
| `adFinished` | انتهاء عرض الإعلان |
| `adError` | حدث خطأ في الإعلان |
| `dataSaved` | تم حفظ البيانات |
| `dataError` | خطأ في حفظ البيانات |
| `userSet` | تم تعيين المستخدم |
| `userCleared` | تم تسجيل خروج المستخدم |

### الاستماع للأحداث

```javascript
// استماع مرة واحدة فقط
KasrahSDK.once('initialized', (data) => {
  console.log('First time initialized:', data);
});

// إزالة مستمع الحدث
const handler = (data) => console.log('Ad finished:', data);
KasrahSDK.on('adFinished', handler);
KasrahSDK.off('adFinished', handler);
```

## وضع التطوير

### تفعيل وضع التطوير

```javascript
KasrahSDK.init({
  gameId: 'your-game-id',
  debugMode: true
});
```

### رسائل التصحيح

عند تفعيل `debugMode: true`، ستظهر رسائل ملونة في console:

- 🔵 **INFO** - معلومات عامة
- 🟢 **SUCCESS** - عمليات ناجحة
- 🔴 **ERROR** - أخطاء
- 🟠 **WARN** - تحذيرات

## أمثلة عملية

### مثال 1: لعبة بسيطة

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game</title>
</head>
<body>
  <div id="game"></div>

  <script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
  <script>
    // تهيئة SDK
    KasrahSDK.init({
      gameId: 'my-game',
      debugMode: true
    });

    // متغيرات اللعبة
    let score = 0;

    // تحميل البيانات المحفوظة
    async function loadGame() {
      const savedData = await KasrahSDK.loadData('gameState');
      if (savedData) {
        score = savedData.score;
      }
    }

    // حفظ البيانات
    async function saveGame() {
      await KasrahSDK.saveData('gameState', { score });
    }

    // عرض إعلان
    async function showAd() {
      const success = await KasrahSDK.showVideoAd();
      if (success) {
        console.log('Ad shown');
      }
    }

    // الاستماع لأحداث الإعلانات
    KasrahSDK.on('adStarted', () => {
      console.log('Game paused for ad');
    });

    KasrahSDK.on('adFinished', () => {
      console.log('Game resumed');
    });

    // تتبع الأحداث
    KasrahSDK.trackEvent('gameStart', {
      timestamp: new Date().toISOString()
    });

    // تحميل اللعبة
    loadGame();
  </script>
</body>
</html>
```

### مثال 2: إدارة حسابات المستخدمين

```javascript
// تسجيل دخول
async function login(username, password) {
  // ... تحقق من بيانات المستخدم
  
  KasrahSDK.setUser({
    id: 'user-123',
    username: username,
    email: 'user@example.com'
  });

  // الآن يمكن حفظ البيانات السحابية
  await KasrahSDK.saveData('profile', {
    username: username,
    level: 5
  });
}

// تسجيل خروج
function logout() {
  KasrahSDK.clearUser();
}
```

## معالجة الأخطاء

```javascript
// الاستماع لأخطاء الإعلانات
KasrahSDK.on('adError', (data) => {
  console.error('Ad error:', data.error);
  // تعامل مع الخطأ
});

// الاستماع لأخطاء البيانات
KasrahSDK.on('dataError', (data) => {
  console.error('Data error:', data.error);
  // تعامل مع الخطأ
});

// معالجة الأخطاء في الدوال
try {
  await KasrahSDK.saveData('key', largeData);
} catch (error) {
  console.error('Save failed:', error.message);
}
```

## الحصول على معلومات SDK

```javascript
const info = KasrahSDK.getInfo();
console.log(info);
// {
//   version: "3.0.0",
//   gameId: "my-game",
//   user: { id: "user-123", ... },
//   sessionId: "1234567890-abc",
//   sessionDuration: 120000
// }
```

## التحليلات

### تتبع الأحداث التلقائية

SDK يتتبع تلقائياً:
- بدء اللعبة
- عرض الإعلانات
- حفظ البيانات
- تسجيل الدخول

### تتبع أحداث مخصصة

```javascript
// تتبع حدث مخصص
KasrahSDK.trackEvent('customEvent', {
  data1: 'value1',
  data2: 'value2'
});
```

### مزامنة التحليلات

```javascript
// مزامنة التحليلات يدوياً
await KasrahSDK.flushAnalytics();
```

## أفضل الممارسات

### ✅ افعل

```javascript
// ✅ تهيئة SDK عند بدء اللعبة
KasrahSDK.init({ gameId: 'my-game' });

// ✅ استخدم async/await
const data = await KasrahSDK.loadData('key');

// ✅ الاستماع للأحداث
KasrahSDK.on('adFinished', () => {
  game.resume();
});

// ✅ تتبع الأحداث المهمة
KasrahSDK.trackEvent('levelComplete', { level: 5 });
```

### ❌ لا تفعل

```javascript
// ❌ لا تستخدم callbacks بدلاً من promises
// KasrahSDK.loadData('key', (data) => { ... });

// ❌ لا تتجاهل الأخطاء
// await KasrahSDK.saveData('key', data);

// ❌ لا تحفظ بيانات كبيرة جداً (> 2MB)
// await KasrahSDK.saveData('key', hugeData);
```

## استكشاف الأخطاء

### SDK لا يتهيأ

```javascript
// تأكد من وجود gameId
KasrahSDK.init({
  gameId: 'your-game-id', // ✅ مطلوب
  debugMode: true
});

// تحقق من رسائل console
// [Kasrah SDK] ERROR: gameId is required
```

### الإعلانات لا تظهر

```javascript
// تأكد من تفعيل التحليلات
KasrahSDK.init({
  enableAnalytics: true
});

// تحقق من رسائل console
KasrahSDK.on('adError', (data) => {
  console.error('Ad error:', data.error);
});
```

### البيانات لا تُحفظ

```javascript
// تأكد من تسجيل دخول المستخدم
if (KasrahSDK.user) {
  await KasrahSDK.saveData('key', data);
} else {
  console.log('User not logged in');
}
```

## الدعم والمساعدة

للمزيد من المعلومات والدعم:
- 📧 البريد الإلكتروني: support@kasrah-games.com
- 🌐 الموقع: https://kasrah-games.onrender.com
- 📚 التوثيق: https://kasrah-games.onrender.com/sdk/docs

## الترخيص

جميع الحقوق محفوظة © 2024 Kasrah Games

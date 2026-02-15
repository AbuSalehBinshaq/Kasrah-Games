# Kasrah Games SDK - Quick Start Guide

## 🚀 البدء في 5 دقائق

### الخطوة 1️⃣: أضف السكربت (30 ثانية)

```html
<script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
```

### الخطوة 2️⃣: هيّئ SDK (30 ثانية)

```javascript
KasrahSDK.init({
  gameId: 'your-game-id',
  debugMode: true
});
```

### الخطوة 3️⃣: استخدم الميزات (2 دقيقة)

```javascript
// عرض إعلان
await KasrahSDK.showVideoAd();

// حفظ البيانات
await KasrahSDK.saveData('score', 1500);

// تتبع الأحداث
KasrahSDK.trackEvent('levelComplete', { level: 5 });
```

### الخطوة 4️⃣: اختبر (1 دقيقة)

افتح console (F12) وتحقق من الرسائل:
```
[Kasrah SDK] SUCCESS: SDK initialized v3.0.0
```

---

## 📝 مثال كامل

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game</title>
</head>
<body>
  <h1>🎮 My Awesome Game</h1>
  <button onclick="playGame()">Play</button>
  <button onclick="showAd()">Watch Ad</button>

  <script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
  <script>
    // تهيئة SDK
    KasrahSDK.init({
      gameId: 'my-game',
      debugMode: true
    });

    // الاستماع للأحداث
    KasrahSDK.on('adFinished', () => {
      console.log('Ad finished!');
    });

    // دوال اللعبة
    function playGame() {
      console.log('Game started');
      KasrahSDK.trackEvent('gameStart');
    }

    function showAd() {
      KasrahSDK.showVideoAd();
    }
  </script>
</body>
</html>
```

---

## 🎯 الخطوات التالية

1. **اقرأ التوثيق الكامل**: [README.md](README.md) أو [README_AR.md](README_AR.md)
2. **جرّب المثال**: [example.html](example.html)
3. **اطّلع على API**: [API.md](API.md)
4. **اتصل بالدعم**: support@kasrah-games.com

---

## ❓ أسئلة شائعة

**س: هل أحتاج إلى مفتاح API؟**  
ج: لا، فقط `gameId` كافٍ!

**س: هل SDK يعمل بدون إنترنت؟**  
ج: نعم، لكن بعض الميزات تحتاج إنترنت (الإعلانات، حفظ البيانات)

**س: هل SDK آمن؟**  
ج: نعم، يستخدم HTTPS و JWT authentication

**س: كم حجم SDK؟**  
ج: 3.5KB فقط (مضغوط)!

---

## 🐛 استكشاف الأخطاء

| الخطأ | الحل |
|------|------|
| `gameId is required` | أضف `gameId` في init |
| `No ads available` | تحقق من توفر الإعلانات |
| `Data not found` | تأكد من حفظ البيانات أولاً |

---

**جاهز؟ ابدأ الآن! 🎮**

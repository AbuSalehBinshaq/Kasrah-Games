# Kasrah Games SDK v3.0.0 - Installation Guide

## دليل التثبيت - Kasrah Games SDK v3.0.0

---

## English Version

### Quick Installation

#### Step 1: Add Script to Your Game

Add this single line to your HTML file, preferably before the closing `</body>` tag:

```html
<script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
```

#### Step 2: Initialize SDK

Add this JavaScript code after the SDK script:

```javascript
KasrahSDK.init({
  gameId: 'your-game-id',
  debugMode: true,
  enableAnalytics: true
});
```

#### Step 3: Use SDK Features

Now you can use all SDK features in your game:

```javascript
// Show ads
await KasrahSDK.showVideoAd();

// Save data
await KasrahSDK.saveData('score', 1500);

// Load data
const score = await KasrahSDK.loadData('score');

// Track events
KasrahSDK.trackEvent('levelComplete', { level: 5 });
```

### Complete HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game</title>
</head>
<body>
  <div id="game-container"></div>

  <!-- Kasrah SDK -->
  <script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
  
  <script>
    // Initialize SDK
    KasrahSDK.init({
      gameId: 'my-awesome-game',
      debugMode: true
    });

    // Listen to events
    KasrahSDK.on('initialized', () => {
      console.log('SDK ready!');
      startGame();
    });

    // Your game code
    function startGame() {
      console.log('Game started');
    }
  </script>
</body>
</html>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `gameId` | string | null | **Required** - Your game ID |
| `apiUrl` | string | `https://kasrah-games.onrender.com/api/sdk` | API endpoint |
| `debugMode` | boolean | false | Enable debug messages |
| `enableAnalytics` | boolean | true | Enable analytics tracking |
| `adFrequency` | number | 3 | Show ad every N requests |
| `autoPlayDelay` | number | 5000 | Delay before auto-play (ms) |
| `timeout` | number | 10000 | Request timeout (ms) |

### Verify Installation

Open browser console (F12) and check for these messages:

```
[Kasrah SDK] SUCCESS: SDK initialized v3.0.0
```

If you see this message, SDK is properly installed!

### Troubleshooting

**Problem**: SDK not loading
- Check if script URL is correct
- Check browser console for errors
- Verify internet connection

**Problem**: `gameId is required` error
- Make sure you provided `gameId` in init config
- Check if `gameId` is not empty string

**Problem**: Ads not showing
- Enable `enableAnalytics: true`
- Check if ads are available on platform
- Check browser console for errors

---

## النسخة العربية

### التثبيت السريع

#### الخطوة 1: إضافة السكربت

أضف هذا السطر في ملف HTML الخاص بك، قبل إغلاق `</body>`:

```html
<script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
```

#### الخطوة 2: تهيئة SDK

أضف هذا الكود بعد سكربت SDK:

```javascript
KasrahSDK.init({
  gameId: 'معرف-لعبتك',
  debugMode: true,
  enableAnalytics: true
});
```

#### الخطوة 3: استخدام ميزات SDK

الآن يمكنك استخدام جميع ميزات SDK:

```javascript
// عرض إعلان
await KasrahSDK.showVideoAd();

// حفظ البيانات
await KasrahSDK.saveData('score', 1500);

// تحميل البيانات
const score = await KasrahSDK.loadData('score');

// تتبع الأحداث
KasrahSDK.trackEvent('levelComplete', { level: 5 });
```

### مثال HTML كامل

```html
<!DOCTYPE html>
<html>
<head>
  <title>لعبتي</title>
</head>
<body>
  <div id="game-container"></div>

  <!-- Kasrah SDK -->
  <script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
  
  <script>
    // تهيئة SDK
    KasrahSDK.init({
      gameId: 'لعبتي-الرائعة',
      debugMode: true
    });

    // الاستماع للأحداث
    KasrahSDK.on('initialized', () => {
      console.log('SDK جاهز!');
      startGame();
    });

    // كود لعبتك
    function startGame() {
      console.log('اللعبة بدأت');
    }
  </script>
</body>
</html>
```

### خيارات الإعدادات

| الخيار | النوع | القيمة الافتراضية | الوصف |
|--------|-------|------------------|-------|
| `gameId` | string | null | **مطلوب** - معرف لعبتك |
| `apiUrl` | string | `https://kasrah-games.onrender.com/api/sdk` | نقطة نهاية API |
| `debugMode` | boolean | false | تفعيل رسائل التصحيح |
| `enableAnalytics` | boolean | true | تفعيل تتبع التحليلات |
| `adFrequency` | number | 3 | عرض إعلان كل N طلب |
| `autoPlayDelay` | number | 5000 | التأخير قبل التشغيل التلقائي (ميلي ثانية) |
| `timeout` | number | 10000 | مهلة الطلب (ميلي ثانية) |

### التحقق من التثبيت

افتح وحدة التحكم (F12) وابحث عن هذه الرسالة:

```
[Kasrah SDK] SUCCESS: SDK initialized v3.0.0
```

إذا رأيت هذه الرسالة، فقد تم التثبيت بنجاح!

### استكشاف الأخطاء

**المشكلة**: SDK لا يتحمل
- تحقق من صحة رابط السكربت
- افحص وحدة التحكم للأخطاء
- تحقق من الاتصال بالإنترنت

**المشكلة**: خطأ `gameId is required`
- تأكد من توفير `gameId` في إعدادات التهيئة
- تحقق من أن `gameId` ليست فارغة

**المشكلة**: الإعلانات لا تظهر
- فعّل `enableAnalytics: true`
- تحقق من توفر الإعلانات على المنصة
- افحص وحدة التحكم للأخطاء

---

## Advanced Installation

### Using with Build Tools

If you're using a build tool like Webpack, Vite, or Rollup:

#### Option 1: Global Script

```html
<script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
```

Then use `window.KasrahSDK` in your code.

#### Option 2: Module Import (if available)

```javascript
// Coming in future versions
// import KasrahSDK from 'kasrah-sdk';
```

### Using with React

```jsx
import { useEffect } from 'react';

export default function GameComponent() {
  useEffect(() => {
    // Initialize SDK
    window.KasrahSDK.init({
      gameId: 'my-game',
      debugMode: true
    });

    // Listen to events
    window.KasrahSDK.on('initialized', () => {
      console.log('SDK ready');
    });
  }, []);

  const handleShowAd = async () => {
    const success = await window.KasrahSDK.showVideoAd();
    if (success) {
      console.log('Ad shown');
    }
  };

  return (
    <div>
      <button onClick={handleShowAd}>Show Ad</button>
    </div>
  );
}
```

### Using with Vue

```vue
<template>
  <div>
    <button @click="showAd">Show Ad</button>
  </div>
</template>

<script>
export default {
  mounted() {
    // Initialize SDK
    window.KasrahSDK.init({
      gameId: 'my-game',
      debugMode: true
    });

    // Listen to events
    window.KasrahSDK.on('initialized', () => {
      console.log('SDK ready');
    });
  },
  methods: {
    async showAd() {
      const success = await window.KasrahSDK.showVideoAd();
      if (success) {
        console.log('Ad shown');
      }
    }
  }
};
</script>
```

### Using with Angular

```typescript
import { Component, OnInit } from '@angular/core';

declare var KasrahSDK: any;

@Component({
  selector: 'app-game',
  template: `<button (click)="showAd()">Show Ad</button>`
})
export class GameComponent implements OnInit {
  ngOnInit() {
    // Initialize SDK
    KasrahSDK.init({
      gameId: 'my-game',
      debugMode: true
    });

    // Listen to events
    KasrahSDK.on('initialized', () => {
      console.log('SDK ready');
    });
  }

  async showAd() {
    const success = await KasrahSDK.showVideoAd();
    if (success) {
      console.log('Ad shown');
    }
  }
}
```

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 11+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Opera | 47+ | ✅ Full |
| IE | 11 | ⚠️ Limited |

## Performance Tips

1. **Load SDK asynchronously** - Use `async` attribute on script tag
2. **Defer initialization** - Initialize SDK after game loads
3. **Cache SDK** - Browser will cache the SDK script
4. **Minimize API calls** - Batch analytics events

## Support

For help and support:
- 📧 Email: support@kasrah-games.com
- 🌐 Website: https://kasrah-games.onrender.com
- 📚 Documentation: https://kasrah-games.onrender.com/sdk/docs
- 🐛 Report Issues: https://github.com/AbuSalehBinshaq/kasrah-games/issues

## License

© 2024 Kasrah Games. All rights reserved.

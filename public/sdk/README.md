# Kasrah Games SDK v3.0.0

## Introduction

**Kasrah Games SDK** is a professional and powerful JavaScript library for integrating games with the Kasrah Games platform. It provides easy and secure integration with all platform features.

## Key Features

✅ **Advanced Ads** - Video ads and rewarded ads  
✅ **Cloud Data Storage** - Secure data synchronization across devices  
✅ **User Accounts** - Full support for player accounts  
✅ **Event System** - Flexible and powerful event system  
✅ **Analytics** - Comprehensive player behavior tracking  
✅ **Error Handling** - Advanced error handling system  
✅ **Debug Mode** - Clear and colored debug messages  

## Installation

### Method 1: Direct Script

```html
<script src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"></script>
```

### Method 2: With Auto-Init

```html
<script 
  src="https://kasrah-games.onrender.com/sdk/kasrah-sdk.js"
  data-auto-init
  data-game-id="your-game-id">
</script>
```

## Quick Start

### 1. Basic Initialization

```javascript
// Initialize SDK
KasrahSDK.init({
  gameId: 'your-game-id',
  debugMode: true,
  enableAnalytics: true
});

// Listen for initialization
KasrahSDK.on('initialized', (data) => {
  console.log('SDK initialized:', data);
});
```

### 2. Show Ads

```javascript
// Show video ad
KasrahSDK.showVideoAd().then((success) => {
  if (success) {
    console.log('Ad shown successfully');
  }
});

// Show rewarded ad
KasrahSDK.showRewardedAd().then((success) => {
  if (success) {
    console.log('Rewarded ad shown');
  }
});
```

### 3. Listen to Ad Events

```javascript
// When ad starts
KasrahSDK.on('adStarted', (data) => {
  game.pause();
  game.mute();
  console.log('Ad started:', data);
});

// When ad finishes
KasrahSDK.on('adFinished', (data) => {
  game.resume();
  game.unmute();
  console.log('Ad finished:', data);
});

// On ad error
KasrahSDK.on('adError', (data) => {
  console.error('Ad error:', data);
});
```

### 4. Save and Load Data

```javascript
// Save data
await KasrahSDK.saveData('playerScore', {
  score: 1500,
  level: 5,
  timestamp: Date.now()
});

// Load data
const playerData = await KasrahSDK.loadData('playerScore');
console.log('Player data:', playerData);

// Clear data
KasrahSDK.clearData('playerScore');
```

### 5. Track Events

```javascript
// Track custom event
KasrahSDK.trackEvent('levelComplete', {
  level: 5,
  score: 1500,
  time: 120
});

// Track another event
KasrahSDK.trackEvent('itemPurchased', {
  itemId: 'sword-001',
  price: 100
});
```

## Advanced Configuration

### Custom Initialization

```javascript
KasrahSDK.manualInit({
  gameId: 'your-game-id',
  apiUrl: 'https://kasrah-games.onrender.com/api/sdk',
  debugMode: true,
  enableAnalytics: true,
  adFrequency: 3,           // Show ad every 3 requests
  autoPlayDelay: 5000,      // 5 second delay before game starts
  timeout: 10000            // Request timeout = 10 seconds
});
```

## User Account Management

### Set User

```javascript
// After user login
KasrahSDK.setUser({
  id: 'user-123',
  username: 'player',
  email: 'player@example.com'
});

// Listen for user set event
KasrahSDK.on('userSet', (user) => {
  console.log('User set:', user);
});
```

### Logout

```javascript
KasrahSDK.clearUser();

KasrahSDK.on('userCleared', () => {
  console.log('User logged out');
});
```

## Event System

### Available Events

| Event | Description |
|-------|-------------|
| `initialized` | SDK initialized successfully |
| `adStarted` | Ad display started |
| `adFinished` | Ad display finished |
| `adError` | Ad error occurred |
| `dataSaved` | Data saved successfully |
| `dataError` | Data save error |
| `userSet` | User set |
| `userCleared` | User logged out |

### Listen to Events

```javascript
// Listen once
KasrahSDK.once('initialized', (data) => {
  console.log('First time initialized:', data);
});

// Remove event listener
const handler = (data) => console.log('Ad finished:', data);
KasrahSDK.on('adFinished', handler);
KasrahSDK.off('adFinished', handler);
```

## Debug Mode

### Enable Debug Mode

```javascript
KasrahSDK.init({
  gameId: 'your-game-id',
  debugMode: true
});
```

### Debug Messages

When `debugMode: true` is enabled, colored messages appear in console:

- 🔵 **INFO** - General information
- 🟢 **SUCCESS** - Successful operations
- 🔴 **ERROR** - Errors
- 🟠 **WARN** - Warnings

## Practical Examples

### Example 1: Simple Game

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
    // Initialize SDK
    KasrahSDK.init({
      gameId: 'my-game',
      debugMode: true
    });

    // Game variables
    let score = 0;

    // Load saved data
    async function loadGame() {
      const savedData = await KasrahSDK.loadData('gameState');
      if (savedData) {
        score = savedData.score;
      }
    }

    // Save data
    async function saveGame() {
      await KasrahSDK.saveData('gameState', { score });
    }

    // Show ad
    async function showAd() {
      const success = await KasrahSDK.showVideoAd();
      if (success) {
        console.log('Ad shown');
      }
    }

    // Listen to ad events
    KasrahSDK.on('adStarted', () => {
      console.log('Game paused for ad');
    });

    KasrahSDK.on('adFinished', () => {
      console.log('Game resumed');
    });

    // Track events
    KasrahSDK.trackEvent('gameStart', {
      timestamp: new Date().toISOString()
    });

    // Load game
    loadGame();
  </script>
</body>
</html>
```

### Example 2: User Account Management

```javascript
// Login
async function login(username, password) {
  // ... verify user credentials
  
  KasrahSDK.setUser({
    id: 'user-123',
    username: username,
    email: 'user@example.com'
  });

  // Now can save cloud data
  await KasrahSDK.saveData('profile', {
    username: username,
    level: 5
  });
}

// Logout
function logout() {
  KasrahSDK.clearUser();
}
```

## Error Handling

```javascript
// Listen to ad errors
KasrahSDK.on('adError', (data) => {
  console.error('Ad error:', data.error);
  // Handle error
});

// Listen to data errors
KasrahSDK.on('dataError', (data) => {
  console.error('Data error:', data.error);
  // Handle error
});

// Handle errors in functions
try {
  await KasrahSDK.saveData('key', largeData);
} catch (error) {
  console.error('Save failed:', error.message);
}
```

## Get SDK Info

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

## Analytics

### Automatic Event Tracking

SDK automatically tracks:
- Game start
- Ad displays
- Data saves
- User logins

### Custom Event Tracking

```javascript
// Track custom event
KasrahSDK.trackEvent('customEvent', {
  data1: 'value1',
  data2: 'value2'
});
```

### Manual Analytics Sync

```javascript
// Manually sync analytics
await KasrahSDK.flushAnalytics();
```

## Best Practices

### ✅ Do

```javascript
// ✅ Initialize SDK at game start
KasrahSDK.init({ gameId: 'my-game' });

// ✅ Use async/await
const data = await KasrahSDK.loadData('key');

// ✅ Listen to events
KasrahSDK.on('adFinished', () => {
  game.resume();
});

// ✅ Track important events
KasrahSDK.trackEvent('levelComplete', { level: 5 });
```

### ❌ Don't

```javascript
// ❌ Don't use callbacks instead of promises
// KasrahSDK.loadData('key', (data) => { ... });

// ❌ Don't ignore errors
// await KasrahSDK.saveData('key', data);

// ❌ Don't save very large data (> 2MB)
// await KasrahSDK.saveData('key', hugeData);
```

## Troubleshooting

### SDK Won't Initialize

```javascript
// Make sure gameId is provided
KasrahSDK.init({
  gameId: 'your-game-id', // ✅ Required
  debugMode: true
});

// Check console messages
// [Kasrah SDK] ERROR: gameId is required
```

### Ads Not Showing

```javascript
// Make sure analytics is enabled
KasrahSDK.init({
  enableAnalytics: true
});

// Check console for errors
KasrahSDK.on('adError', (data) => {
  console.error('Ad error:', data.error);
});
```

### Data Not Saving

```javascript
// Make sure user is logged in
if (KasrahSDK.user) {
  await KasrahSDK.saveData('key', data);
} else {
  console.log('User not logged in');
}
```

## Support and Help

For more information and support:
- 📧 Email: support@kasrah-games.com
- 🌐 Website: https://kasrah-games.onrender.com
- 📚 Documentation: https://kasrah-games.onrender.com/sdk/docs

## License

All rights reserved © 2024 Kasrah Games

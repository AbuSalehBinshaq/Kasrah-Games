# Kasrah Games SDK - API Documentation

## API Endpoints Reference

All SDK API endpoints are located at: `https://kasrah-games.onrender.com/api/sdk`

### Authentication

All requests must include these headers:

```
Content-Type: application/json
X-SDK-Version: 3.0.0
X-Game-ID: your-game-id
```

---

## Ads Endpoints

### GET Ad

**Endpoint:** `POST /ads/get`

**Description:** Get available ad for a game

**Request Body:**
```json
{
  "gameId": "your-game-id",
  "type": "video"
}
```

**Response (Success):**
```json
{
  "success": true,
  "ad": {
    "id": "ad-123",
    "title": "Amazing Product",
    "type": "video",
    "imageUrl": "https://example.com/ad.jpg",
    "clickUrl": "https://example.com"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "No ads available"
}
```

**Status Codes:**
- `200` - Ad retrieved successfully
- `400` - Missing required fields
- `404` - No ads available
- `500` - Server error

---

### Track Ad

**Endpoint:** `POST /ads/track`

**Description:** Track ad impressions and clicks

**Request Body:**
```json
{
  "adId": "ad-123",
  "type": "impression",
  "gameId": "your-game-id",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Tracked successfully
- `400` - Missing required fields
- `500` - Server error

---

## Data Storage Endpoints

### Save Data

**Endpoint:** `POST /data/save`

**Description:** Save game data for a user

**Request Body:**
```json
{
  "key": "playerScore",
  "value": {
    "score": 1500,
    "level": 5
  },
  "gameId": "your-game-id",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "data-123",
    "userId": "user-123",
    "gameId": "your-game-id",
    "key": "playerScore",
    "value": {
      "score": 1500,
      "level": 5
    },
    "size": 256,
    "createdAt": "2024-02-15T12:00:00Z",
    "updatedAt": "2024-02-15T12:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Data saved successfully
- `400` - Missing required fields
- `413` - Data exceeds maximum size (2MB)
- `500` - Server error

---

### Load Data

**Endpoint:** `GET /data/load`

**Description:** Load game data for a user

**Query Parameters:**
- `key` (required) - Data key
- `gameId` (required) - Game ID
- `userId` (required) - User ID

**Example:**
```
GET /data/load?key=playerScore&gameId=your-game-id&userId=user-123
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "score": 1500,
    "level": 5
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Data not found"
}
```

**Status Codes:**
- `200` - Data loaded successfully
- `400` - Missing required parameters
- `404` - Data not found
- `500` - Server error

---

## Analytics Endpoints

### Track Events

**Endpoint:** `POST /analytics/track`

**Description:** Track analytics events from SDK

**Request Body:**
```json
{
  "events": [
    {
      "name": "levelComplete",
      "data": {
        "level": 5,
        "score": 1500
      },
      "timestamp": 1708000000000
    },
    {
      "name": "itemPurchased",
      "data": {
        "itemId": "sword-001",
        "price": 100
      },
      "timestamp": 1708000010000
    }
  ],
  "gameId": "your-game-id",
  "sessionId": "session-123",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "eventsTracked": 2
}
```

**Status Codes:**
- `200` - Events tracked successfully
- `400` - Invalid request format
- `500` - Server error

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `INIT_ERROR` | SDK initialization failed | Check gameId and apiUrl |
| `GAME_ID_REQUIRED` | gameId is required | Provide gameId in init config |
| `AD_NOT_AVAILABLE` | No ads available | Check if ads are active |
| `DATA_SIZE_EXCEEDED` | Data exceeds maximum size | Reduce data size (max 2MB) |
| `NETWORK_ERROR` | Network request failed | Check internet connection |
| `INVALID_USER` | Invalid user data | Verify user object |
| `API_ERROR` | API request failed | Check API endpoint |

---

## Rate Limiting

API requests are rate limited:

- **Ads**: 100 requests per minute per game
- **Data**: 1000 requests per minute per user
- **Analytics**: 500 requests per minute per session

If rate limit exceeded, API returns `429 Too Many Requests`

---

## Data Size Limits

| Resource | Limit |
|----------|-------|
| Single data value | 2 MB |
| Batch analytics events | 100 events |
| Session duration | 1 hour |
| Event data | 1 KB per event |

---

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Example Requests

### cURL

```bash
# Get ad
curl -X POST https://kasrah-games.onrender.com/api/sdk/ads/get \
  -H "Content-Type: application/json" \
  -H "X-SDK-Version: 3.0.0" \
  -H "X-Game-ID: your-game-id" \
  -d '{
    "gameId": "your-game-id",
    "type": "video"
  }'

# Save data
curl -X POST https://kasrah-games.onrender.com/api/sdk/data/save \
  -H "Content-Type: application/json" \
  -H "X-SDK-Version: 3.0.0" \
  -H "X-Game-ID: your-game-id" \
  -d '{
    "key": "playerScore",
    "value": {"score": 1500},
    "gameId": "your-game-id",
    "userId": "user-123"
  }'
```

### JavaScript Fetch

```javascript
// Get ad
fetch('https://kasrah-games.onrender.com/api/sdk/ads/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SDK-Version': '3.0.0',
    'X-Game-ID': 'your-game-id'
  },
  body: JSON.stringify({
    gameId: 'your-game-id',
    type: 'video'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Save data
fetch('https://kasrah-games.onrender.com/api/sdk/data/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SDK-Version': '3.0.0',
    'X-Game-ID': 'your-game-id'
  },
  body: JSON.stringify({
    key: 'playerScore',
    value: { score: 1500 },
    gameId: 'your-game-id',
    userId: 'user-123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Python

```python
import requests
import json

# Get ad
response = requests.post(
  'https://kasrah-games.onrender.com/api/sdk/ads/get',
  headers={
    'Content-Type': 'application/json',
    'X-SDK-Version': '3.0.0',
    'X-Game-ID': 'your-game-id'
  },
  json={
    'gameId': 'your-game-id',
    'type': 'video'
  }
)
print(response.json())

# Save data
response = requests.post(
  'https://kasrah-games.onrender.com/api/sdk/data/save',
  headers={
    'Content-Type': 'application/json',
    'X-SDK-Version': '3.0.0',
    'X-Game-ID': 'your-game-id'
  },
  json={
    'key': 'playerScore',
    'value': {'score': 1500},
    'gameId': 'your-game-id',
    'userId': 'user-123'
  }
)
print(response.json())
```

---

## Webhooks (Future)

Webhooks for real-time events will be available in SDK v3.1+

---

## Support

For API support:
- 📧 Email: api-support@kasrah-games.com
- 📚 Documentation: https://kasrah-games.onrender.com/sdk/docs
- 🐛 Report Issues: https://github.com/AbuSalehBinshaq/kasrah-games/issues

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2024-02-15 | Initial release |

## License

© 2024 Kasrah Games. All rights reserved.

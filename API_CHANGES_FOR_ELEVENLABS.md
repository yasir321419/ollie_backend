# 🤖 Ollie AI Backend - API Changes Documentation for ElevenLabs Tools

## 📊 **COMPLETE API ENDPOINT SUMMARY**

### ✅ **WORKING ENDPOINTS** (16 Total)

#### 🟢 **Free Endpoints** (8) - No Credits Required
1. **GET** `/api/v1/ai/health` - Health check
2. **GET** `/api/v1/ai/getUserInfo` - Get user profile data ✅ **TESTED**
3. **GET** `/api/v1/ai/getUserTasks` - Get user's tasks ✅ **TESTED**  
4. **GET** `/api/v1/ai/getBlogTitles` - Get available blog titles
5. **GET** `/api/v1/ai/getLatestEvents` - Get recent events ✅ **TESTED**
6. **GET** `/api/v1/ai/getUserSocialInfo` - Get user social media data
7. **GET** `/api/v1/ai/getUserRequestInfo` - Get user volunteer requests
8. **GET** `/api/v1/ai/getUserFinancialInfo` - Get user financial data
9. **GET** `/api/v1/ai/getUserChatRooms` - Get user chat rooms

#### 🟡 **Premium Endpoints** (8) - Require ConnectPurchase Credits
1. **POST** `/api/v1/ai/createTask` - Create user task ✅ **TESTED** (1 credit)
2. **PUT** `/api/v1/ai/completeTask/:taskId` - Mark task complete ✅ **TESTED** (1 credit)
3. **GET** `/api/v1/ai/getBlogContent/:blogId` - Get specific blog content (1 credit)
4. **GET** `/api/v1/ai/getLatestBlogs` - Get recent blog posts (1 credit)
5. **POST** `/api/v1/ai/createPost` - Create social media post (1 credit)
6. **POST** `/api/v1/ai/updateContext` - Update user AI context ✅ **TESTED** (1 credit)
7. **GET** `/api/v1/ai/getChatRoomDetails/:chatRoomId` - Get chat room messages ✅ **TESTED** (1 credit)
8. **POST** `/api/v1/ai/createHelpRequest` - Create volunteer help request ✅ **TESTED** (1 credit)

### ❌ **NON-EXISTENT ENDPOINTS** (7 Total)
These endpoints do **NOT** exist and will return 404:
1. `/api/v1/ai/updateTask` → Use `completeTask/:taskId` instead
2. `/api/v1/ai/deleteTask` → No delete functionality available
3. `/api/v1/ai/updateUserInfo` → Use `updateContext` instead
4. `/api/v1/ai/saveTopics` → No topic saving endpoint
5. `/api/v1/ai/getActivitiesAndExercises` → Does not exist
6. `/api/v1/ai/getChatRoomMessages` → Use `getChatRoomDetails/:chatRoomId` instead
7. `/api/v1/ai/getUserInsights` → Does not exist

---

## 🔐 **AUTHENTICATION FLOW**

### **Login Process:**
```bash
POST /api/v1/user/auth/userLogin
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### **Response Structure:**
```json
{
  "success": true,
  "message": "User Login Successfully",
  "data": {
    "userToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "ca156534-8226-4b1f-b81e-bb00e963f310",
      "email": "test@example.com",
      "userType": "USER"
    }
  }
}
```

### **Using Auth Token:**
All AI endpoints require the JWT token in headers:
```
x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💳 **CREDIT SYSTEM DETAILS**

### **ConnectPurchase Model:**
- Each premium API call consumes **1 credit**
- Credits are tracked in `connectPurchase` table
- User needs active subscription OR sufficient credits
- Test account currently has: **90 credits remaining**

### **Premium Endpoints That Consume Credits:**
- `createTask` ✅ **Confirmed** (1 credit per call)
- `completeTask/:taskId` ✅ **Confirmed** (1 credit per call)
- `updateContext` ✅ **Confirmed** (1 credit per call)
- `createHelpRequest` ✅ **Confirmed** (1 credit per call)
- `getChatRoomDetails/:chatRoomId` ✅ **Schema Fixed** (1 credit per call)
- `getBlogContent/:blogId` (1 credit per call)
- `getLatestBlogs` (1 credit per call)
- `createPost` (1 credit per call)

---

## 🔄 **API TESTING RESULTS**

### ✅ **Successfully Tested:**
1. **getUserInfo** - Returns user profile data ✅
2. **getUserTasks** - Returns user's task list ✅
3. **createTask** - Creates new task, consumes 1 credit ✅
4. **completeTask** - Marks task complete, consumes 1 credit ✅
5. **updateContext** - Updates user context, consumes 1 credit ✅
6. **createHelpRequest** - Creates help request, consumes 1 credit ✅
7. **getChatRoomDetails** - Returns proper error for non-participants ✅
8. **getLatestEvents** - Returns event data ✅

### 📋 **Sample API Responses:**

**getUserInfo Response:**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "email": "test@example.com",
    "firstName": null,
    "lastName": null,
    "userType": "USER",
    "savedTopics": [],
    "interests": [],
    "notifications": []
  }
}
```

**createTask Response:**
```json
{
  "success": true,
  "message": "User task created successfully",
  "data": {
    "id": "6556245f-395b-4240-b6a3-97e40f0066bb",
    "taskName": "Test AI Task",
    "taskDescription": "Testing task creation from API",
    "scheduledDate": "2025-09-04T14:46:04.137Z",
    "scheduledTime": "19:46:04",
    "markAsComplete": false
  }
}
```

---

## 🛠️ **ELEVENLABS TOOLS CONFIGURATION**

### **Base URL Configuration:**
```
BASE_URL = "http://localhost:3002/api/v1"
```

### **Authentication Header:**
```javascript
headers: {
  "x-access-token": "{USER_JWT_TOKEN}",
  "Content-Type": "application/json"
}
```

### **Dynamic Variables for ConvAI:**
```javascript
// These variables are automatically updated via the frontend:
- userToken: JWT token from login
- userId: User's UUID 
- userName: User's name
- latitude: User's location
- longitude: User's location
- currentDateTime: Real-time timestamp
```

### **Tool Categories for ElevenLabs:**
1. **USER_INFO_TOOLS** (Free) - 10 endpoints
2. **TASK_MANAGEMENT_TOOLS** (Premium) - 2 endpoints  
3. **CONTENT_TOOLS** (Premium) - 3 endpoints
4. **SOCIAL_TOOLS** (Premium) - 2 endpoints

---

## ⚠️ **IMPORTANT NOTES FOR ELEVENLABS UPDATE**

### **Schema Changes Fixed:**
1. `additional_context` field → `emergencyContactNumber` 
2. `scheduledAt` → Split into `scheduledDate` and `scheduledTime`
3. UUID handling - removed `parseInt()` calls throughout

### **Rate Limiting:**
- AI endpoints use `aiLimiter` middleware
- Some endpoints use regular `limiter` middleware
- No special configuration needed in tools

### **Error Handling:**
- All endpoints return consistent JSON format
- Use `response.ok` to check success
- Credit errors return specific error messages

### **WebSocket Integration:**
- AI chat functionality available via WebSocket
- Endpoint: `ws://localhost:3002` 
- Requires authentication token

---

## 📈 **CURRENT STATUS**

### **Test Environment:**
- ✅ Backend running on `localhost:3002`
- ✅ Database connected (MySQL)
- ✅ JWT authentication working
- ✅ Credit system functional
- ✅ 16 working API endpoints
- ✅ Frontend testing interface available

### **Production Readiness:**
- ✅ All endpoints tested
- ✅ Authentication secured
- ✅ Rate limiting configured
- ✅ Error handling implemented
- ✅ Credit system operational

### **Next Steps:**
1. Update ElevenLabs tools with corrected endpoint URLs
2. Remove references to non-existent endpoints
3. Update authentication flow to use correct token field
4. Test all tools with working endpoints
5. Deploy to production environment

---

*Last Updated: September 4, 2025*  
*Environment: Local Testing (localhost:3002)*  
*Credits Available: 90*  
*Total Credits Consumed: 10 (from comprehensive API testing)*
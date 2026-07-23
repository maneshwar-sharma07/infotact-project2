# Infotact Project 2 - Backend Server APIs
## High-Performance E-Commerce Engine with AI Vector Search

This is the backend API server for Infotact Project 2, built with Node.js, Express, TypeScript, Mongoose, and Redis.

---

## 🛠️ Local Development Setup

### 1. Configure Environment Variables
Create a `.env` file in the `server/` directory and populate it with the following keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/infotact_project2
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

### 2. Install Dependencies
Run the package installation inside the `server/` directory:
```bash
npm install
```

### 3. Run Database Seeding
Populate your database catalog with 1,000 mock products and random vector representations:
```bash
npm run seed
```

### 4. Run Development Server
Start the Express server with live reload enabled (uses `ts-node` + `nodemon`):
```bash
npm run dev
```
The server will run at: `http://localhost:5000`

---

## 📡 API Endpoints Documentation

### 🟢 1. Server Health Check
Check if the server and runtime configs are running correctly.

* **URL**: `/health`
* **Method**: `GET`
* **Headers**: None
* **Success Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "message": "High-Performance E-Commerce Engine backend active.",
    "timestamp": "2026-07-11T22:20:00.000Z"
  }
  ```

---

### 👤 2. User Registration
Create a new user account (Customer or Admin). Password is automatically hashed using bcrypt.

* **URL**: `/auth/register`
* **Method**: `POST`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@infotact.in",
    "password": "securepassword123",
    "role": "customer"
  }
  ```
* **Success Response (210 Created)**:
  ```json
  {
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "name": "Alex Mercer",
      "email": "alex@infotact.in",
      "role": "customer",
      "id": "668ffeb03a55cd7820ab9a81",
      "createdAt": "2026-07-11T22:20:00.000Z",
      "updatedAt": "2026-07-11T22:20:00.000Z"
    }
  }
  ```
* **Error Response (400 Bad Request)**:
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

---

### 🔑 3. User Login
Authenticate user credentials and retrieve a session JWT token.

* **URL**: `/auth/login`
* **Method**: `POST`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "alex@infotact.in",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "name": "Alex Mercer",
      "email": "alex@infotact.in",
      "role": "customer",
      "id": "668ffeb03a55cd7820ab9a81",
      "createdAt": "2026-07-11T22:20:00.000Z",
      "updatedAt": "2026-07-11T22:20:00.000Z"
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "error": "Invalid email or password"
  }
  ```

---

### 🛍️ 4. Product Catalog Listing (Redis Cached)
Fetch paginated catalog listings with category filters and sorting. Sub-50ms target met via Cache-Aside.

* **URL**: `/api/products`
* **Method**: `GET`
* **Query Parameters**:
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `20`)
  * `category` (optional, e.g. `Electronics`)
  * `sortBy` (optional, e.g. `price_asc`, `price_desc`, `newest`)
* **Success Response (200 OK)**:
  ```json
  {
    "products": [
      {
        "name": "Smart Watch - Model v1",
        "description": "Premium smart watch designed for performance.",
        "price": 199.99,
        "stock": 45,
        "category": "Electronics",
        "id": "668ffe..."
      }
    ],
    "pagination": {
      "totalProducts": 1000,
      "currentPage": 1,
      "totalPages": 50,
      "pageSize": 20
    }
  }
  ```

---

### 🔍 5. Keyword Search (Fallback Search Engine)
Case-insensitive regex matching for product names or descriptions.

* **URL**: `/api/products/search/keyword?query=watch`
* **Method**: `GET`
* **Success Response (200 OK)**: Same output format as `/api/products`.

---

### 📦 6. Product Details (Redis Cached)
Retrieve a single product's details by ID.

* **URL**: `/api/products/:id`
* **Method**: `GET`
* **Success Response (200 OK)**: Single product JSON object.

---

### 🛠️ 7. Admin Product Operations (RBAC Protected)
Create, update, or delete catalog products. Triggers instant pattern invalidation across Redis cache keys.

* **URL**: `/api/products` (POST) | `/api/products/:id` (PUT / DELETE)
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`

---

## ⚡ Cache & Latency Integration Tests
Run automated benchmark tests to verify Cache Miss, Cache Hit speed target (<50ms), and Cache Invalidation eviction:
```bash
npm run test:cache
```


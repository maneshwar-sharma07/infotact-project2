# 🛒 ShopSphere

A modern Full Stack E-Commerce Platform built using React, TypeScript, Express, MongoDB and Socket.IO.

---

## 🚀 Features

### Customer

- User Registration & Login
- JWT Authentication
- Product Catalog
- Product Details
- Category Filtering
- Search Products
- Shopping Cart
- Wishlist
- Checkout
- Order History
- Order Tracking
- Responsive UI

---

### Admin

- Admin Dashboard
- Product Management
- Add Product
- Update Product
- Delete Product
- Analytics Dashboard
- Recent Orders
- Low Stock Products

---

### Backend

- Express REST API
- MongoDB Database
- JWT Authentication
- Password Hashing
- Product CRUD
- Order CRUD
- Role Based Authorization
- Socket.IO Real-time Updates
- Redis Cache Fallback Support
- Error Handling
- TypeScript

---

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Socket.IO
- Redis (Optional)

---

## 📂 Project Structure

```
ShopSphere
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   ├── types
│   │   └── App.tsx
│   │
│   └── package.json
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── socket
│   │   └── index.ts
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/maneshwar-sharma07/infotact-project2.git
```

### Install Client

```bash
cd client
npm install
```

### Install Server

```bash
cd ../server
npm install
```

---

## ▶ Run Project

### Backend

```bash
cd server
npm run dev
```

Server:

```
http://localhost:5000
```

---

### Frontend

```bash
cd client
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

## 📦 Build

### Client

```bash
cd client
npm run build
```

### Server

```bash
cd server
npm run build
```

---

## 🔐 Environment Variables

Create a `.env` file inside the server folder.

Example:

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/shopsphere

JWT_SECRET=your_secret_key

REDIS_URL=redis://localhost:6379
```

Redis is optional. The application automatically falls back to direct MongoDB queries if Redis is unavailable.

---

## 📸 Main Features

- Secure Authentication
- JWT Authorization
- Product Management
- Shopping Cart
- Wishlist
- Checkout System
- Order Tracking
- Admin Dashboard
- Analytics
- MongoDB Database
- Real-time Updates using Socket.IO
- Responsive Design
- Dark Theme UI

---

## 📈 Latest Updates

- Implemented Complete Order Tracking System
- Improved Admin Dashboard
- Added Product Management
- Added Real-time Socket.IO Support
- Improved MongoDB Queries
- Added Better Error Handling
- Added Redis Fallback Support
- Improved TypeScript Types
- Improved Project Structure

---

## 👨‍💻 Development Status

- Frontend ✅
- Backend ✅
- Authentication ✅
- Product Module ✅
- Cart Module ✅
- Wishlist Module ✅
- Checkout Module ✅
- Order Module ✅
- Admin Dashboard ✅
- Socket.IO Integration ✅

---

## 📄 License

This project is developed for educational and internship purposes.

---

## 👥 Team

- Maneshwar Sharma
- Dinesh Kumar
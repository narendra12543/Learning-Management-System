# 🎓 BITWISE - Learning Management System

<div align="center">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18.0+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4.4+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-4.18+-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<div align="center">
  <h3>🚀 A Modern, Full-Stack Learning Management System</h3>
  <p>Built with React, Node.js, and MongoDB - Empowering education through technology</p>
</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [📖 API Documentation](#-api-documentation)
- [🎨 Frontend Features](#-frontend-features)
- [🔐 Authentication](#-authentication)
- [💰 Payment Integration](#-payment-integration)

## ✨ Features

### 👨‍🎓 Student Features

- 🔐 **Secure Authentication** - Email/Password and Google OAuth
- 📚 **Course Catalog** - Browse and enroll in courses
- 🎯 **Personal Dashboard** - Track progress and manage courses
- 💳 **Payment Integration** - Secure payments via Razorpay
- 🎫 **Coupon System** - Apply discount coupons
- ⚙️ **Profile Management** - Update personal information and preferences
- 🌙 **Dark/Light Theme** - Toggle between themes
- 📱 **Responsive Design** - Works on all devices

### 👨‍💼 Admin Features

- 📊 **Admin Dashboard** - Comprehensive management interface
- 📚 **Course Management** - Create, edit, and delete courses
- 👥 **User Management** - Manage student and instructor accounts
- 🎫 **Coupon Management** - Create and manage discount coupons
- 📈 **Analytics** - Track system usage and performance
- 🔒 **Role-based Access** - Secure admin-only features

### 🔧 Technical Features

- 🏗️ **RESTful API** - Well-structured backend API
- 🔒 **JWT Authentication** - Secure token-based auth
- 🛡️ **Security Hardened** - Helmet, CORS, Rate limiting
- 📁 **File Upload** - Image and document handling
- 🌐 **CORS Enabled** - Cross-origin resource sharing
- ⚡ **Performance Optimized** - Efficient data handling
- 🐛 **Error Handling** - Comprehensive error management

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks
- **React Router Dom** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library
- **Context API** - State management

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Helmet** - Security middleware

### DevOps & Tools

- **Vite** - Fast build tool
- **ESLint** - Code linting
- **dotenv** - Environment variables
- **CORS** - Cross-origin requests
- **Express Rate Limit** - API rate limiting

## 📁 Project Structure

```
LearningManagementSystem/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable components
│   │   │   ├── 📁 Admin/        # Admin-specific components
│   │   │   ├── 📁 User/         # User-specific components
│   │   │   └── 📁 Common/       # Shared components
│   │   ├── 📁 contexts/         # React Context providers
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 services/        # API service functions
│   │   └── 📁 utils/           # Utility functions
│   ├── 📄 package.json
│   └── 📄 vite.config.js
├── 📁 backend/                  # Node.js backend application
│   ├── 📁 config/              # Configuration files
│   ├── 📁 controllers/         # Route controllers
│   ├── 📁 middleware/          # Custom middleware
│   ├── 📁 models/              # Database models
│   ├── 📁 routes/              # API routes
│   ├── 📁 services/            # Business logic
│   ├── 📁 uploads/             # File uploads directory
│   ├── 📄 server.js            # Main server file
│   └── 📄 package.json
├── 📄 README.md                # Project documentation
└── 📄 .gitignore              # Git ignore rules
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/learning-management-system.git
cd learning-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start the development servers
npm run dev:all  # Starts both frontend and backend
```

## ⚙️ Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Configuration](#-configuration))

5. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/edulearn_lms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## 📖 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/auth/register`        | Register new user      |
| POST   | `/auth/login`           | User login             |
| POST   | `/auth/logout`          | User logout            |
| GET    | `/auth/google`          | Google OAuth login     |
| POST   | `/auth/forgot-password` | Request password reset |
| POST   | `/auth/reset-password`  | Reset password         |

### Course Endpoints

| Method | Endpoint       | Description               |
| ------ | -------------- | ------------------------- |
| GET    | `/courses`     | Get all courses           |
| GET    | `/courses/:id` | Get course by ID          |
| POST   | `/courses`     | Create new course (Admin) |
| PUT    | `/courses/:id` | Update course (Admin)     |
| DELETE | `/courses/:id` | Delete course (Admin)     |

### User Endpoints

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| GET    | `/auth/profile`       | Get user profile            |
| PUT    | `/auth/profile`       | Update user profile         |
| GET    | `/courses/my-courses` | Get user's enrolled courses |

### Admin Endpoints

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | `/admin/users`     | Get all users         |
| PUT    | `/admin/users/:id` | Update user role      |
| DELETE | `/admin/users/:id` | Delete user           |
| GET    | `/admin/stats`     | Get system statistics |

## 🎨 Frontend Features

### Theme System

- **Light/Dark Mode** - Toggle between themes
- **System Preference** - Follows OS theme
- **Persistent Storage** - Remembers user preference

### Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Perfect for tablets
- **Desktop Enhanced** - Rich desktop experience

### User Experience

- **Toast Notifications** - Beautiful success/error messages
- **Loading States** - Smooth loading indicators
- **Form Validation** - Real-time form validation
- **Protected Routes** - Secure route protection

## 🔐 Authentication

### Supported Methods

1. **Email/Password** - Traditional authentication
2. **Google OAuth** - One-click Google login
3. **JWT Tokens** - Secure token-based auth

### Security Features

- Password hashing with bcrypt
- JWT token expiration
- Protected API routes
- CORS configuration
- Rate limiting
- Helmet security headers

## 💰 Payment Integration

### Razorpay Integration

- **Secure Payments** - PCI DSS compliant
- **Multiple Payment Methods** - Cards, UPI, Wallets
- **Instant Verification** - Real-time payment status
- **Coupon Support** - Discount code system

### Payment Flow

1. User selects course
2. Applies coupon (optional)
3. Initiates payment
4. Razorpay processes payment
5. Course enrollment on success

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**

   ```bash
   git fork https://github.com/yourusername/learning-management-system.git
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Development Guidelines

- Use ESLint for code linting
- Follow React best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

**Happy Learning! 🎓**

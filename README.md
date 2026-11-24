# SmartWaste – Direct Household Scrap Selling & Recycling Platform

> Empowering households to responsibly sell scrap directly to verified recycling agents, reducing landfill waste and creating economic value from discarded materials. SmartWaste bridges the gap between scrap sellers, collection agents, and recycling partners through a transparent, digital-first marketplace. Built on the MERN stack, the platform provides real-time pickup scheduling, weight-based pricing, digital wallets, and an end-to-end admin dashboard.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **File Uploads** | Multer |
| **HTTP Client** | Axios |
| **State Management** | React Context API |
| **Routing** | React Router v6 |
| **Validation** | express-validator |

---

## ✨ Features

### 👤 Customer
- Register & login with JWT-secured authentication
- Browse scrap categories with per-kg pricing
- Create scrap listings with estimated weights and photos
- Schedule pickup with preferred date & time slot
- Track pickup status in real-time (Pending → Confirmed → Collected → Completed)
- Digital wallet with transaction history
- Request wallet withdrawals
- Submit feedback after completed pickups
- Manage multiple delivery/pickup addresses

### 🚚 Agent (Collector)
- View assigned pickup requests
- Update pickup status at each stage
- Record actual weighed amounts on-site
- Access customer contact info and pickup address
- Manage daily schedule of collections

### 🛡 Admin
- Full dashboard: revenue, pickups, users, categories at a glance
- Manage users (activate/deactivate, role assignment)
- Create and update scrap categories and per-kg prices
- Monitor all pickups, assign agents, and override statuses
- Review all wallet transactions and approve withdrawals
- Manage recycling partner accounts and verify them
- View and respond to customer feedback

---

## 📸 Screenshots

> Screenshots coming soon

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone <repo-url>
cd MINI_PROJECT
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Seed Database
```bash
cd ..
node seed/seedData.js
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the App
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartwaste.com | Admin@123 |
| Agent | agent@smartwaste.com | Agent@123 |
| Customer | customer@smartwaste.com | Customer@123 |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smartwaste` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_super_secret_key` |
| `JWT_EXPIRE` | JWT expiration duration | `7d` |
| `NODE_ENV` | Runtime environment | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for API calls | `http://localhost:5000/api` |

---

## 📡 API Overview

The REST API is served at `http://localhost:5000/api`. See [API_DOCS.md](./API_DOCS.md) for full documentation.

| Route Group | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, profile management |
| Scrap | `/api/scrap` | Categories, listings |
| Pickups | `/api/pickups` | Pickup requests and status tracking |
| Admin | `/api/admin` | Admin dashboard and management |
| Partners | `/api/partners` | Recycling partner management |
| Payments | `/api/payments` | Wallet, transactions, withdrawals |

---

## 📁 Project Structure

```
MINI_PROJECT/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── scrapController.js
│   │   ├── pickupController.js
│   │   ├── adminController.js
│   │   ├── partnerController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── roleCheck.js           # Role-based access
│   │   ├── errorHandler.js        # Global error handler
│   │   └── upload.js              # Multer file upload
│   ├── models/
│   │   ├── User.js
│   │   ├── ScrapCategory.js
│   │   ├── ScrapListing.js
│   │   ├── PickupRequest.js
│   │   ├── Transaction.js
│   │   ├── Wallet.js
│   │   ├── RecyclingPartner.js
│   │   ├── BulkOrder.js
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── scrap.js
│   │   ├── pickups.js
│   │   ├── admin.js
│   │   ├── partners.js
│   │   └── payments.js
│   ├── utils/
│   │   └── responseHelper.js
│   ├── uploads/                   # Uploaded images (gitignored)
│   │   └── .gitkeep
│   ├── .env                       # Local env (gitignored)
│   ├── .env.example               # Env template
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instances and service calls
│   │   ├── components/            # Shared UI components
│   │   ├── context/               # Auth & global state
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── agent/
│   │   │   └── admin/
│   │   ├── utils/                 # Formatting helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env
│   └── .env.example
├── seed/
│   └── seedData.js                # Database seeder
├── .gitignore
├── README.md
└── API_DOCS.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the existing code style and add comments where appropriate.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  Made with ♻️ for a cleaner planet
</div>

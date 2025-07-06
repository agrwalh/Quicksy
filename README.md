# Quicksys 🛒

A modern, full-stack grocery delivery web application inspired by Blinkit, rebranded and enhanced for speed, convenience, and scalability.

![Quicksys Banner](public/images/quicksy.jpg)

## 🚀 Features
- User authentication (local & Google OAuth)
- Admin dashboard for product & order management
- Product catalog with categories and search
- Shopping cart and instant checkout
- Real-time order tracking & delivery simulation
- Payment integration (Razorpay)
- Responsive, mobile-friendly UI (EJS + Tailwind CSS)
- MongoDB Atlas cloud database

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Tailwind CSS
- **Database:** MongoDB Atlas
- **Authentication:** Passport.js (local & Google OAuth)
- **Payments:** Razorpay
- **Deployment:** Render.com

## ⚡ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/agrwalh/Quicksy.git
cd Quicksy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
MONGOURL=your_mongodb_atlas_connection_string
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Run locally
```bash
npm start
```
Visit [http://localhost:3000](http://localhost:3000)

## 🌍 Deployment
- **Live Demo:** [Quicksy on Render](https://quicksy.onrender.com) *(update with your actual URL)*
- Deploy easily to Render.com or Railway.app (see deployment instructions in the repo)

## 📦 Folder Structure
```
Quicksy/
├── config/         # Config files (DB, OAuth, Multer)
├── middlewares/    # Custom middleware
├── models/         # Mongoose models
├── public/         # Static assets (images, JS)
├── routes/         # Express routes
├── views/          # EJS templates
├── app.js          # Main server file
├── package.json    # Project metadata
└── README.md       # This file
```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## ⭐ Show your support
If you like this project, give it a star on GitHub and share it with your friends!

---

> Made with ❤️ by Harsh Agarwal 

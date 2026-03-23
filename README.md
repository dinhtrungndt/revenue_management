<h1 align="center">🐾 Pet Care & Enterprise Management System</h1>

<p align="center">
<i>A comprehensive enterprise platform tailored for pet businesses, handling product management, inventory, financial tracking (revenue & expenditure), and Spa services.</i>
</p>

<p align="center">
<?xml version="1.0" encoding="UTF-8"?>
<img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/react/default.svg"
  alt="React"
  width="24"
  height="24"
/>
<img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/redux/default.svg"
  alt="Redux"
  width="24"
  height="24"
/>
    <img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/nodedotjs/default.svg"
  alt="Node.js"
  width="24"
  height="24"
/>
<img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/express/default.svg"
  alt="Express"
  width="24"
  height="24"
/>
  <img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mongodb/default.svg"
  alt="MongoDB"
  width="24"
  height="24"
/>
  <img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cloudinary/default.svg"
  alt="Cloudinary"
  width="24"
  height="24"
/>
</p>

📖 Overview

This project is a specialized Fullstack Management System built for pet stores and veterinary clinics. It acts as an all-in-one workspace that bridges customer-facing e-commerce with complex back-office operations.

The system features strict Role-Based Access Control (RBAC), ensuring that Admins, Staff, and Accounting personnel only access the modules relevant to their responsibilities. From handling Spa appointments and managing gift products to generating detailed financial reports, this platform streamlines daily business workflows.

🎥 System Previews & Demos

Check out the real-time interactions of the dashboard through our short demos (Click the images to watch on YouTube):

<div align="center">
<a href="https://youtube.com/shorts/hRWvRD5KMfM?feature=share">
    <img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/azure-administrative-units/default.svg"
  alt="Administrative Units"
  width="24"
  height="24"
/>
</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://youtube.com/shorts/N-4t2ms-p-E?feature=share">
    <img
  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/staffbase/default.svg"
  alt="Staffbase"
  width="24"
  height="24"
/>
</a>





<i>Left: 👑 Admin Interface | Right: 👨‍💼 Staff Interface</i>
</div>

✨ Key Features

🔐 Advanced Role-Based Authentication

Admin: Full access to dashboard analytics, user management, and system configurations.

Staff/Accounting: Restricted access tailored to inventory adjustments, order processing, and expense reporting.

Customer: Access to the storefront, cart, order history, and Spa booking system.

📦 Product, Inventory & Spa Management

Dynamic Inventory (Input/Output): Track stock levels, import/export history, and auto-adjust quantities upon order completion.

Spa Services Module: Dedicated booking workflow for pet grooming/spa services, separate from physical product purchases.

Gift Module: Special logic handling products that can be sent as gifts with specific pricing and inventory rules.

💰 Finance: Revenue & Expenditure

Expense Tracking: Comprehensive module to record, update, and soft-delete business expenses.

Financial Reporting: Powerful MongoDB aggregation pipelines to generate multi-dimensional reports (Revenue, Export, Expense) by day, month, and year.

Receipt Attachments: Seamless integration with Cloudinary for uploading and managing expense receipts and product media.

🛠️ Tech Stack

Component

Technology

Frontend

React.js, Redux, React Router, Tailwind CSS

Backend

Node.js, Express.js

Database

MongoDB, Mongoose ODM

Media Storage

Cloudinary, Multer

Authentication

JWT (JSON Web Tokens), bcryptjs

🚀 Getting Started

Prerequisites

Node.js (v16+)

MongoDB (Local or Atlas)

Cloudinary Account

1. Clone the repository

git clone [https://github.com/yourusername/pet-care-management.git](https://github.com/yourusername/pet-care-management.git)
cd pet-care-management


2. Backend Setup

cd backend
npm install

# Set up environment variables
cp .env.example .env
# Fill in your MONGODB_URI, JWT_SECRET, and CLOUDINARY credentials

# Start the server
npm run dev


3. Frontend Setup

cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:3001

# Start the client
npm start


💡 Technical Highlights

Redux State Management: Utilized complex Redux thunks to handle asynchronous API calls, error handling, and state synchronization across multiple admin dashboards.

Cloudinary Storage Pipeline: Configured multer-storage-cloudinary to directly stream uploaded images to the cloud, reducing server memory overhead.

Soft Delete & Audit History: Critical entities (like Expenses and Products) implement "Soft Delete" and an updateHistory array, ensuring that accounting records remain intact for audits even if a user attempts to delete them.

📝 License

This project is MIT licensed.

# 🏭 Power Loom Production, Dispatch and Payroll Management System

A mobile application designed to digitize and centralize the management of small and medium-scale power loom factories. Built with **React Native (Expo)** for the frontend and **Laravel** for the backend, connected through RESTful APIs and supported by a **MySQL** relational database.

---

## 📱 About the Project

Power loom factories in Pakistan rely heavily on manual paper-based systems for managing employees, payroll, production, dispatch, and payments. This system replaces those manual processes with a centralized mobile application that gives factory administrators full operational control from their phone.

### Key Features

- 🔐 **Secure Authentication** — Token-based login using Laravel Sanctum
- 👷 **Employee Management** — Full CRUD for weaver and helper records
- 💰 **Automated Payroll** — Transaction-based salary calculation with allowances, bonuses, deductions, and loan installments
- 🏗️ **Production Tracking** — Record fabric production batches with loom, employee, and supplier details
- 🚚 **Dispatch Management** — Real-time stock validation prevents over-dispatching
- 🤝 **Customer & Supplier Management** — Centralized records linked to dispatch and payments
- 💳 **Payment Recording** — Track payments received from customers and paid to suppliers
- 📊 **Dashboard** — Live summary of production, stock, dispatch, and financial activity

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native 0.81.5 + Expo 54 |
| Navigation | React Navigation 7 |
| API State Management | TanStack Query 5 |
| HTTP Client | Axios |
| Backend | Laravel 11 (PHP 8.2+) |
| Authentication | Laravel Sanctum |
| Database | MySQL 8.0 |
| Tunneling (Dev) | ngrok |

---

## 📁 Project Structure

```
FYP/
├── backend/          # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   │       └── PayrollCalculationService.php
│   ├── database/migrations/
│   └── routes/api.php
│
└── mobile/           # React Native App
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   └── services/
    ├── config.js     # API URL configuration
    └── .env          # Environment variables
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- PHP 8.2+
- Composer 2.x
- MySQL 8.0+
- Node.js 18+
- npm or yarn
- Expo Go app on your Android device
- ngrok (for connecting mobile to local backend)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/arjftma/power-loom-management-system.git
cd power-loom-management-system
```

---

### 2. Backend Setup

```bash
cd backend
```

**Install dependencies:**
```bash
composer install
```

**Set up environment:**
```bash
cp .env.example .env
php artisan key:generate
```

**Configure your database in `.env`:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=textile_factory
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Create the database:**
```sql
CREATE DATABASE textile_factory;
```

**Run migrations:**
```bash
php artisan migrate
```

**Seed default admin user (if seeder exists):**
```bash
php artisan db:seed
```

**Start the backend server:**
```bash
php artisan serve
```

Backend runs at: `http://127.0.0.1:8000`

---

### 3. Expose Backend with ngrok

In a new terminal:

```bash
ngrok http 8000
```

Copy the forwarding URL — it looks like:
```
https://xxxx.ngrok-free.app
```

---

### 4. Mobile App Setup

```bash
cd mobile
npm install
```

**Create the environment file:**
```bash
# Create mobile/.env
EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
```

> ⚠️ Replace `xxxx.ngrok-free.app` with your actual ngrok URL every time you restart ngrok.

**Start the Expo development server:**
```bash
npx expo start --tunnel
```

**Open Expo Go** on your Android device and scan the QR code shown in the terminal.

---

## 🔄 Running the Full System (Quick Reference)

Every time you start the project, open **3 terminals**:

| Terminal | Command | Purpose |
|---|---|---|
| 1 | `cd backend && php artisan serve` | Start Laravel backend |
| 2 | `ngrok http 8000` | Expose backend publicly |
| 3 | `cd mobile && npx expo start --tunnel` | Start mobile app |

Then update `mobile/.env` with the new ngrok URL before starting Terminal 3.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/login` | Administrator login | Public |
| POST | `/api/logout` | Logout and invalidate token | Protected |
| GET | `/api/dashboard` | Operational summary | Protected |
| GET/POST | `/api/employees` | List / Create employees | Protected |
| PUT/DELETE | `/api/employees/{id}` | Update / Delete employee | Protected |
| GET/POST | `/api/production` | List / Create production batches | Protected |
| GET/POST | `/api/dispatch` | List / Create dispatch records | Protected |
| GET/POST | `/api/payrolls` | List / Create payrolls | Protected |
| POST | `/api/payrolls/{id}/generate` | Generate salary records for all employees | Protected |
| POST | `/api/salary-records/{id}/allowances` | Add allowance to salary record | Protected |
| GET/POST | `/api/payments` | List / Create payment records | Protected |
| GET/POST | `/api/customers` | List / Create customers | Protected |
| GET/POST | `/api/suppliers` | List / Create suppliers | Protected |
| GET/POST | `/api/employee-loans` | Manage employee loans | Protected |

All protected endpoints require the header:
```
Authorization: Bearer {token}
```

---

## 💡 Payroll Calculation Formula

```
Gross Salary = Basic Salary + Allowances + Bonuses
Net Salary   = Gross Salary - Deductions - Loan Installments
```

- Net salary is always ≥ 0
- All values rounded to 2 decimal places
- Loan installments are automatically deducted each payroll cycle
- Loans are automatically closed when balance reaches zero

---

## 🗄️ Database

The system uses **18 normalized MySQL tables** including:

`users` · `employees` · `suppliers` · `customers` · `production_batches` · `dispatches` · `payments` · `payrolls` · `salary_records` · `allowances` · `bonuses` · `deductions` · `employee_loans` · `loan_installments` · `employee_allowances` · `allowance_types` · `bonus_types` · `deduction_types`

---

## 🎓 Project Background

Developed as a Final Year Project at GC University Faisalabad, Department of Software Engineering.

**Supervised by:** Dr. Khurram Zeeshan Haider
**Co-Supervised by:** Mr. Kunwar Taimur

---

## 📄 License

This project was developed as a Final Year Project (FYP) at GC University Faisalabad. All rights reserved.

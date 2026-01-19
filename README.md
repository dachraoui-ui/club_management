# 🏆 ClubChamp - Sports Club Management System

A comprehensive, full-stack sports club management platform built with React, TypeScript, Node.js, and PostgreSQL. Manage members, teams, training sessions, events, finances, and more with a beautiful glassmorphism UI design.

![ClubChamp Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### 👥 Member Management
- Complete athlete profiles with physical stats (height, weight)
- Sport specialization tracking (Football, Tennis, Basketball, Swimming, etc.)
- Strength & weakness assessment
- Emergency contact information
- Photo upload support

### 🏅 Team Management
- Create and manage multiple teams across disciplines
- Assign coaches to teams
- Track team rosters and member assignments
- Team performance analytics

### 📅 Training Sessions
- Schedule training sessions with date, time, and location
- Assign coaches to sessions
- Track attendance (Present, Absent, Late, Excused)
- Session capacity management
- Status tracking (Scheduled, Completed, Cancelled)

### 🎯 Events & Competitions
- Tournament, competition, workshop, and social event management
- Participant registration system
- Event capacity and status tracking
- Results and outcome recording

### 💰 Finance Management
- **Payments:** Track membership, training, and equipment payments
- **Salaries:** Manage staff, coach, and player salaries with monthly tracking
- **Expenses:** Record and categorize club expenses
- **Sponsors:** Manage sponsorship deals with tier system (Gold, Silver, Bronze)
- Automatic salary sync when creating members with base salary

### 📊 Statistics & Analytics
- Real-time dashboard with key metrics
- Member distribution by sport
- Financial analytics and trends
- Subscription status overview
- Beautiful charts and visualizations

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Manager, Coach, Staff, Athlete)
- Secure password hashing with bcrypt
- Session management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | Component Library |
| React Router | Navigation |
| TanStack Query | Data Fetching |
| Recharts | Charts & Graphs |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Prisma ORM | Database ORM |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password Hashing |
| express-validator | Input Validation |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL** - [Download](https://www.postgresql.org/download/)
- **npm** or **bun**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/dachraoui-ui/club_management.git
cd club_management
```

#### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/clubchamp_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters"
PORT=5000
FRONTEND_URL=http://localhost:8080
```

```bash
# Setup database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed demo data
```

#### 3. Setup Frontend

```bash
# Go back to root directory
cd ..

# Install frontend dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

#### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
You should see: `🚀 Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: `http://localhost:8080`

---

## 🔑 Demo Credentials

After seeding, use these credentials to login:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@clubchamp.com | password123 |


> ⚠️ **Change these credentials in production!**

---

## 📊 Demo Data

The seed script creates realistic demo data including:

| Category | Count | Description |
|----------|-------|-------------|
| Users | 34 | Admin, managers, coaches, staff, athletes |
| Teams | 6 | Football, Tennis, Basketball, Swimming, Volleyball |
| Athletes | 25 | With complete profiles and stats |
| Training Sessions | 24 | Past, current, and upcoming |
| Events | 8 | Tournaments, competitions, workshops |
| Payments | 49 | Various payment records |
| Salaries | 66 | 3 months of salary history |
| Expenses | 30 | Equipment, facilities, utilities, etc. |
| Sponsors | 8 | Gold, Silver, Bronze tier sponsors |

---

## 📁 Project Structure

```
clubchamp-ui-main/
├── backend/                 # Backend API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.js         # Demo data seeder
│   │   └── migrations/     # Database migrations
│   ├── src/
│   │   ├── server.js       # Express server entry
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── package.json
├── src/                     # Frontend React app
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components (shadcn)
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register new user (Admin) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| PATCH | `/api/auth/change-password` | Change password |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members (paginated) |
| GET | `/api/members/:id` | Get member by ID |
| POST | `/api/members` | Create member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | Get all teams |
| GET | `/api/teams/:id` | Get team by ID |
| POST | `/api/teams` | Create team |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |
| POST | `/api/teams/:id/members` | Add member to team |
| DELETE | `/api/teams/:id/members/:userId` | Remove member |

### Training Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trainings` | Get all trainings |
| GET | `/api/trainings/:id` | Get training by ID |
| POST | `/api/trainings` | Create training |
| PUT | `/api/trainings/:id` | Update training |
| DELETE | `/api/trainings/:id` | Delete training |
| POST | `/api/trainings/:id/attendance` | Mark attendance |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event by ID |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/participants` | Register participant |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/payments` | Get all payments |
| POST | `/api/finance/payments` | Create payment |
| GET | `/api/finance/expenses` | Get all expenses |
| POST | `/api/finance/expenses` | Create expense |
| GET | `/api/finance/sponsors` | Get all sponsors |
| POST | `/api/finance/sponsors` | Create sponsor |
| GET | `/api/finance/salaries` | Get all salaries |
| POST | `/api/finance/salaries` | Create/Update salary |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/dashboard` | Dashboard stats |
| GET | `/api/stats/finance` | Financial stats |
| GET | `/api/stats/membership` | Membership stats |
| GET | `/api/stats/sports` | Sports distribution |

---

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start with nodemon
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (⚠️ deletes data)
```

---

## 🐛 Troubleshooting

### Backend won't start
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `backend/.env`
3. Run `npm run db:generate` and `npm run db:migrate`

### Frontend can't connect to backend
1. Ensure backend is running on port 5000
2. Check `VITE_API_URL` in root `.env`
3. Verify `FRONTEND_URL` in `backend/.env` matches frontend port

### Database errors
```bash
cd backend
npx prisma migrate reset  # Reset and re-seed (⚠️ deletes data)
```

### Port conflicts
- Backend default: 5000 (change `PORT` in `backend/.env`)
- Frontend default: 8080 (change in `vite.config.ts`)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Mohamed Dachraoui**
- GitHub: [@dachraoui-ui](https://github.com/dachraoui-ui)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide](https://lucide.dev/) for the icon set

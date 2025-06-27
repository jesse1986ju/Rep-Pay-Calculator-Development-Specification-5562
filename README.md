# Rep Pay Calculator

A comprehensive web application for Brinks Home Security representatives to calculate payouts based on customer qualification, sale type, contract terms, and upsells. Includes a full admin dashboard with role-based access control.

## Features

### Rep Features
- **Pay Calculator**: Calculate payouts based on MMR, qualification grade, contract terms, and add-ons
- **Real-time Results**: Instant calculation with detailed breakdown
- **Export Options**: Save calculations and export to PDF
- **Profitability Indicators**: Color-coded alerts for deal profitability

### Admin Features
- **Multipliers Management**: Set qualification grade multipliers globally or by scope
- **Package Management**: Create and manage base packages and equipment add-ons
- **Settings Control**: Configure global settings like deduction percentages
- **Audit Logs**: Track all system changes with detailed logging

### Manager Features
- **Scoped Control**: Manage settings for assigned reps or regions
- **Team Management**: Set available packages and add-ons for team members

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Animation**: Framer Motion
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('rep', 'manager', 'admin')),
  state TEXT,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Multipliers Table
```sql
CREATE TABLE multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade TEXT NOT NULL CHECK (grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C')),
  value DECIMAL(5,2) NOT NULL,
  state TEXT,
  manager_id UUID REFERENCES users(id),
  rep_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Base Packages Table
```sql
CREATE TABLE base_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  equipment_cost DECIMAL(10,2) NOT NULL,
  install_fee DECIMAL(10,2) NOT NULL,
  activation_fee DECIMAL(10,2) NOT NULL,
  state TEXT,
  manager_id UUID REFERENCES users(id),
  rep_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Equipment Add-ons Table
```sql
CREATE TABLE equipment_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  description TEXT,
  state TEXT,
  manager_id UUID REFERENCES users(id),
  rep_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deduct_percent DECIMAL(5,2) DEFAULT 10,
  platinum_bonus DECIMAL(10,2) DEFAULT 50,
  term_adjustment_36mo DECIMAL(10,2) DEFAULT 99,
  created_by_admin UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rep-pay-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new Supabase project
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key
   - Run the database migrations (SQL schemas above)

4. **Start development server**
   ```bash
   npm run dev
   ```

## Calculation Logic

### Base Calculation
1. **Gross Revenue** = MMR × Qualification Multiplier
2. **Revenue Deduction** = Gross Revenue × Deduction Percentage (default 10%)
3. **Package Costs** = Equipment Cost + Install Fee + Activation Fee
4. **Contract Adjustment** = -$99 if 36-month term selected
5. **Add-on Costs** = Sum of (Add-on Cost × Quantity)
6. **Platinum Bonus** = +$50 if Platinum Protection selected

### Final Calculation
**Final Rep Pay** = Gross Revenue - Revenue Deduction - Package Costs - Contract Adjustment - Add-on Costs + Platinum Bonus

## User Roles

### Rep
- Access to calculator only
- Can see calculation results
- No backend access

### Manager
- View/edit settings for assigned reps
- Set available packages/add-ons for team
- Regional/team-specific controls

### Admin
- Full system control
- Global settings management
- User management
- Audit log access

## Security Features

- **Role-based Access Control**: Strict permissions based on user roles
- **Protected Routes**: Authentication required for all pages
- **Scoped Data Access**: Users only see data relevant to their role/scope
- **Audit Logging**: All administrative changes are tracked

## Future Enhancements

- Rep login history tracking
- State-specific payout rules
- Real-time dashboard analytics
- Notification system
- Bulk quote export for managers
- Mobile app version
- Advanced reporting features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software for Brinks Home Security.
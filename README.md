# Rep Pay Calculator

A comprehensive web application for Engage Home Security representatives to calculate payouts based on customer qualification, sale type, contract terms, and upsells. Features a **public calculator** with **admin-only configuration**.

## Features

### 🌐 Public Calculator
- **No Login Required**: Reps can access the calculator without authentication
- **Real-time Calculations**: Instant calculation with detailed breakdown
- **Local Storage**: Save calculations locally for reference
- **Export Options**: Export calculations to PDF
- **Profitability Indicators**: Color-coded alerts for deal profitability
- **C Grade Restrictions**: C Grade customers automatically cannot have Platinum Added

### 🔐 Admin Dashboard
- **Secure Access**: Admin-only login for configuration
- **Multipliers Management**: Set qualification grade multipliers
- **Package Management**: Create and manage base packages and equipment add-ons
- **Settings Control**: Configure global settings like deduction percentages
- **Audit Logs**: Track all system changes with detailed logging

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Animation**: Framer Motion
- **Database**: Supabase
- **Authentication**: Supabase Auth (Admin Only)
- **Routing**: React Router DOM

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
   - Run the database migrations:
     1. Execute `database/schema.sql` in Supabase SQL Editor
     2. Execute `database/public_policies.sql` for public access policies

4. **Start development server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:
- **users_rpc_x7k9m2**: Admin user management
- **multipliers_rpc_x7k9m2**: Qualification grade multipliers
- **base_packages_rpc_x7k9m2**: Base security packages
- **equipment_addons_rpc_x7k9m2**: Equipment add-ons
- **settings_rpc_x7k9m2**: Global configuration settings

## Access Levels

### Public Access
- **Route**: `/` (home page)
- **Access**: No authentication required
- **Features**: Full calculator functionality, local storage

### Admin Access
- **Route**: `/admin/login` → `/admin`
- **Access**: Admin authentication required
- **Features**: Full system configuration, user management, audit logs

## Calculation Logic

### Base Calculation
1. **Gross Revenue** = MMR × Qualification Multiplier
2. **Revenue Deduction** = Gross Revenue × Deduction Percentage (default 10%)
3. **Package Costs** = Equipment Cost + Install Fee + Activation Fee
4. **Contract Adjustment** = -$99 if 36-month term selected
5. **Add-on Costs** = Sum of (Add-on Cost × Quantity)
6. **Platinum Bonus** = +$50 if Platinum Protection selected (NOT AVAILABLE for C Grade)

### Final Calculation
**Final Rep Pay** = Gross Revenue - Revenue Deduction - Package Costs - Contract Adjustment - Add-on Costs + Platinum Bonus

### Special Rules
- **C Grade Restriction**: C Grade customers cannot have Platinum Added - it's automatically set to "No"
- **Auto-disable**: When C Grade is selected, Platinum protection is automatically disabled
- **Visual Indicators**: Clear warnings when C Grade is selected

## Security Features

- **Public Calculator**: Read-only access to calculation data
- **Admin Authentication**: Secure login for configuration access
- **Row-Level Security**: Database-level access control
- **Protected Routes**: Admin areas require authentication

## Default Configuration

### Multipliers
- A: 1.25, A-: 1.20, B+: 1.15, B: 1.10, B-: 1.05, C: 1.00

### Settings
- Revenue Deduction: 10%
- Platinum Bonus: $50 (Not available for C Grade)
- 36-Month Adjustment: -$99

### Sample Packages
- Basic Security Package: $199.99 equipment + $99 install + $49.99 activation
- Advanced Security Package: $299.99 equipment + $129 install + $49.99 activation
- Premium Security Package: $399.99 equipment + $159 install + $49.99 activation
- Ultimate Security Package: $499.99 equipment + $199 install + $49.99 activation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software for Engage Home Security.
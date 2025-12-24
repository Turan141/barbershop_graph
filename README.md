# Barber Booking App

Full-stack barber booking app.

- Frontend: React + Vite + TypeScript
- Backend: Node.js (Express) + Prisma
- Database: PostgreSQL (Neon)

## Features

- **Search Barbers**: Filter by name, location, or service.
- **Barber Profile**: View portfolio, services, and schedule.
- **Booking System**: Select service, date, and time to book an appointment.
- **Authentication**: JWT login/register.
- **Favorites**: Save your favorite barbers.
- **Persistence**: Stored in PostgreSQL via Prisma.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Backend**: Express + Prisma
- **Database**: PostgreSQL (Neon)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository (if applicable) or navigate to the project folder.
2. Install dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
npm -C server install
```

### Running the App

1. Configure backend env:

- Create `server/.env` (see `server/.env.example`)
- Required: `DATABASE_URL`, `JWT_SECRET`

2. Start the backend:

```bash
npm -C server run dev
```

3. (Optional) Seed sample data:

```bash
npm -C server run seed
```

4. Start the frontend:

```bash
npm run dev
```

Open your browser at the Vite URL printed in the terminal.

### Database & Prisma migrations

This repo includes a single baseline migration at `server/prisma/migrations/20251224180000_baseline`.

Fresh database (recommended for CI / new environments):

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

Existing database that was created via `prisma db push` (no migrations history yet):

```bash
cd server
npx prisma migrate resolve --applied 20251224180000_baseline
```

After baselining, ship future schema changes via new migrations + `prisma migrate deploy`.

Database has old migrations recorded that are not present in this repo:

- This usually means the database was previously managed by a different set of migration folders (or they were deleted/renamed).
- Recommended fix for production is to use a fresh database, then run `prisma migrate deploy`, and seed/create barbers.
- If you must keep the existing database, you need to re-baseline its migration history to match this repo.

One approach (advanced; be careful):

1. Back up the database.
2. Clear Prisma migration history table (this does **not** drop your actual tables/data):

```sql
DELETE FROM "_prisma_migrations";
```

3. Mark the baseline as applied:

```bash
cd server
npx prisma migrate resolve --applied 20251224180000_baseline
```

### Production note: "No barbers"

If the production UI shows "No barbers" with no load error, the API is responding with an empty list (typically because the production database is empty or points to a different `DATABASE_URL`).

- To seed demo barbers into the currently configured database:

```bash
cd server
npm run seed
```

### Testing the Flow

1. **Login**: Go to `/login`. Use the pre-filled demo credentials (`client@test.com`).
2. **Search**: On the home page, you'll see a list of barbers. Try searching for "Alex".
3. **View Profile**: Click on a barber card to view their profile.
4. **Book**:
   - Select a service (e.g., "Classic Haircut").
   - Select a date from the dropdown.
   - Select an available time slot.
   - Click "Confirm Booking".
5. **Favorites**: Click the heart icon on a barber's profile to add them to your favorites.

## Project Structure

- `src/services`: API wrapper functions.
- `src/store`: Zustand stores for global state.
- `src/pages`: Main application pages.
- `src/components`: Reusable UI components.
- `server/src`: Express API.
- `server/prisma`: Prisma schema, migrations, seed.

## Future Improvements

- **Barber Dashboard**: Interface for barbers to manage bookings.
- **Payments**: Integrate Stripe for payments.
- **Notifications**: Email/SMS reminders.

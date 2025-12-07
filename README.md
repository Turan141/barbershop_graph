# Barber Booking App

A frontend-only React application for booking barber appointments, using MSW (Mock Service Worker) to simulate a backend.

## Features

- **Search Barbers**: Filter by name, location, or service.
- **Barber Profile**: View portfolio, services, and schedule.
- **Booking System**: Select service, date, and time to book an appointment.
- **Authentication**: Mock login/register flow.
- **Favorites**: Save your favorite barbers.
- **Persistence**: All data is saved to `localStorage`.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Mocking**: MSW (Mock Service Worker)
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

### Running the App

1. Start the development server:

```bash
npm run dev
```

2. Open your browser at `http://localhost:5173`.

**Note**: On the first load, MSW will initialize and intercept network requests. You might see a console message `[MSW] Mocking enabled`.

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

- `src/mocks`: MSW handlers and local database simulation.
- `src/services`: API wrapper functions.
- `src/store`: Zustand stores for global state.
- `src/pages`: Main application pages.
- `src/components`: Reusable UI components.

## Future Improvements

- **Barber Dashboard**: Interface for barbers to manage bookings.
- **Real Backend**: Replace MSW with a Node.js/Express server.
- **Payments**: Integrate Stripe for payments.
- **Notifications**: Email/SMS reminders.

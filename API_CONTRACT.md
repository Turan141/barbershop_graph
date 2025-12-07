# API Contract (Mocked)

This document describes the mocked API endpoints available in the application.

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

### POST /auth/login

- **Body**: `{ email: string }`
- **Response**: `{ user: User, token: string }`

### POST /auth/register

- **Body**: `{ name: string, email: string, role: 'client' | 'barber' }`
- **Response**: `{ user: User, token: string }`

## Barbers

### GET /barbers

- **Query Params**: `query` (optional search term)
- **Response**: `Barber[]`

### GET /barbers/:id

- **Response**: `Barber`

### GET /barbers/:id/bookings

- **Response**: `Booking[]`

## Bookings

### POST /bookings

- **Body**: `{ barberId, clientId, serviceId, date, time }`
- **Response**: `Booking`
- **Error 409**: If slot is already taken.

### PATCH /bookings/:id

- **Body**: `{ status: 'confirmed' | 'cancelled' }`
- **Response**: `Booking`

## Favorites

### GET /users/:id/favorites

- **Response**: `Barber[]`

### POST /users/:id/favorites

- **Body**: `{ barberId: string }`
- **Response**: `{ success: true }`

### DELETE /users/:id/favorites/:barberId

- **Response**: `{ success: true }`

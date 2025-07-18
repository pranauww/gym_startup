# Gym App Backend

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values.
3. Run database migrations (see schema.sql).
4. Start the server:
   ```sh
   npm run dev
   ```

## API Routes
- `/api/users`
- `/api/workouts`
- `/api/social`

## Database
- Uses PostgreSQL. See `schema.sql` for tables.

## S3
- Configure AWS credentials in `.env` for video uploads. 
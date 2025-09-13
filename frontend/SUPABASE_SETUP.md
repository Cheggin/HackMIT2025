# Supabase Setup Instructions

## Prerequisites
1. A Supabase account and project
2. Your transaction data loaded into a Supabase table

## Configuration

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under Settings > API.

## Database Schema

The application expects an `events` table in the `public` schema with the following structure:

```sql
CREATE TABLE public.events (
  id BIGINT PRIMARY KEY,
  type TEXT,
  properties JSONB,
  time BIGINT
);
```

The `properties` JSONB field should contain:
- `step`: Transaction step/sequence number
- `amount`: Transaction amount
- `isFraud`: "0" or "1" indicating fraud
- `nameDest`: Destination account name
- `nameOrig`: Origin account name
- `oldbalanceOrg`: Original balance before transaction
- `newbalanceOrig`: Original balance after transaction
- `oldbalanceDest`: Destination balance before transaction
- `newbalanceDest`: Destination balance after transaction
- `isFlaggedFraud`: "0" or "1" indicating suspicious activity

## Features

- **Real-time Updates**: The app subscribes to INSERT events on the public.events table
- **Sliding Window**: Shows the last 50 transactions in charts
- **Continuous Polling**: Fetches new transactions every 2 seconds
- **Anomaly Detection**: Automatically detects and highlights suspicious transactions

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will:
1. Connect to your Supabase database
2. Load the 50 most recent transactions
3. Start polling for new transactions
4. Update charts and visualizations in real-time
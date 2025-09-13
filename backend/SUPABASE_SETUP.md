# Supabase Setup Guide for HackMIT 2025 Backend

This guide will help you set up Supabase for your FastAPI backend.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Python 3.8+ installed
3. Your FastAPI backend project

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `hackmit-2025-backend` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your Supabase credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase_schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `users` table with proper indexes and constraints
- `projects` table with foreign key relationships
- Row Level Security (RLS) policies
- Sample data for testing

## Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 6: Test the Connection

1. Start your FastAPI server:
   ```bash
   python main.py
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:8000/api/health
   ```

   You should see:
   ```json
   {
     "status": "healthy",
     "message": "API is running",
     "timestamp": "2024-01-01T00:00:00",
     "database_connected": true
   }
   ```

## Step 7: Test API Endpoints

### Create a User
```bash
curl -X POST "http://localhost:8000/api/users/" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User",
       "password": "password123"
     }'
```

### Get All Users
```bash
curl -X GET "http://localhost:8000/api/users/"
```

### Create a Project
```bash
curl -X POST "http://localhost:8000/api/projects/" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "My Test Project",
       "description": "A test project",
       "owner_id": 1
     }'
```

## Troubleshooting

### Common Issues

1. **"Supabase client not available"**
   - Check that your environment variables are set correctly
   - Verify your Supabase URL and keys are correct

2. **"Database connection test failed"**
   - Ensure your Supabase project is running
   - Check that the database schema has been created
   - Verify your API keys have the correct permissions

3. **"User with this email already exists"**
   - This is expected if you've already created a user with that email
   - Try with a different email or check existing users

### Debug Mode

To enable debug logging, set `DEBUG=True` in your `.env` file and check the console output for detailed error messages.

## Security Notes

1. **Never commit your `.env` file** - it contains sensitive credentials
2. **Use environment variables in production** - don't hardcode credentials
3. **Rotate your API keys regularly** - especially the service role key
4. **Review RLS policies** - ensure they match your security requirements

## Next Steps

1. **Authentication**: Implement JWT-based authentication using Supabase Auth
2. **Real-time**: Use Supabase's real-time features for live updates
3. **Storage**: Use Supabase Storage for file uploads
4. **Edge Functions**: Deploy serverless functions for complex operations

## API Documentation

Once your server is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **Alternative docs**: `http://localhost:8000/redoc`

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Python Client](https://github.com/supabase/supabase-py)

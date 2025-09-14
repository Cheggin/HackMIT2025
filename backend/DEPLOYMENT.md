# FastAPI Backend Deployment Guide

## Quick Start - Using ngrok (5 minutes)

1. **Install ngrok**:
   ```bash
   brew install ngrok  # macOS
   # Or download from https://ngrok.com/download
   ```

2. **Run your backend**:
   ```bash
   cd backend
   source .venv_working/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. **Expose with ngrok** (new terminal):
   ```bash
   ngrok http 8000
   ```
   You'll get a URL like: `https://abc123.ngrok-free.app`

4. **Update frontend** to use the ngrok URL in your API calls.

## Production Deployment Options

### Option 1: Render (Free Tier)

1. **Push to GitHub**
2. **Sign up** at [render.com](https://render.com)
3. **New Web Service** → Connect your GitHub repo
4. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add environment variables**:
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
   - SUPABASE_KEY
   - ENVIRONMENT=production
6. **Deploy** - You'll get a URL like: `https://your-app.onrender.com`

### Option 2: Railway (Simple & Fast)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Add environment variables** in Railway dashboard:
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
   - SUPABASE_KEY
   - ENVIRONMENT=production

4. **Generate domain** in Railway settings

### Option 3: Fly.io (Global Edge)

1. **Install flyctl**:
   ```bash
   brew install flyctl  # macOS
   ```

2. **Create Dockerfile**:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
   ```

3. **Deploy**:
   ```bash
   fly launch
   fly secrets set ANTHROPIC_API_KEY=your_key
   fly secrets set SUPABASE_URL=your_url
   fly secrets set SUPABASE_KEY=your_key
   fly deploy
   ```

### Option 4: Vercel (Serverless)

1. **Create** `vercel.json`:
   ```json
   {
     "builds": [
       {"src": "main.py", "use": "@vercel/python"}
     ],
     "routes": [
       {"src": "/(.*)", "dest": "main.py"}
     ]
   }
   ```

2. **Deploy**:
   ```bash
   npm i -g vercel
   vercel
   ```

## Important Notes

### CORS Configuration
The backend is configured to allow all origins (`*`) in production mode. For security, update this to your specific frontend domain:

```python
# In main.py, update:
allowed_origins = ["https://your-frontend-domain.com"]
```

### Environment Variables
Always set these in your deployment platform:
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `ENVIRONMENT`: Set to "production"

### Frontend Configuration
Update your frontend to use the deployed backend URL:

```javascript
// In frontend/src/services/exploratoryService.ts
const API_URL = 'https://your-backend-url.com';
```

## Testing Your Deployment

```bash
# Test the API is working
curl https://your-backend-url.com/

# Test the exploratory endpoint
curl -X POST https://your-backend-url.com/api/exploratory \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Show me transaction trends"}'
```

## Monitoring & Logs

- **Render**: Dashboard → Logs tab
- **Railway**: `railway logs`
- **Fly.io**: `fly logs`
- **Vercel**: Dashboard → Functions tab

## Troubleshooting

1. **CORS errors**: Ensure your frontend domain is in allowed_origins
2. **500 errors**: Check environment variables are set correctly
3. **Timeout errors**: Some free tiers have 30s limits, optimize your queries
4. **Cold starts**: Free tiers may sleep, first request will be slow
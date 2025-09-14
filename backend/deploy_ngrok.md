# Deploy FastAPI with ngrok (Quick Testing)

## 1. Install ngrok
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

## 2. Sign up for free ngrok account
Visit https://ngrok.com and sign up for a free account to get an auth token

## 3. Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## 4. Run your FastAPI server
```bash
cd backend
source .venv_working/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 5. In another terminal, expose it with ngrok
```bash
ngrok http 8000
```

You'll get a public URL like: https://abc123.ngrok.io

## 6. Update your frontend to use the ngrok URL
Update your frontend's API calls to use the ngrok URL.
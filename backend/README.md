# Backend

This is the backend for the application, built with Node.js and Express.js. It uses an in-memory store instead of a database, so all data will be reset when the server restarts.

## How to start the backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000` (or another port if specified).

## PayHere Sandbox Setup

Set these environment variables before starting the backend:

- `PAYHERE_MERCHANT_ID` - your PayHere merchant ID
- `PAYHERE_MERCHANT_SECRET` - your PayHere merchant secret
- `PAYHERE_SANDBOX=true` - keeps checkout on PayHere sandbox URL
- `API_BASE_URL` - public backend base URL used for `notify`, `return`, `cancel` callbacks
- `CLIENT_URL` - frontend URL used for redirecting after PayHere return/cancel

Example values:

```env
PAYHERE_MERCHANT_ID=121XXXX
PAYHERE_MERCHANT_SECRET=xxxxxxxxxxxxxxxx
PAYHERE_SANDBOX=true
API_BASE_URL=https://your-public-backend-url
CLIENT_URL=http://localhost:3000
```

### Callback Note

PayHere `notify_url` must be publicly reachable. For local development, use a tunneling URL (for example ngrok) as `API_BASE_URL`.

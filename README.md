# Workzup

This is a full-stack Next.js and Express.js project.

## Project Structure

- **Frontend:** Next.js application living in the root directory.
- **Backend:** Node.js + Express backend living in the `backend/` directory.

---

## How to Start the App

The best way to run both the frontend and backend simultaneously is to use our concurrent script from the root folder:

```bash
# Make sure you are in the root directory (workzup)
npm run dev:all
```
*This will start the backend on `http://localhost:5000` and the frontend on `http://localhost:3000` automatically.*

### Running Individually

If you prefer to run them in separate terminals:

**1. Start the Backend:**
```bash
# If you are in the root directory:
cd backend
npm run dev

# IMPORTANT: Do NOT run "cd backend" if you are already inside the backend folder!
```

**2. Start the Frontend:**
```bash
# Open a new terminal in the root directory
npm run dev:frontend
```

---

## Troubleshooting

- **EADDRINUSE (Port in use error):** The backend is configured to automatically fallback to port `5001` if port `5000` is already taken. If this happens, Next.js will currently still look for port 5000 unless you manually update your `.env.local` to point to port 5001.
- **Unexpected token '<' JSON error:** This usually means your frontend is trying to talk to the backend, but the backend is not running. Make sure you have started the backend!

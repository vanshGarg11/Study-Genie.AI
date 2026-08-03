# StudyGenie

StudyGenie is a full-stack AI study assistant for students. It lets users upload PDFs, chat with their study material, generate notes for free, and then use coins for premium guided-learning features starting with AI lesson generation.

## What Is Built

- User registration and login with JWT authentication.
- Dashboard with coin balance, recent PDFs, and quick actions.
- PDF upload with server-side text extraction.
- PDF chat that answers from uploaded document content.
- Free AI notes generation.
- Premium AI lesson generation from PDF text, including slides, browser voice narration, and quiz data.
- Coin wallet with signup bonus, usage deductions, transaction history, and Razorpay purchases.
- Payment history and profile pages.

## Roadmap Status

```text
Upload PDF             Done, free
Chat with PDF          Done, free
Generate Notes         Done, free
Generate Lesson        Started, premium coins
AI Voice Teacher       Started with browser text-to-speech
Interactive Slides     Started with slide player/navigation
Quiz                   Started inside lessons
Flashcards             Backend generation exists
Progress Tracking      Data model exists, product flow pending
Analytics              Pending
Certificates           Pending
```

Coins begin at `Generate Lesson` and continue through the premium roadmap features after it. Upload PDF, Chat with PDF, and Generate Notes are free user actions.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide icons.
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose.
- AI: Groq SDK with `llama-3.3-70b-versatile`.
- Files: Multer and `pdf-parse`.
- Payments: Razorpay.

## Project Structure

```text
StudyGenie/
  backend/    Express API, MongoDB models, AI services, payments
  frontend/   React app, pages, routing, shared API client
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Optional frontend env in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Run Locally

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal.

## Main API Areas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/pdf/upload`
- `GET /api/pdf/my-pdfs`
- `POST /api/pdf/chat/:pdfId`
- `POST /api/ai/notes`
- `POST /api/ai/quiz`
- `POST /api/ai/flashcards`
- `POST /api/lesson/generate/:pdfId`
- `GET /api/coins/balance`
- `GET /api/coins/history`
- `POST /api/payment/create-order`
- `POST /api/payment/verify`

## Suggested Next Work

- Add tests for auth, payments, coin deductions, PDF uploads, and AI lesson generation.
- Add saved notes history and show the real notes count on the dashboard.
- Add PDF delete, rename, folders, and tags.
- Add admin views for users, payments, and usage analytics.
- Add production deployment configuration.

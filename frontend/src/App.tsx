import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import PDF from "./pages/PDF";
import PDFChat from "./pages/PDFChat";
import MyPDFs from "./pages/MyPDFs";
import Coins from "./pages/Coins";
import PaymentHistory from "./pages/PaymentHistory";
import Profile from "./pages/Profile";
import LessonPlayer from "./pages/LessonPlayer";
import MyLessons from "./pages/MyLessons";
import LectureRoom from "./pages/LectureRoom";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<Coins />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/pdf" element={<PDF />} />
          <Route path="/pdfs" element={<MyPDFs />} />
          <Route path="/pdf/chat/:pdfId" element={<PDFChat />} />
          <Route path="/lessons" element={<MyLessons />} />
          <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="/lecture/:lectureId" element={<LectureRoom />} />
          <Route path="/coins" element={<Coins />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

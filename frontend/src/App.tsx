import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
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
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/pdfs" element={<MyPDFs />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/pdf" element={<PDF />} />
          <Route path="/coins" element={<Coins />} />
          <Route path="/pdf/chat/:pdfId" element={<PDFChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lessons" element={<MyLessons />} />
          <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="/lecture/:lectureId" element={<LectureRoom />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

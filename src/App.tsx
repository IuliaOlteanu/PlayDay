import './index.css';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './components/context/auth-provider';
import Header  from './components/Header';
import InProgressPage from './pages/InProgressPage';
import MyProfilePage from './pages/MyProfilePage';
import GamesPage from './pages/GamesPage';
import { FieldsPage } from './pages/FieldsPage';
import MyFields from './pages/MyFields';
import PaymentEmulator from "./pages/PaymentEmulator";
import { Toaster } from './components/ui/toaster';

function App() {

  return (
    <div className="h-screen">
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Routes>
            {/* Redirect from root to /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Home Page */}
            <Route path="/home" element={<HomePage />} />

            {/* About Page */}
            <Route path="/about" element={<AboutPage />} />

            {/* Fields Page */}
            <Route path="/fields" element={<FieldsPage />} />

            {/* Sign In Page */}
            <Route path="/signIn" element={<SignIn />} />

            {/* Sign Up Page */}
            <Route path="/signUp" element={<SignUp />} />

            {/* My Profile Page */}
            <Route path="/my-profile" element={<MyProfilePage />} />

            {/* My Games Page */}
            <Route path="/games" element={<GamesPage />} />

            {/* My Fields Page */}
            <Route path="/my-fields" element={<MyFields />} />

            {/* In Payment Emulator Page */}
            <Route path="/payment" element={<PaymentEmulator />} />

            {/* Fallback for unmatched routes */}
            <Route path="*" element={<InProgressPage />} />
          </Routes>

          <Toaster />
        </AuthProvider>
      </BrowserRouter>

    </div>
  )
}

export default App

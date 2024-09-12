import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConversationProvider } from './context/ConversationContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ChatComponent from './components/Chat';
import VerifyEmail from './components/VerifyEmail';
import ResendVerificationEmail from './components/ResendVerificationEmail';
import AppLayout from './layouts/AppLayout';
import SetupPayment from './components/Stripe/SetupPayment';
import ConfirmPayment from './components/Stripe/ConfirmPayment';
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/setup-payment" element={<SetupPayment />} />
            <Route path="/setup-payment-success" element={<ConfirmPayment />} />
          </Route>
        </Routes>
        <ThemeProvider>
          <ProfileProvider>
            <ConversationProvider>
              <AppLayout>
                <Routes>
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<PrivateRoute />}>
                    <Route path="/resend-verification-email" element={<ResendVerificationEmail />} />
                    <Route path="/" element={<ChatComponent />} />
                    <Route path="/chat" element={<Navigate to="/" replace />} />
                    <Route path="/chat/:chatId" element={<ChatComponent />} />
                    <Route path="/dashboard/:section" element={<Dashboard />} />
                  </Route>
                </Routes>
              </AppLayout>
            </ConversationProvider>
          </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

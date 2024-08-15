import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConversationProvider } from './context/ConversationContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ChatComponent from './components/Chat';
import VerifyEmail from './components/VerifyEmail';
import ResendVerificationEmail from './components/ResendVerificationEmail';
import AppLayout from './layouts/AppLayout';
import StripePayment from './components/StripePayment';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-payment" element={<StripePayment />} />
          <Route element={<PrivateRoute />}>
            <Route path="/resend-verification-email" element={<ResendVerificationEmail />} />
            <Route element={
              <ConversationProvider>
                <AppLayout />
              </ConversationProvider>
            }>
              <Route path="/" element={<ChatComponent />} />
              <Route path="/chat/:chatId" element={<ChatComponent />} />
              <Route path="/dashboard/:section" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ChatComponent from './components/Chat';
import VerifyEmail from './components/VerifyEmail';
import ResendVerificationEmail from './components/ResendVerificationEmail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification-email" element={<PrivateRoute><ResendVerificationEmail /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatComponent /></PrivateRoute>} />
          <Route path="/chat/:chatId" element={<PrivateRoute><ChatComponent /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<ChatComponent />} />
            <Route path="/chat/:chatId" element={<ChatComponent />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resend-verification-email" element={<ResendVerificationEmail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
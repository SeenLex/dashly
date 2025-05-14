import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/authentication/Register';
import Login from './pages/authentication/Login';
import AdminPage from './pages/home/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;

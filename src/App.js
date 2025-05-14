import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/authentication/Register';
import Login from './pages/authentication/Login';
import Home from './pages/home/Home';
import AdminPage from './pages/home/AdminPage';
import Home2 from './Home2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/approve" element={<AdminPage />} />
        <Route path="/home" element={<Home2 />} />
      </Routes>
    </Router>
  );
}

export default App;

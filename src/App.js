import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/authentication/Register';
import Login from './pages/authentication/Login';

import AdminPage from './pages/home/AdminPage';
import Home2 from './Home2';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/approve" element={<AdminPanel />} />
        <Route path="/home" element={<Home2 />} />
      </Routes>
    </Router>
  );
}

export default App;

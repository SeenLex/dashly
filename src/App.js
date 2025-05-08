import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/authentication/Register';
import Login from './pages/authentication/Login';
import Home from './pages/home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

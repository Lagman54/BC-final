import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MintPage from './pages/MintPage';
import BuyPage from './pages/BuyPage';
import Header from './components/Header';
import './App.css';

export default function App() {
  return (
    <Router>
      <Header />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<MintPage />} />
          <Route path="/buy" element={<BuyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

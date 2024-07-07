import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { NavBar } from "./components/NavBar";
import { Home } from './components/Home';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Homepage } from './components/Homepage';
import { SignUpCoord } from './components/SignUpCoord';
import { SEA } from './components2/SEA';
import { Layout } from './components2/Layout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><NavBar /><Home /></>} />
        <Route path="/login" element={<><NavBar/><Login /></>} />
        <Route path="/signup" element={<><NavBar/><SignUp /></>} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/signup-coord" element={<><NavBar/><SignUpCoord /></>} />
        <Route path="/SEA" element={<><Layout/><SEA/></>} />
      </Routes>
    </Router>
  );
}

export default App;

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
import { Appointments } from './components2/Appointments';
import { Church } from './components2/Church';
import { Listpriest } from './components2/Listpriest';
import { Serviceoff } from './components2/Serviceoff';
import { ReqVol } from './components2/ReqVol';

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
        <Route path="/Appointments" element={<><Layout/><Appointments/></>} />
        <Route path="/ChurchInfo" element={<><Layout/><Church/></>} />
        <Route path="/ListofPriest" element={<><Layout/><Listpriest/></>} />
        <Route path="/ServiceOffered" element={<><Layout/><Serviceoff/></>} />
        <Route path="/RequestforVolunteer" element={<><Layout/><ReqVol/></>} />
      </Routes>
    </Router>
  );
}

export default App;

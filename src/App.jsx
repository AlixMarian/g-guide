import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from "./components/NavBar";
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Homepage from './components/Homepage';
import WebUserNavBar from './components/WebsiteUserNavBar';
import SignUpCoord from './components/SignUpCoord';
import ViewAppointments from './components/ViewAppointments';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SEA from './components2/SEA';
import Layout from './components2/Layout';
import Appointments from './components2/Appointments';
import Church from './components2/Church';
import Listpriest from './components2/Listpriest';
import Serviceoff from './components2/Serviceoff';
import ReqVol from './components2/ReqVol';
import AccountSettings from './components2/AccountSett';
import UserAccountSettings from './components/UserAccountSettings';
import MapComponent from './components/MapComponent';
import SysAdminPendingChurch from './components3/SysAdminPendingChurch';
import SysAdminDashboard from './components3/SysAdminDashboard';
import SysAdminAccSettings from './components3/SysAdminAccSettings';


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Routes for website user */}
        <Route path="/" element={<><NavBar /><Home /></>} />
        <Route path="/login" element={<><NavBar/><Login /></>} />
        <Route path="/signup" element={<><NavBar/><SignUp /></>} />
        <Route path="/homepage" element={<><WebUserNavBar /><Homepage /></>} />
        <Route path="/view-appointments" element={<><WebUserNavBar /><ViewAppointments /></>} /> 
        <Route path="/user-accSettings" element={<><WebUserNavBar /><UserAccountSettings /></>} /> {/* for web user */}
        <Route path="/signup-coord" element={<><NavBar/><SignUpCoord /></>} />
        
        <Route path="/map" element={<MapComponent/>} />

        {/* Routes for church coordinator */}
        <Route path="/SEA" element={
          <>
            <Layout/>
            <div className="main-content">
            <SEA/>
            </div>
          </>
        } />

        <Route path="/Appointments" element={
          <>
            <Layout/>
            <div className="main-content">
            <Appointments/>
          </div>
          </>
        } />
        <Route path="/ChurchInfo" element={
          <>
              <Layout/>
              <div className="main-content">
                <Church/>
              </div>
          </>
        } />
        <Route path="/ListofPriest" element={
        <>
            <Layout/>
            <div className="main-content">
              <Listpriest/>
            </div>
        </>} />
        <Route path="/ServiceOffered" element={
          <>
            <Layout/>
            <div className="main-content">
              <Serviceoff/>
            </div>
          </>} />
        <Route path="/RequestforVolunteer" element={
          <>
            <Layout/>
            <div className="main-content">
              <ReqVol/>
            </div>
          </>} />
        <Route path="/AccountSettings" element={
          <>
            <Layout/>
              <div className="main-content">
                <AccountSettings/>
              </div>
          </>} />

          {/* Routes for System Admin */}
          <Route path="/systemAdminDashboard" element={<SysAdminDashboard/>}/>
          <Route path="/pending-church" element={<SysAdminPendingChurch/>}/>
          <Route path="/sys-account" element={<SysAdminAccSettings/>}/>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;

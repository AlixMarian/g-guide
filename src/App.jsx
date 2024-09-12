import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import Sidebar from './components2/Sidebar';
import PendingAppointments from './components2/Appointments/PendingAppointments'
import AccountSettings from './components2/AccountSett';
import UserAccountSettings from './components/UserAccountSettings';
import MapComponent from './components/MapComponent';
import SysAdminPendingChurch from './components3/SysAdminPendingChurch';
import SysAdminDashboard from './components3/SysAdminDashboard';
import SysAdminAccSettings from './components3/SysAdminAccSettings';
import SysAdminSidebar from './components3/SysAdminSidebar';
import UserDatabase from './components3/UserDatabase';
import ChurchDatabase from './components3/ChurchDatabase';
import ChurchOptions from './components4/ChurchOptions';
import ChurchHomepage from './components4/ChurchHomepage';



const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/map" />} />

        
        <Route path="/map" element={<MapComponent />} />

        <Route path="/sidebar" element={<Sidebar />} />
        
        <Route path="/home" element={<><NavBar /><Home /></>} />
        <Route path="/login" element={<><NavBar/><Login /></>} />
        <Route path="/signup" element={<><NavBar/><SignUp /></>} />
        <Route path="/homepage" element={<><WebUserNavBar /><Homepage /></>} />
        <Route path="/view-appointments" element={<><WebUserNavBar /><ViewAppointments /></>} /> 
        <Route path="/user-accSettings" element={<><WebUserNavBar /><UserAccountSettings /></>} />
        <Route path="/signup-coord" element={<><NavBar/><SignUpCoord /></>} />
        
        
        {/* church coordinator routessss */}
        <Route path="/SEA" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <SEA/>
            </div>
          </>
        } />

        <Route path="/Appointments" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <Appointments/>
            </div>
          </>
        } />
        <Route path="/PendingAppointments" element={
          <>
            <Sidebar/>
              <PendingAppointments />
            </>
        } />
        <Route path="/ChurchInfo" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <Church/>
            </div>
          </>
        } />
        <Route path="/ListofPriest" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <Listpriest/>
            </div>
          </>
        } />
        <Route path="/ServiceOffered" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <Serviceoff/>
            </div>
          </>
        } />
        <Route path="/RequestforVolunteer" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <ReqVol/>
            </div>
          </>
        } />
        <Route path="/AccountSettings" element={
          <>
            <Sidebar/>
            <div className="main-content">
              <AccountSettings/>
            </div>
          </>
        } />

        
        <Route path="/systemAdminDashboard" element={
          <>
            <SysAdminSidebar/>
            <div className='sys-main-content'>
              <SysAdminDashboard/>
            </div>
          </>
        }/>

        <Route path="/pending-church" element={
          <>
            <SysAdminSidebar/>
            <div className='sys-main-content'>
              <SysAdminPendingChurch/>
            </div>
          </>
        }/>

        <Route path="/sys-account" element={
          <>
            <SysAdminSidebar/>
            <div className='sys-main-content'>
              <SysAdminAccSettings/>  
            </div>
          </>
        }/>

        <Route path="/userDB" element={
          <>
            <SysAdminSidebar/>
            <div className='sys-main-content'>
              <UserDatabase/>
            </div>
          </>
        } />

        <Route path="/churchDB" element={
          <>
            <SysAdminSidebar/>
            <div className='sys-main-content'>
              <ChurchDatabase/>
            </div>
          </>
        }/>

      


       
        <Route path="/church-options" element={<><WebUserNavBar /><ChurchOptions/></>}/>
        <Route path="/church-homepage/:churchId" element={<><WebUserNavBar /><ChurchHomepage/></>}/>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;

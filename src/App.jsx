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
import Appointments from './components2/Appointments';
import Church from './components2/Church';
import Listpriest from './components2/Listpriest';
import Serviceoff from './components2/Serviceoff';
import ReqVol from './components2/ReqVol';
import Sidebar from './components2/Sidebar';
import PendingAppointments from './components2/Appointments/PendingAppointments'
import ForPaymentAppointments from './components2/Appointments/ForPaymentAppointments'
import ApprovedAppointments from './components2/Appointments/ApprovedAppointments';
import DeniedAppointments from './components2/Appointments/DeniedAppointments';
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
import ChurchLocations from './components3/SysAdminChurchLocations';
import AdminNavbar from './components3/SysAdminNavbar';
// import Transaction from './components3/SysAdminTransaction';

const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/map" />} />

        <Route path="/map" element={<MapComponent />} />

        <Route path="/sidebar" element={<Sidebar />} />
        
        <Route path="/admin-navbar" element={<AdminNavbar />} />

        
        <Route path="/home" element={<><NavBar /><Home /></>} />
        <Route path="/login" element={<><NavBar/><Login /></>} />
        <Route path="/signup" element={<><NavBar/><SignUp /></>} />
        <Route path="/homepage" element={<><WebUserNavBar /><Homepage /></>} />
        <Route path="/view-appointments" element={<><WebUserNavBar /><ViewAppointments /></>} /> 
        <Route path="/user-accSettings" element={<><WebUserNavBar /><UserAccountSettings /></>} />
        <Route path="/signup-coord" element={<><NavBar/><SignUpCoord /></>} />
      
        
        {/* church coordinator routessss */}

        {/* OLD VERSION WITHOUT NAVBAR */}
        {/* <Route path="/PendingAppointments" element={
          <>
            <Sidebar/>
              <div className="main-content">
                <PendingAppointments />
              </div>
            </>
        } /> */}

        <Route path="/SEA" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><SEA /></div>
            </div>
          </div>
        } />

        <Route path="/Appointments" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Appointments /></div>
            </div>
          </div>
        } />

        <Route path="/PendingAppointments" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><PendingAppointments /></div>
            </div>
          </div>
        } />

        <Route path="/ForPaymentAppointments" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ForPaymentAppointments /></div>
            </div>
          </div>
        } />

        <Route path="/ApprovedAppointments" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ApprovedAppointments /></div>
            </div>
          </div>
        } />

        <Route path="/DeniedAppointments" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><DeniedAppointments /></div>
            </div>
          </div>
        } />

        <Route path="/ChurchInfo" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Church /></div>
            </div>
          </div>
        } />

        <Route path="/ListofPriest" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Listpriest /></div>
            </div>
          </div>
        } />

        <Route path="/ServiceOffered" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Serviceoff /></div>
            </div>
          </div>
        } />

        <Route path="/RequestforVolunteer" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ReqVol /></div>
            </div>
          </div>
        } />

        <Route path="/AccountSettings" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><AccountSettings /></div>
            </div>
          </div>
        } />


        {/* System Admin Routes */}
        
        <Route path="/systemAdminDashboard" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><SysAdminDashboard /></div>
            </div>
          </div>
        } />
        <Route path="/pending-church" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><SysAdminPendingChurch /></div>
            </div>
          </div>
        } />
        <Route path="/sys-account" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><SysAdminAccSettings /></div>
            </div>
          </div>
        } />
        <Route path="/userDB" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><UserDatabase /></div>
            </div>
          </div>
        } />
        <Route path="/churchDB" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><ChurchDatabase /></div>
            </div>
          </div>
        } />
        <Route path="/churchLocations" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><ChurchLocations /></div>
            </div>
          </div>
        } />
        {/* <Route path="/transaction" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><Transaction /></div>
            </div>
          </div>
        } /> */}


        <Route path="/church-options" element={<><WebUserNavBar /><ChurchOptions/></>}/>
        <Route path="/church-homepage/:churchId" element={<><WebUserNavBar /><ChurchHomepage/></>}/>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;

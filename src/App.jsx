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
import Appointments from './components2/Appointments';
import Listpriest from './components2/Listpriest';
import ReqVol from './components2/ReqVol';
import Sidebar from './components2/Sidebar';
import AccountSettings from './components2/AccountSett';
import UserAccountSettings from './components/UserAccountSettings';
import MapComponent from './components/mapfiles/MapComponent';
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
import Transactions from './components3/Transactions';
import AddChurch from './components3/AddChurch';
import RenewChurch from './components/RenewChurch';
import VisitaIglesia from './components/VisitaIglesia';
import AutoGen from './components/mapfiles/AutoGen';
import ChurchHomepageInfo from './components4/ChurchHomepageInfo';
import WebsiteUserInbox from './components/WebsiteUserInbox';
import ChurchHomepageMassSchedule from './components4/ChurchHomepageMassSchedule';
import ChurchHomepageReqVol from './components4/ChurchHomepageReqVol';
import ChurchHomepageAnnouncements from './components4/ChurchHomepageAnnouncements';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import DeniedChurches from './components3/SysAdminDeniedChurches';

//Appointments
import PendingAppointments from './components2/Appointments/PendingAppointments'
import ForPaymentAppointments from './components2/Appointments/ForPaymentAppointments'
import ApprovedAppointments from './components2/Appointments/ApprovedAppointments';
import DeniedAppointments from './components2/Appointments/DeniedAppointments';
import MassIntentions from './components2/Appointments/MassIntentions';
import Messages from './components2/Messeges';

//paymenthistory
import  PaymentHistory  from './components2/PaymentHistory';

//Mass Schedule
import Schedules from './components2/SEA/Schedules';
import ChurchEvents from './components2/SEA/ChurchEvents';
import Announcements from './components2/SEA/Announcements';

//ServicesOffered
import ExploreServices from './components2/ServiceOffered/ExploreServices';
import Slots from './components2/ServiceOffered/Slots';
import RefundPolicy from './components2/ServiceOffered/RefundPolicy';

//ChurchInfo
import ChurchDetails from './components2/ChurchInfo/ChurchDetails'
import ChurchUploads from './components2/ChurchInfo/ChurchUploads';


import { AuthProvider, useAuth } from './auth/AuthContext';
import PropTypes from 'prop-types';


const NavbarSelector = ({ children }) => {
  const { user } = useAuth(); 
  return (
    <>
      {user ? <WebUserNavBar /> : <NavBar />} 
      {children}
    </>
  );
};




NavbarSelector.propTypes = {
  children: PropTypes.node.isRequired,
};
const App = () => {
  return (
    <AuthProvider>
      <GoogleMapsProvider>
      <Router>
        <Routes>
          
          <Route path="/" element={<Navigate to="/map" />} />

          <Route path="/map" element={<MapComponent />} />

          <Route path="/sidebar" element={<Sidebar />} />
          
          <Route path="/admin-navbar" element={<AdminNavbar />} />

          <Route path="/visita-iglesia" element={<VisitaIglesia />} />

          <Route path="/autogen" element={<AutoGen />} />

          <Route path="/signup-coord" element={<><NavBar/><SignUpCoord /></>} />

          <Route path="/renew-church" element={<><NavBar/><RenewChurch /></>} />
        
       
          <Route path="/church-options" element={<NavbarSelector><ChurchOptions /></NavbarSelector>} />
          <Route path="/webUser-inbox" element={<><WebUserNavBar/><WebsiteUserInbox /></>} />
          <Route path="/home" element={<><NavBar /><Home /></>} />
          <Route path="/login" element={<><NavBar/><Login /></>} />
          <Route path="/signup" element={<><NavBar/><SignUp /></>} />
          <Route path="/homepage" element={<><WebUserNavBar /><Homepage /></>} />
          <Route path="/view-appointments" element={<><WebUserNavBar /><ViewAppointments /></>} /> 
          <Route path="/user-accSettings" element={<><WebUserNavBar /><UserAccountSettings /></>} />
        
  
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
        
        <Route path="/MassIntentions" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><MassIntentions /></div>
            </div>
          </div>
        } />
        <Route path="/Messages" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Messages /></div>
            </div>
          </div>
        } />

        <Route path="/Messages" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Messages /></div>
            </div>
          </div>
        } />

        <Route path="/PaymentHistory" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><PaymentHistory/></div>
            </div>
          </div>
        } />



        <Route path="/Schedules" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Schedules /></div>
            </div>
          </div>
        } />
        
        <Route path="/ChurchEvents" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ChurchEvents /></div>
            </div>
          </div>
        } />

        <Route path="/Announcements" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Announcements /></div>
            </div>
          </div>
        } />


        <Route path="/ExploreServices" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ExploreServices /></div>
            </div>
          </div>
        } />

        <Route path="/Slots" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><Slots /></div>
            </div>
          </div>
        } />

        <Route path="/RefundPolicy" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><RefundPolicy /></div>
            </div>
          </div>
        } />




        <Route path="/ChurchDetails" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ChurchDetails /></div>
            </div>
          </div>
        } />

        <Route path="/ChurchUploads" element={
          <div>
            <Sidebar />
            <div>
              <AdminNavbar />
              <div className='main-content'><ChurchUploads /></div>
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
        <Route path="/denied-churches" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><DeniedChurches /></div>
            </div>
          </div>
        } />

        <Route path="/transactions" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><Transactions /></div>
            </div>
          </div>
        } />
        <Route path="/addChurch" element={
          <div>
            <SysAdminSidebar />
            <div>
              <AdminNavbar />
              <div className='sys-main-content'><AddChurch /></div>
            </div>
          </div>
        } />


        {/* Church Pages with Dynamic Navbar */}
          
            <Route
              path="/church-homepage/:churchId"
              element={<NavbarSelector><ChurchHomepage /></NavbarSelector>}
            />
            <Route
              path="/church-homepage/:churchId/announcements"
              element={<NavbarSelector><ChurchHomepageAnnouncements /></NavbarSelector>}
            />
            <Route
              path="/church-homepage/:churchId/info"
              element={<NavbarSelector><ChurchHomepageInfo /></NavbarSelector>}
            />
            <Route
              path="/church-homepage/:churchId/mass-schedules"
              element={<NavbarSelector><ChurchHomepageMassSchedule /></NavbarSelector>}
            />
            <Route
              path="/church-homepage/:churchId/req-vol"
              element={<NavbarSelector><ChurchHomepageReqVol /></NavbarSelector>}
            />

            {/* Restricted Route for Booking */}
            <Route
              path="/church-homepage/:churchId/book"
              element={<>
                <WebUserNavBar />
                <ChurchHomepage />
              </>}
            />
          
      </Routes>
      <ToastContainer />
    </Router>
    
    </GoogleMapsProvider>
    </AuthProvider>
  );
}

export default App;

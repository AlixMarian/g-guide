import { useRef, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../churchCoordinator.css'; // Ensure this file has the necessary CSS styles

export const Sidebar = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [secondSidebarOpen, setSecondSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // Track active section

  const handleAppointment = () => {
    navigate('/Appointments');
    setSecondSidebarOpen(!secondSidebarOpen); // Toggle the second sidebar
    setActiveSection('appointments'); // Set the active section
  };

  const handleSEA = () => {
    navigate('/SEA');
    setActiveSection('mass-schedule');
  };

  const handleRequestforVolunteer = () => {
    navigate('/RequestforVolunteer');
    setActiveSection('volunteer-call');
  };

  const handleServiceOffered = () => {
    navigate('/ServiceOffered');
    setActiveSection('services-offered');
  };

  const handleChurchInfo = () => {
    navigate('/ChurchInfo');
    setActiveSection('church-info');
  };

  const handleListofPriest = () => {
    navigate('/ListofPriest');
    setActiveSection('priest-list');
  };

  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar" ref={sidebarRef}>
          <div className='logo'>
            <input type="image" src="../src/assets/G-Guide LOGO.png" height="80" width="80" style={{ filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5))' }}/>
          </div>
          <div className="sidebar-content">
            <div 
              className={`appointments ${activeSection === 'appointments' ? 'active' : ''}`} 
              onClick={handleAppointment}
            >
              <input type="image" src="../src/assets/appointments.png" className='image-size' />
              <h3 className='button-name'>Appointments</h3>
            </div>
            <div 
              className={`payment-history ${activeSection === 'payment-history' ? 'active' : ''}`} 
              onClick={() => setActiveSection('payment-history')}
            >
              <input type="image" src="../src/assets/payment-history.png" className='image-size' />
              <h3 className='button-name'>Payment History</h3>
            </div>
            <div 
              className={`mass-schedule ${activeSection === 'mass-schedule' ? 'active' : ''}`} 
              onClick={handleSEA}
            >
              <input type="image" src="../src/assets/mass schedule.png" className='image-size' />
              <h3 className='button-name'>Mass Schedule</h3>
            </div>
            <div 
              className={`volunteer-call ${activeSection === 'volunteer-call' ? 'active' : ''}`} 
              onClick={handleRequestforVolunteer}
            >
              <input type="image" src="../src/assets/volunteer.png" className='image-size' />
              <h3 className='button-name'>Volunteer Call</h3>
            </div>
            <div 
              className={`services-offered ${activeSection === 'services-offered' ? 'active' : ''}`} 
              onClick={handleServiceOffered}
            >
              <input type="image" src="../src/assets/services offered.png" className='image-size' />
              <h3 className='button-name'>Services Offered</h3>
            </div>
            <div 
              className={`church-info ${activeSection === 'church-info' ? 'active' : ''}`} 
              onClick={handleChurchInfo}
            >
              <input type="image" src="../src/assets/church.png" className='image-size' />
              <h3 className='button-name'>Church Info</h3>
            </div>
            <div 
              className={`priest-list ${activeSection === 'priest-list' ? 'active' : ''}`} 
              onClick={handleListofPriest}
            >
              <input type="image" src="../src/assets/priest.png" className='image-size' />
              <h3 className='button-name'>Priest List</h3>
            </div>
          </div>
        </div>

        <div className={`second-sidebar ${secondSidebarOpen ? 'open' : 'close'}`}>
          <div className="second-sidebar-content">
            <div className='numbers'>
              <input type="image" src="../src/assets/number-1.png" className='image-size' />
              <h3 className='second-button-name'>Pending</h3>
            </div>
            <div className='numbers'>
              <input type="image" src="../src/assets/number-2.png" className='image-size' />
              <h3 className='second-button-name'>For Payment</h3>
            </div>
            <div className='numbers'>
              <input type="image" src="../src/assets/number-3.png" className='image-size' />
              <h3 className='second-button-name'>Approved</h3>
            </div>
            <div className='numbers'>
              <input type="image" src="../src/assets/number-4.png" className='image-size' />
              <h3 className='second-button-name'>Denied</h3>
            </div>
            <div className='numbers'>
              <input type="image" src="../src/assets/number-5.png" className='image-size' />
              <h3 className='second-button-name'>Mass Intentions</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

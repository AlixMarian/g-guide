import { useRef, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../churchCoordinator.css'; // Ensure this file has the necessary CSS styles

export const Sidebar = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [secondSidebarOpen, setSecondSidebarOpen] = useState(false);

  const handleAppointment = () => {
    navigate('/Appointments');
    setSecondSidebarOpen(true);
    setSecondSidebarOpen(!secondSidebarOpen);
  };

  const handleSEA = () => {
    navigate('/SEA');
  };

  const handleRequestforVolunteer = () => {
    navigate('/RequestforVolunteer');
  };

  const handleServiceOffered = () => {
    navigate('/ServiceOffered');
  };

  const handleChurchInfo = () => {
    navigate('/ChurchInfo');
  };

  const handleListofPriest = () => {
    navigate('/ListofPriest');
  };

  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar" ref={sidebarRef}>
          <div className='logo'>
            <input type="image" src="../src/assets/G-Guide LOGO.png" height="80" width="80" style={{ filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5))' }}/>
          </div>
          <div className="sidebar-content">
            <div className='appointments' onClick={handleAppointment}>
              <input type="image" src="../src/assets/appointments.png" className='image-size' />
              <h3 className='button-name'>Appointments</h3>
            </div>
            <div className='payment-history'>
              <input type="image" src="../src/assets/payment-history.png" className='image-size' />
              <h3 className='button-name'>Payment History</h3>
            </div>
            <div className='mass-schedule' onClick={handleSEA}>
              <input type="image" src="../src/assets/mass schedule.png" className='image-size' />
              <h3 className='button-name'>Mass Schedule</h3>
            </div>
            <div className='volunteer-call' onClick={handleRequestforVolunteer}>
              <input type="image" src="../src/assets/volunteer.png" className='image-size' />
              <h3 className='button-name'>Volunteer Call</h3>
            </div>
            <div className='services-offered' onClick={handleServiceOffered}>
              <input type="image" src="../src/assets/services offered.png" className='image-size' />
              <h3 className='button-name'>Services Offered</h3>
            </div>
            <div className='church-info' onClick={handleChurchInfo}>
              <input type="image" src="../src/assets/church.png" className='image-size' />
              <h3 className='button-name'>Church Info</h3>
            </div>
            <div className='priest-list' onClick={handleListofPriest}>
              <input type="image" src="../src/assets/priest.png" className='image-size' />
              <h3 className='button-name'>Priest List</h3>
            </div>
          </div>
        </div>

        <div className={`second-sidebar ${secondSidebarOpen ? 'open' : 'close'}`}>
          <div className="sidebar-content">
            <input type="image" src="../src/assets/number-1.png" className='image-size' />
            <h3 className='button-name'>Church Info</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

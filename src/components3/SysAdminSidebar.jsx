// import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../systemAdmin.css'; // Ensure this file has the necessary CSS styles

export const SysAdminSidebar = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [secondSidebarOpen, setSecondSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChild, setActiveChild] = useState(null); // Track the active child

  // Dashboard handler
  const handleAdminDashboard = () => {
    navigate('/systemAdminDashboard');
    setActiveSection('dashboard');  // Set "Dashboard" as the active section
    setSecondSidebarOpen(false);    // Close the second sidebar
    setActiveChild(null);           // Clear any active child items
  };

  // Pending Church handler
  const handlePendingChurch = () => {
    navigate('/pending-church');
    setActiveSection('pending-church');
    setSecondSidebarOpen(false); // Close second sidebar
    setActiveChild(null);        // Clear any active child items
  };

  // User Directory handler
  const handleUsers = () => {
    navigate('/userDB');
    setActiveSection('user-directory');
    setSecondSidebarOpen(false); // Close second sidebar
    setActiveChild(null);        // Clear any active child items
  };

  // Church Directory handler with second sidebar toggle
  const handleChurchDB = () => {
    if (activeSection === 'church-directory') {
      setSecondSidebarOpen(!secondSidebarOpen); // Toggle second sidebar
    } else {
      setActiveSection('church-directory'); // Keep Church Directory active
      setSecondSidebarOpen(true);           // Open second sidebar
      setActiveChild(null);                 // Reset any active child
    }
  };

  const handleRegisteredChurch = () => {
    setActiveSection('church-directory');
    setSecondSidebarOpen(true); 
    setActiveChild('registered-church');
    navigate('/churchDB');
  };

  const handleCebuChurch = () => {
    setActiveSection('church-directory');
    setSecondSidebarOpen(true); // Ensure second sidebar remains open
    setActiveChild('cebu-church-list'); // Set child as active
    navigate('/churchLocations');
  };

  return (
    <>
      <div className="admin-sidebar" ref={sidebarRef}>
        <div className='logo'>
          <input type="image" src="../src/assets/G-Guide LOGO.png" height="80" width="80" style={{ filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5))' }} />
        </div>
        <div className="admin-sidebar-content">
          <div className={`dashboard ${activeSection === 'dashboard' ? 'admin-active' : ''}`} onClick={handleAdminDashboard}>
            <input type="image" src="../src/assets/dashboard.png" className='admin-image-size' />
            <h3 className='button-name'>Dashboard</h3>
          </div>
          <div className={`pending-church ${activeSection === 'pending-church' ? 'admin-active' : ''}`} onClick={handlePendingChurch}>
            <input type="image" src="../src/assets/pending-church.png" className='admin-image-size' />
            <h3 className='button-name'>Pending Churches</h3>
          </div>
          <div className={`user-directory ${activeSection === 'user-directory' ? 'admin-active' : ''}`} onClick={handleUsers}>
            <input type="image" src="../src/assets/users.png" className='admin-image-size' />
            <h3 className='button-name'>User Directory</h3>
          </div>
          <div className={`church-directory ${activeSection === 'church-directory' ? 'admin-active' : ''}`} onClick={handleChurchDB}>
            <input type="image" src="../src/assets/church.png" className='admin-image-size' />
            <h3 className='button-name'>Church Directory</h3>
          </div>
          <div className="transaction">
            <input type="image" src="../src/assets/transactions.png" className='admin-image-size' />
            <h3 className='button-name'>Transaction</h3>
          </div>
        </div>
          
        <div className={`admin-second-sidebar ${secondSidebarOpen ? 'open' : 'close'}`}>
          <div className="admin-second-sidebar-content">
            <div className={`admin-numbers ${activeChild === 'registered-church' ? 'admin-active' : ''}`} onClick={handleRegisteredChurch}>
              <input type="image" src="../src/assets/number-1.png" className='admin-image-size' />
              <h3 className='admin-second-button-name'>Registered Church</h3>
            </div>
            <div className={`admin-numbers ${activeChild === 'cebu-church-list' ? 'admin-active' : ''}`} onClick={handleCebuChurch}>
              <input type="image" src="../src/assets/number-2.png" className='admin-image-size' />
              <h3 className='admin-second-button-name'>Cebu Church List</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SysAdminSidebar;

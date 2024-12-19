import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../systemAdmin.css'; 

export const SysAdminSidebar = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [secondSidebarOpen, setSecondSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChild, setActiveChild] = useState(null); 

 
  const handleAdminDashboard = () => {
    navigate('/systemAdminDashboard');
    setActiveSection('dashboard');  
    setSecondSidebarOpen(false);    
    setActiveChild(null);           
  };

 
  const handlePendingChurch = () => {
    navigate('/pending-church');
    setActiveSection('pending-church');
    setSecondSidebarOpen(false); 
    setActiveChild(null);        
  };

  const handleTransactions = () => {
    navigate('/transactions');
    setActiveSection('transactions');
    setSecondSidebarOpen(false); 
    setActiveChild(null);       
  };

  
  const handleUsers = () => {
    navigate('/userDB');
    setActiveSection('user-directory');
    setSecondSidebarOpen(false);
    setActiveChild(null);  
  };

  
  const handleChurchDB = () => {
    if (activeSection === 'church-directory') {
      setSecondSidebarOpen(!secondSidebarOpen); 
    } else {
      setActiveSection('church-directory'); 
      setSecondSidebarOpen(true);     
      setActiveChild(null);                
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
    setSecondSidebarOpen(true); 
    setActiveChild('cebu-church-list'); 
    navigate('/churchLocations');
  };

  const handleDeniedChurches = () => {
    setActiveSection('church-directory');
    setSecondSidebarOpen(true);
    setActiveChild('denied-churches');
    navigate('/denied-churches');
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
          <div className={`transactions ${activeSection === 'transactions' ? 'admin-active' : ''}`} onClick={handleTransactions}>
            <input type="image" src="../src/assets/transactions.png" className='admin-image-size' />
            <h3 className='button-name'>Transactions</h3>
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
            <div className={`admin-numbers ${activeChild === 'denied-churches' ? 'admin-active' : ''}`} onClick={handleDeniedChurches}>
              <input type="image" src="../src/assets/number-3.png" className='admin-image-size' />
              <h3 className='admin-second-button-name'>Denied Churches</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SysAdminSidebar;

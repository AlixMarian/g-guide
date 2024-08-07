import { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../systemAdmin.css';

export const SysAdminSidebar = () => {
  const btnRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const btn = btnRef.current;
    const sidebar = sidebarRef.current;
    const buttons = sidebar.querySelectorAll('.sidebar-button');

    btn.onclick = function() {
      sidebar.classList.toggle('active');
      sidebar.classList.toggle('collapsed');
      toggleButtonState(sidebar.classList.contains('active'));
      console.log('Sidebar status:', sidebar.classList.contains('active') ? 'active' : 'collapsed');
    };

    document.addEventListener('click', function(event) {
      if (!sidebar.contains(event.target) && !btn.contains(event.target)) {
        sidebar.classList.remove('active');
        sidebar.classList.add('collapsed');
        toggleButtonState(false);
        console.log('Sidebar Listener:', sidebar.classList.contains('active') ? 'active' : 'collapsed');
      }
    });

    function toggleButtonState(isActive) {
      buttons.forEach(button => {
        if (isActive) {
          button.classList.remove('disabled');
        } else {
          button.classList.add('disabled');
        }
      });
    }

    toggleButtonState(sidebar.classList.contains('active'));
  }, [loading]);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
        setLoading(false);
      } else {
        console.log("No user signed in.");
        navigate('/login');
        setLoading(false);
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        toast.success("Sign Out Sucessfull");
        navigate('/login');
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleAdminDashboard = () => {
    navigate('/systemAdminDashboard');
  };

  const handlePendingChurch = () => {
    navigate('/pending-church');
  };

  const handleUsers = () => {
    navigate('/userDB');
  };

  const handleChurchDB = () => {
    navigate('/churchDB');
  };

  const handleSysAccount = () => {
    navigate('/sys-account');
  };

  return (
    <>
      <div className="sidebar" ref={sidebarRef}>
        <div className="top">
          <div className="logo">
            <input type="image" src="../src/assets/logo.png" height="40" width="40" alt="logo"></input>
            <span>G! Guide</span>
          </div>
          <i className="bx bx-menu" id="btn" ref={btnRef}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
              <path fill="none" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M4 6h16M4 18h16"/>
            </svg>
          </i>
        </div>
      
        <ul>
          {/* System admin dashboard */}
          <li className='hover-button' onClick={handleAdminDashboard } style={{ cursor: 'pointer' }} >
            <Link to="/systemAdminDashboard" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
                  <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z"/>
                </svg>
              </i>
              <span className="nav-item">Dashboard</span>
              <p className='p-hover'>Dashboard</p>
            </Link>
          </li>

          {/* Pending Churches */}
          <li className='hover-button' onClick={handlePendingChurch} style={{ cursor: 'pointer' }}>
            <Link to="/pending-church" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-text-fill" viewBox="0 0 16 16">
                  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1"/>
                </svg>   
              </i>
              <span className="nav-item">Pending Church</span>
              <p className='p-hover'>Pending Church</p>
            </Link>
          </li>

          {/* list of users */}
          <li className='hover-button' onClick={handleUsers} style={{ cursor: 'pointer' }}>
            <Link to="/userDB" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill-check" viewBox="0 0 16 16">
                  <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                  <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                </svg>
              </i>
              <span className="nav-item">User Database</span>
              <p className='p-hover'>User Database</p>
            </Link>
          </li>

          {/* list of churches */}
          <li className='hover-button' onClick={handleChurchDB} style={{ cursor: 'pointer' }}>
            <Link to="/churchDB" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-card-list" viewBox="0 0 16 16">
                  <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
                  <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                </svg>
              </i>
              <span className="nav-item">Church Database</span>
              <p className='p-hover'>Church Database</p>
            </Link>
          </li>

          {/* system admin account settings */}
          <li className='hover-button' onClick={handleSysAccount} style={{ cursor: 'pointer' }}>
            <Link to="/sys-account" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-vcard-fill" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm9 1.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5M9 8a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4A.5.5 0 0 0 9 8m1 2.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5m-1 2C9 10.567 7.21 9 5 9c-2.086 0-3.8 1.398-3.984 3.181A1 1 0 0 0 2 13h6.96q.04-.245.04-.5M7 6a2 2 0 1 0-4 0 2 2 0 0 0 4 0"/>
                </svg>
              </i>
              <span className="nav-item">Account Settings</span>
              <p className='p-hover'>Account Settings</p>
            </Link>
          </li>

          {/* logout */}
          <li className='hover-button' onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <div className="logout-button sidebar-button" onClick={handleLogout}>
              <Link to="/">
                <i className="bx bxs-grid-alt">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                    <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                  </svg>
                </i>
                <span className="nav-item">Log-out</span>
                <p className='p-hover'>Log-out</p>
              </Link>
            </div>
          </li>

        </ul>
      </div>
    </>
  );
};

export default SysAdminSidebar;

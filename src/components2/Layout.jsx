import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { getUserDetails } from '../components2/Services/userServices';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase"; // Adjust the import path as necessary
import { toast } from 'react-toastify';
import '../churchCoordinator.css';

export const Layout = () => {
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0); // State for pending appointments count
  const btnRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserDetails(user.uid).then(details => {
          if (details) {
            setUserDetails(details);
          }
          setLoading(false);
        });
      } else {
        setUserDetails({});
        setLoading(false);
        console.log('No user is logged in');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
    const fetchPendingAppointmentsCount = async () => {
      const pendingQuery = query(collection(db, "appointments"), where("appointmentStatus", "==", "Pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      setPendingCount(pendingSnapshot.size); // Set the count of pending appointments
    };

    fetchPendingAppointmentsCount();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        toast.success("Sign Out Successful");
        navigate('/login');
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleSEA = () => {
    navigate('/SEA');
  };

  const handleAppointment = () => {
    navigate('/Appointments');
  };

  const handleChurchInfo = () => {
    navigate('/ChurchInfo');
  };

  const handleListofPriest = () => {
    navigate('/ListofPriest');
  };

  const handleServiceOffered = () => {
    navigate('/ServiceOffered');
  };

  const handleRequestforVolunteer = () => {
    navigate('/RequestforVolunteer');
  };

  const handleAccountSettings = () => {
    navigate('/AccountSettings');
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
        <div className="user">
          <img src={userDetails.profileImage || ''} alt={userDetails.firstName || 'User'} className="user-img"/>
          <div>
            <p className="bold">{userDetails.firstName} {userDetails.lastName}</p>
            <p>Church Coordinator</p>
          </div>
        </div>
        <ul>
          <li className='hover-button' onClick={handleSEA} style={{ cursor: 'pointer' }}>
            <Link to="/SEA" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                  <g fill="none">
                    <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
                    <path fill="black" d="M16 3a1 1 0 0 1 1 1v1h2a2 2 0 0 1 1.995 1.85L21 7v12a2 2 0 0 1-1.85 1.995L19 21H5a2 2 0 0 1-1.995-1.85L3 19V7a2 2 0 0 1 1.85-1.995L5 5h2V4a1 1 0 0 1 2 0v1h6V4a1 1 0 0 1 1-1m-1.176 6.379l-4.242 4.242l-1.415-1.414a1 1 0 0 0-1.414 1.414l2.114 2.115a1.01 1.01 0 0 0 1.429 0l4.942-4.943a1 1 0 1 0-1.414-1.414"/>
                  </g>
                </svg>
              </i>
              <span className="nav-item">Schedule</span>
              <p className='p-hover'>Schedule</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleAppointment} style={{ cursor: 'pointer' }}>
            <Link to="/Appointments" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48">
                  <defs>
                    <mask id="ipSAppointment0">
                      <g fill="none" strokeWidth="4">
                        <circle cx="24" cy="11" r="7" fill="#fff" stroke="#fff" strokeLinecap="round" strokeLinejoin="round"/>
                        <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M4 41c0-8.837 8.059-16 18-16"/>
                        <circle cx="34" cy="34" r="9" fill="#fff" stroke="#fff"/>
                        <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M33 31v4h4"/>
                      </g>
                    </mask>
                  </defs>
                  <path fill="black" d="M0 0h48v48H0z" mask="url(#ipSAppointment0)"/>
                </svg>
                  <span class="badge text-bg-danger">{pendingCount}</span>
              </i>
              <span className="nav-item">Appointments</span>
              <p className='p-hover'>Appointments</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleChurchInfo} style={{ cursor: 'pointer' }}>
            <Link to="/ChurchInfo" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                  <path fill="black" d="M2 22v-8l4-1.775V9l5-2.5V5H9V3h2V1h2v2h2v2h-2v1.5L18 9v3.225L22 14v8h-8v-3q0-.825-.587-1.412T12 17t-1.412.588T10 19v3zm10-8.5q.625 0 1.063-.437T13.5 12t-.437-1.062T12 10.5t-1.062.438T10.5 12t.438 1.063T12 13.5"/>
                </svg>
              </i>
              <span className="nav-item">Church Information</span>
              <p className='p-hover'>Church Information</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleListofPriest} style={{ cursor: 'pointer' }}>
            <Link to="/ListofPriest" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 256">
                  <path fill="black" d="M128 83.22a54 54 0 0 0-8-10.06V40h-16a8 8 0 0 1 0-16h16V8a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16h-16v33.16a54 54 0 0 0-8 10.06M180 56c-17.74 0-33.21 6.48-44 17.16V176a8 8 0 0 1-16 0V73.16C109.21 62.48 93.74 56 76 56a60.07 60.07 0 0 0-60 60c0 29.86 14.54 48.85 26.73 59.52A90.5 90.5 0 0 0 64 189.34V208a16 16 0 0 0 16 16h96a16 16 0 0 0 16-16v-18.66a90.5 90.5 0 0 0 21.27-13.82C225.46 164.85 240 145.86 240 116a60.07 60.07 0 0 0-60-60"/>
                </svg>
              </i>
              <span className="nav-item">List of Priest</span>
              <p className='p-hover'>List of Priest</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleServiceOffered} style={{ cursor: 'pointer' }}>
            <Link to="/ServiceOffered" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 24 24">
                  <path fill="black" d="M14.121 10.48a1 1 0 0 0-1.414 0l-.707.706a2 2 0 0 1-2.828-2.828l5.63-5.632a6.5 6.5 0 0 1 6.377 10.568l-2.108 2.135zM3.161 4.468a6.5 6.5 0 0 1 8.009-.938L7.757 6.944a4 4 0 0 0 5.513 5.794l.144-.137l4.243 4.242l-4.243 4.243a2 2 0 0 1-2.828 0L3.16 13.66a6.5 6.5 0 0 1 0-9.192"/>
                </svg>
              </i>
              <span className="nav-item">Services Offered</span>
              <p className='p-hover'>Services Offered</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleRequestforVolunteer} style={{ cursor: 'pointer' }}>
            <Link to="/RequestforVolunteer" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 24 24">
                  <path fill="black" d="M20 17q.86 0 1.45.6t.58 1.4L14 22l-7-2v-9h1.95l7.27 2.69q.78.31.78 1.12q0 .47-.34.82t-.86.37H13l-1.75-.67l-.33.94L13 17zM16 3.23Q17.06 2 18.7 2q1.36 0 2.3 1t1 2.3q0 1.03-1 2.46t-1.97 2.39T16 13q-2.08-1.89-3.06-2.85t-1.97-2.39T10 5.3q0-1.36.97-2.3t2.34-1q1.6 0 2.69 1.23M.984 11H5v11H.984z"/>
                </svg>
              </i>
              <span className="nav-item">Request Volunteers</span>
              <p className='p-hover'>Request Volunteers</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleAccountSettings} style={{ cursor: 'pointer' }}>
            <Link to="/AccountSettings" className="sidebar-button">
              <i className="bx bxs-grid-alt">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 24 24">
                  <path fill="black" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/>
                </svg>
              </i>
              <span className="nav-item">Account Settings</span>
              <p className='p-hover'>Account Settings</p>
            </Link>
          </li>
          <li className='hover-button' onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <Link to="/" className="logout-button sidebar-button">
                <i className="bx bxs-grid-alt">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                    <g fill="none" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <path d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2"/>
                      <path d="M15 12H3l3-3m0 6l-3-3"/>
                    </g>
                  </svg>
                </i>
                <span className="nav-item">Log-out</span>
                <p className='p-hover'>Log-out</p>
              </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Layout;

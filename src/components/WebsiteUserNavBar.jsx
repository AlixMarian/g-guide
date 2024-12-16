import { useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';
import logo from '../assets/gGuideLogo.svg';

const WebsiteUserNavBar = () => {
  const navigate = useNavigate();
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const handleUserAccSttngs = () => {
    navigate('/user-accSettings');
  };

  const handleWebUserInbox = () => {
    navigate('/webUser-inbox');
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in.");
        navigate('/login');
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        
        const inboxQuery = query(
          collection(db, 'inboxMessage'),
          where('userId', '==', user.uid),
          where('status', '==', 'new') 
        );

        const unsubscribeSnapshot = onSnapshot(inboxQuery, (snapshot) => {
          setHasNewMessages(!snapshot.empty); 
        });

        return () => {
          unsubscribeSnapshot();
        };
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigate]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <a className="navbar-brand" href="/homepage">
          <img src={logo} alt="Logo" width="40" height="34" className="d-inline-block align-text-top" />
          G! Guide
        </a>
        


        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className='nav-item'>
            <a className="nav-link active" aria-current="page" href="/map">Church Finder</a>
            </li>
            <li className='nav-item'>
            <a className="nav-link active" aria-current="page" href="/church-options">Partnered Church List</a>
            </li>
          </ul>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button type="button" className="btn btn-outline-secondary position-relative" onClick={handleWebUserInbox}>
              <i className="bi bi-inbox-fill"></i> My Inbox
              {hasNewMessages && (
                <span
                  className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"
                  style={{ width: '10px', height: '10px' }}
                ></span>
              )}
            </button>
            <button type="button" className="btn btn-custom-outline" onClick={handleUserAccSttngs}>Account Settings</button>
            <button type="button" className="btn btn-custom-primary" onClick={handleLogout}>Logout</button>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default WebsiteUserNavBar;

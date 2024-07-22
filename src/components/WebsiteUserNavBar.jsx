import { useNavigate} from 'react-router-dom';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import logo from '../assets/gGuideLogo.svg';

const WebsiteUserNavBar = () => {
  const navigate = useNavigate();

  const handleUserAccSttngs = () => {
    navigate('/account-settings');
  };

  const handleHomepage = () => {
    navigate('/homepage');
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

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" onClick={handleHomepage}>
          <img src={logo} alt="Logo" width="40" height="34" className="d-inline-block align-text-top" />
          G!Guide
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <div className="d-grid gap-2 d-md-flex">
            <button type="button" className="btn btn-primary" onClick={handleUserAccSttngs}>Account Settings</button>
            <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default WebsiteUserNavBar;

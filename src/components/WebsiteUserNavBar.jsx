import { useNavigate } from 'react-router-dom';
import logo from '../assets/gGuideLogo.svg';

const WebsiteUserNavBar = () => {
  const navigate = useNavigate();

  const handleUserAccSttngs = () => {
    navigate('/account-settings');
  };

  const handleHomepage = () => {
    navigate('/homepage');
  };

  const handleLogout = () => {
    navigate('/login');
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

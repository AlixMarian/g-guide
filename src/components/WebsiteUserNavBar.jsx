import { useNavigate } from 'react-router-dom';

export const WebUserNavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  

  return (
    <nav className="homePageNavbar navbar navbar-expand-lg sticky-top bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src="../src/assets/gGuideLogo.svg" alt="Logo" width="40" height="34" className="d-inline-block align-text-top" />
          G!Guide
        </a>
        
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button type="button" className="btn btn-primary">Account Settings</button>
          <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
        
      </div>
    </nav>
  );
}

export default WebUserNavBar;

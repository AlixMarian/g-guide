import { Link } from 'react-router-dom';
import '../websiteUser.css';

export const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/home">
          <img src="../src/assets/G-Guide LOGO.png" alt="Logo" width="40" height="40" className="d-inline-block align-text-top" style={{marginTop: '-0.3rem'}}/>
          G! Guide
        </a>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/home">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/map">Church Finder</a>
            </li>
          </ul>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/login" className="btn btn-custom-outline">Sign In</Link>
            <Link to="/signup" className="btn btn-custom-primary">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';

export const SignUp = () => {
  const navigate = useNavigate();
  
  const handleBackToHomepage = () => {
    navigate('/homepage');
  };

  const handleSignUpAsCoord = (event) => {
    event.preventDefault();
    navigate('/signup-coord');
  };

  return (
    <div className="signup-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="siteBanner" className="text-center">
              <img src="../src/assets/Left Side Designs.png" className="img-fluid" alt="Site Banner" />
            </div>
          </div>

          <div className="col-lg-6">
            <form className="row g-3">

              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input type="text" className="form-control" id="lastName"/>
              </div>

              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input type="text" className="form-control" id="firstName"/>
              </div>

              <div className="col-md-6">
                <label htmlFor="contactNum" className="form-label">Contact Number</label>
                <input type="text" className="form-control" id="contactNum"/>
              </div>

              <div className="col-md-6">
                <label htmlFor="emailAddress" className="form-label">Email Address</label>
                <input type="email" className="form-control" id="emailAddress"/>
              </div>

              <div className="col-md-6">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password"/>
              </div>

              <div className="col-md-6">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" id="confirmPassword"/>
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="dataConsent"/>
                  <label className="form-check-label" htmlFor="dataConsent">
                    Data Consent
                  </label>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-center gap-2">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary" onClick={handleBackToHomepage}>Sign Up</button>
              </div>

              <div className="col-12 d-flex justify-content-center mt-3">
                <button type="button" className="btn btn-primary" onClick={handleSignUpAsCoord}>Sign Up As Church Coordinator</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
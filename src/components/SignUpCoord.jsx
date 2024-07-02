import { useNavigate } from 'react-router-dom';
import '../custom.css';

export const SignUpCoord = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/homepage');
  };

  return (
    <div className="signup-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="siteBanner" className="text-center">
              <img src="../src/assets/signUpCoordBanner.png" className="img-fluid" alt="Site Banner" />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="accountHandler">
              <h3>Account Handler</h3>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                  <label htmlFor="inputFullName" className="form-label">Full Name</label>
                  <input type="text" className="form-control" id="inputFullName" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputContactNum" className="form-label">Contact Number</label>
                  <input type="text" className="form-control" id="inputContactNum" />
                </div>

                <div className="col-12">
                  <label htmlFor="inputEmailAddress" className="form-label">Email Address</label>
                  <input type="email" className="form-control" id="inputEmailAddress" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputPassword" className="form-label">Password</label>
                  <input type="password" className="form-control" id="inputPassword" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputConfirmPass" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="inputConfirmPass" />
                </div>

                <div className="churchInformation">
                    <br></br>
                    <h3>Church Information</h3>

                <form className="row g-3">
                <div className="col-12">
                  <label htmlFor="inputChurchName" className="form-label">Church Name</label>
                  <input type="email" className="form-control" id="inputChurchName" />
                </div>

                <div className="col-12">
                  <label htmlFor="inputChurchAdd" className="form-label">Church Address</label>
                  <input type="email" className="form-control" id="inputChurchAdd" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputChurchEmail" className="form-label">Church Email Address</label>
                  <input type="text" className="form-control" id="inputChurchEmail" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputChurchContactNum" className="form-label">Church Contact Number</label>
                  <input type="text" className="form-control" id="inputChurchContactNum" />
                </div>
                </form>
                
                </div>

            <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gridCheck" />
                    <label className="form-check-label" htmlFor="gridCheck">
                      Data Consent
                    </label>
                  </div>
                </div>
            <div className="col-12 d-flex justify-content-center gap-2">
              <button type="reset" className="btn btn-outline-primary">Clear Form</button>
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>

              </form>
            </div>

            

          </div>
        </div>
      </div>
    </div>
  );
};

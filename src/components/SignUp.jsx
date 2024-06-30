import '../custom.css';

export const SignUp = () => {
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

              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="gridCheck" />
                  <label className="form-check-label" htmlFor="gridCheck">
                    Data Consent
                  </label>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-center gap-5">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary">Sign Up</button>
              </div>

              <div className="col-12 d-flex justify-content-center mt-3">
                <button type="submit" className="btn btn-primary">Sign Up As Church Coordinator</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

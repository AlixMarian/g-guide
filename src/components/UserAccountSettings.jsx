import '../websiteUser.css';

export const UserAccountSettings = () => {
  return (
    <div className="userAccStngs">
      <div className="userAccStngs-content">
        <div className="text-start">
          <h3>Modify Account Settings</h3>
        </div>
        <div className="row justify-content-center">

          <div className="col-lg-6 text-center mb-4">
            <img src="src/assets/userIcon.png" className="img-thumbnail" alt="User Icon" />
            <div className="mb-3 row">
              <label htmlFor="inputImg" className="col-sm-3  col-form-label">Image URL:</label>
              <div className="col-sm-8">
                <input type="text" className="form-control" id="inputImg"/>
              </div>
            </div>
            <button type="button" className="btn btn-primary mt-2">Upload Photo</button>
          </div>
          
          <div className="col-12 col-lg-6">
            <form className="row g-3">
              <div className="col-md-6">
                <label htmlFor="inputLastName" className="form-label">Last Name</label>
                <input type="text" className="form-control" id="inputLastName" />
              </div>
              <div className="col-md-6">
                <label htmlFor="inputFirstName" className="form-label">First Name</label>
                <input type="text" className="form-control" id="inputFirstName" />
              </div>
              <div className="col-md-6">
                <label htmlFor="inputContactNum" className="form-label">Contact Number</label>
                <input type="text" className="form-control" id="inputContactNum" />
              </div>
              <div className="col-md-6">
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
              <div className="col-12 d-flex justify-content-between">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAccountSettings;
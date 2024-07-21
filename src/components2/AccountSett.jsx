import '../churchCoordinator.css';

export const AccountSettings = () => {
    return (
        <>
        <h1>Account Settings</h1>

        <h2>John Doe</h2>
       <div>
       <form className="row g-3">
    <div className="form-floating mb-3 col-md-6">
        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"/>
        <label htmlFor="floatingInput">Email address</label>
    </div>
    <div className="form-floating col-md-6">
        <input type="password" className="form-control" id="floatingPassword" placeholder="Password"/>
        <label htmlFor="floatingPassword">Password</label>
    </div>
    <div className="form-floating mb-3 col-md-6">
        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"/>
        <label htmlFor="floatingInput">Full Name</label>
    </div>
    <div className="form-floating mb-3 col-md-6">
        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"/>
        <label htmlFor="floatingInput">Username</label>
    </div>
    <div className="form-floating mb-3 col-md-6">
        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"/>
        <label htmlFor="floatingInput">Contact Number</label>
    </div>

  <div className="input-group mb-3">
    <input type="file" className="form-control" id="inputGroupFile02"/>
    <label className="input-group-text" htmlFor="inputGroupFile02">Upload</label>
    </div>
  <div>
    <button type="button" className="btn btn-danger col-md-2">Clear fields</button>
    <button type="button" className="btn btn-success col-md-2">Confirm Changes</button>
  </div>

  
</form>

       </div>
        </>

        
    );  
  };
  export default AccountSettings;
import '../churchCoordinator.css';
export const Church = () => {
  return (
      <>
      <h1>Church Information</h1>
      <div className="announcementsCH">
      <h3>John Doe</h3>
    <label htmlFor="exampleFormControlTextarea1" className="form-label">Church History<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="black" d="M7.243 17.997H3v-4.243L14.435 2.319a1 1 0 0 1 1.414 0l2.829 2.828a1 1 0 0 1 0 1.415zm-4.243 2h18v2H3z"/></svg></label>
      <div className="mb-3">
        <textarea className="form-control" id="exampleFormControlTextarea1" rows="5"></textarea>
      </div>
    <br></br>
  </div>

  <div className="editchurch">  
  <form className="row g-3">
  <div className="col-md-6">
    <label htmlFor="inputEmail4" className="form-label">Church Name</label>
    <input type="email" className="form-control" id="inputEmail4"/>
  </div>
  <div className="col-md-6">
    <label htmlFor="inputEmail4" className="form-label">Church Address</label>
    <input type="email" className="form-control" id="inputEmail4"/>
  </div>
  <div className="col-6">
    <label htmlFor="inputAddress" className="form-label">Church Email</label>
    <input type="text" className="form-control" id="inputAddress" placeholder="1234 Main St"/>
  </div>
  <div className="col-6">
    <label htmlFor="inputAddress2" className="form-label">Contact Details</label>
    <input type="text" className="form-control" id="inputAddress2" placeholder="Apartment, studio, or floor"/>
  </div>
  <div className="col-md-6">
    <label htmlFor="inputCity" className="form-label">Working Hours</label>
    <input type="text" className="form-control" id="inputCity"/>
  </div>
  </form>
    <br></br>
  <form className="row g-3">
    <div className="col-6">
      <label htmlFor="formFileMultiple" className="form-label">Multiple files input example</label>
      <input className="form-control" type="file" id="formFileMultiple" multiple/>
    </div>

    <div className="col-6">
      <label htmlFor="formFileMultiple" className="form-label">Multiple files input example</label>
      <input className="form-control" type="file" id="formFileMultiple" multiple/>
    </div>

    <div className="col-6">
      <label htmlFor="formFileMultiple" className="form-label">Multiple files input example</label>
      <input className="form-control" type="file" id="formFileMultiple" multiple/>
    </div>

    <div className="col-6">
      <label htmlFor="formFileMultiple" className="form-label">Multiple files input example</label>
      <input className="form-control" type="file" id="formFileMultiple" multiple/>
    </div>
  
    <div className="announcement-bttn">
      <button type="button" className="btn btn-success">Confirm Change</button>
      <button type="button" className="btn btn-danger">Clear</button>
    </div>
</form>
  </div>
      </>
  );
};

export default Church;

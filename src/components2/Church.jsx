export const Church = () => {
  return (
      <>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <h1>Church Information</h1>
      <div className="announcementsCH">
      <h3>John Doe</h3>
    <label for="exampleFormControlTextarea1" className="form-label">Church History<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="black" d="M7.243 17.997H3v-4.243L14.435 2.319a1 1 0 0 1 1.414 0l2.829 2.828a1 1 0 0 1 0 1.415zm-4.243 2h18v2H3z"/></svg></label>
      <div className="mb-3">
        <textarea className="form-control" id="exampleFormControlTextarea1" rows="5"></textarea>
      </div>
    <br></br>
  </div>

  <div className="editchurch">  
  <form class="row g-3">
  <div class="col-md-6">
    <label for="inputEmail4" class="form-label">Church Name</label>
    <input type="email" class="form-control" id="inputEmail4"/>
  </div>
  <div class="col-md-6">
    <label for="inputEmail4" class="form-label">Church Address</label>
    <input type="email" class="form-control" id="inputEmail4"/>
  </div>
  <div class="col-6">
    <label for="inputAddress" class="form-label">Church Email</label>
    <input type="text" class="form-control" id="inputAddress" placeholder="1234 Main St"/>
  </div>
  <div class="col-6">
    <label for="inputAddress2" class="form-label">Contact Details</label>
    <input type="text" class="form-control" id="inputAddress2" placeholder="Apartment, studio, or floor"/>
  </div>
  <div class="col-md-6">
    <label for="inputCity" class="form-label">Working Hours</label>
    <input type="text" class="form-control" id="inputCity"/>
  </div>
  </form>
    <br></br>
  <form class="row g-3">
    <div class="col-6">
      <label for="formFileMultiple" class="form-label">Multiple files input example</label>
      <input class="form-control" type="file" id="formFileMultiple" multiple/>
    </div>

    <div class="col-6">
      <label for="formFileMultiple" class="form-label">Multiple files input example</label>
      <input class="form-control" type="file" id="formFileMultiple" multiple/>
    </div>

    <div class="col-6">
      <label for="formFileMultiple" class="form-label">Multiple files input example</label>
      <input class="form-control" type="file" id="formFileMultiple" multiple/>
    </div>

    <div class="col-6">
      <label for="formFileMultiple" class="form-label">Multiple files input example</label>
      <input class="form-control" type="file" id="formFileMultiple" multiple/>
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


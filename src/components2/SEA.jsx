export const SEA = () => {


    return (
        <>
<body>
    <h1> Mass Schedule</h1>

    <table className="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
      <th scope="col">Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td colspan="2">Larry the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</table>

<form>

<div className="massInfo">
  <form className="row g-3">
  <div className="col-md-6">
    <label for="inputEmail4" className="form-label">Date</label>
    <select className="form-select" id="specificSizeSelect">
      <option selected></option>
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
      <option value="6">Saturday</option>
      <option value="7">Sunday</option>
    </select>
  </div>

  <div className="col-md-6">
    <label for="inputPassword4" className="form-label">Type</label>
    <select className="form-select" id="specificSizeSelect">
      <option selected></option>
      <option value="1">Concelebrated</option>
      <option value="2">Normal Mass</option>
    </select>
  </div>
  </form>

  
    <form className="row g-3">
      <div className="col-sm-5">
        <label for="inputEmail4" className="form-label">Time</label>
        <input type="email" className="form-control" id="inputEmail4"/>
      </div>

      <div className="col-sm-1">
      <label for="inputEmail4" className="form-label" >Time</label>
        <select className="form-select" id="inlineFormSelectPref">
          <option selected></option>
          <option value="1">Am</option>
          <option value="2">Pm</option>
        </select>

      </div>

      <div className="col-md-6">
          <label for="inputEmail4" className="form-label">Language</label>
          <select className="form-select" id="specificSizeSelect">
          <option selected></option>
          <option value="1">Cebuano</option>
          <option value="2">English</option>
      </select>
      </div>

     </form>


    <form className="row g-3">
      <div className="col-md-6">
        <label for="inputEmail4" className="form-label">Presiding Priest</label>
          <select className="form-select" id="specificSizeSelect">
            <option selected></option>
            <option value="1">Fr.One</option>
            <option value="2">Fr.Two</option>
            <option value="3">Fr.Three</option>
          </select>
      </div>

      <div className="col-md-6">
      <label for="inputPassword4" className="form-label">Am or Pm</label>
          <div className="col-6">
              <button type="button" className="btn btn-success">Confirm Change</button>
              <button type="button" className="btn btn-danger">Clear</button>
          </div>
        </div>
    </form>
</div>

<h1>Events</h1>
  <div className="events">
      <form className="row g-3">
      <div className="col-6">
        <label for="inputEmail4" className="form-label">Date</label>
        <input type="email" className="form-control" id="inputEmail4"/>
      </div>
      <div className="col-md-6">
        <label for="inputEmail4" className="form-label">Type</label>
        <input type="email" className="form-control" id="inputEmail4"/>
      </div>
      </form>

      <form className="row g-3">
      <div className="col-5">
        <label for="inputEmail4" className="form-label">Time</label>
        <input type="email" className="form-control" id="inputEmail4"/>
      </div>
      <div className="col-md-1">
        <label for="inputEmail4" className="form-label">Am or Pm</label>
        <input type="email" className="form-control" id="inputEmail4"/>
      </div>

      <div className="col-md-6">
      <label for="inputEmail4" className="form-label">Am or Pm</label>
          <div className="col-12">
              <button type="button" className="btn btn-success">Confirm Change</button>
              <button type="button" className="btn btn-danger">Clear</button>
          </div>

       
        </div>
      </form>
  </div>
   
<h1>Annoucements</h1>
  <div className="announcementsSEA">
    <label for="exampleFormControlTextarea1" className="form-label">Announcements</label>
      <div className="mb-3">
        <textarea className="form-control" id="exampleFormControlTextarea1" rows="5"></textarea>
      </div>
    <br></br>
    <div className="announcement-bttn">
      <button type="button" className="btn btn-success">Confirm Change</button>
      <button type="button" className="btn btn-danger">Clear</button>
    </div>
  </div>
</form>
</body>
</>
    );
  };
  
import '../churchCoordinator.css';

export const SEA = () => {
  return (
    <>
      <h1>Mass Schedule</h1>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Time</th>
            <th scope="col">Type</th>
            <th scope="col">Language</th>
            <th scope="col">Presiding Priest</th>
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
            <td>Larry the Bird</td>
            <td colSpan="2">@twitter</td>
          </tr>
        </tbody>
      </table>

      <div className="massInfo">
        <form className="row g-3">
          <div className="col-md-6">
            <label htmlFor="dateSelect" className="form-label">Date</label>
            <select className="form-select" id="dateSelect">
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
            <label htmlFor="typeSelect" className="form-label">Type</label>
            <select className="form-select" id="typeSelect">
              <option selected></option>
              <option value="1">Concelebrated</option>
              <option value="2">Normal Mass</option>
            </select>
          </div>
        </form>
        <form className="row g-3">
          <div className="col-sm-5">
            <label htmlFor="timeInput" className="form-label">Time</label>
            <input type="text" className="form-control" id="timeInput"/>
          </div>
          <div className="col-sm-1">
            <label htmlFor="amPmSelect" className="form-label">AM/PM</label>
            <select className="form-select" id="amPmSelect">
              {/* <option selected></option> */}
              <option value="1">Am</option>
              <option value="2">Pm</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="languageSelect" className="form-label">Language</label>
            <select className="form-select" id="languageSelect">
              <option selected></option>
              <option value="1">Cebuano</option>
              <option value="2">English</option>
            </select>
          </div>
        </form>
        <form className="row g-3">
          <div className="col-md-6">
            <label htmlFor="priestSelect" className="form-label">Presiding Priest</label>
            <select className="form-select" id="priestSelect">
              <option selected></option>
              <option value="1">Fr.One</option>
              <option value="2">Fr.Two</option>
              <option value="3">Fr.Three</option>
            </select>
          </div>
          <div id='buttons' className="col-md-6">
            {/* <label htmlFor="confirmButtons" className="form-label">Confirm</label> */}
            <div className="btn-group" role="group" id="confirmButtons">
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
            <label htmlFor="eventDate" className="form-label">Date</label>
            <input type="text" className="form-control" id="eventDate"/>
          </div>
          <div className="col-md-6">
            <label htmlFor="eventType" className="form-label">Type</label>
            <input type="text" className="form-control" id="eventType"/>
          </div>
        </form>
        <form className="row g-3">
          <div className="col-5">
            <label htmlFor="eventTime" className="form-label">Time</label>
            <input type="text" className="form-control" id="eventTime"/>
          </div>
          <div className="col-md-1">
            <label htmlFor="eventAmPm" className="form-label">AM/PM</label>
            <select  id="amPmSelect" className="form-select">
              {/* <option selected></option> */}
              <option value="1">Am</option>
              <option value="2">Pm</option>
            </select>
          </div>
          <br></br>
          <div id='buttons' className="col-md-6">
            {/* <label htmlFor="confirmButtonsEvent" className="form-label">Confirm</label> */}
            <div className="btn-group" role="group" id="confirmButtonsEvent">
              <button type="button" className="btn btn-success">Confirm Change</button>
              <button type="button" className="btn btn-danger">Clear</button>
            </div>
          </div>
        </form>
      </div>

      <h1>Announcements</h1>
      <div className="announcementsSEA">
        <label htmlFor="announcementTextarea" className="form-label">Announcements</label>
        <div className="mb-3">
          <textarea className="form-control" id="announcementTextarea" rows="5"></textarea>
        </div>
        <div className="btn-group">
          <button type="button" className="btn btn-success">Confirm Change</button>
          <button type="button" className="btn btn-danger">Clear</button>
        </div>
      </div>
    </>
  );
};

export default SEA;

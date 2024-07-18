export const ReqVol = () => {
    return (
        <>

        <h1>Request for Volunteers</h1>
        <div className="ReqAnnoucement">
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
        </>

        
    );  
  };
  export default ReqVol;
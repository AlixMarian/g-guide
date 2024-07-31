import  { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const ChurchHomepageBook = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <div>
      <h2>Book an Appointment</h2>
      <h2>ako ra gi layout daan</h2>

      <div className='selectAppointment'>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">1. Select an appointment</h5>
            <p>diri mu pili if mag event ba like burial or igo ra request document</p>
          </div>
        </div>
        <br />
      </div>

      <div className='selectSlots row justify-content-center'>
        <div className="card grid">
          <div className="card-body grid">
            <h5 className="card-title">2. Select schedule</h5>
            <p>Mu appear rani if ang gi select sa user kay mu appointment siyag event like bunyag, etc..</p>
            <div className='row'>
              <div className='calendar col-lg-4 col-md-6 me-5'>
                <DatePicker
                  inline
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="MMMM d, yyyy"
                />
              </div>

              <div className='slots col-lg-4 col-md-6'>
                <p>Slot available</p>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                  <label className="form-check-label" htmlFor="flexRadioDefault1">sampleTime</label>
                  <br/>
                  <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"/>
                  <label className="form-check-label" htmlFor="flexRadioDefault2">sampleTime number 2</label>
                </div>
              </div>
            </div>
            <div className="buttonAreas col-md-12 d-grid gap-2 d-md-block">
                <button type="submit" className="btn btn-success me-2">Select schedule</button>
                <button type="reset" className="btn btn-danger me-2">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <br/>

      <div className='submit-requirements'>
        <div className='card'>
          <div className='card-body'>
            <h5>3. Submit requirements</h5>
            <p>himo-an pag files per service offered kay lahi lahi type requirement i pass</p>
          </div>
        </div>
      </div>

      <br/>
      <div className='payment'>
        <div className='card'>
          <div className='card-body'>
            <h5>4. Submit Payment</h5>
            <p>diri i display ang qr code sa church nga gi require pag register</p>
          </div>
        </div>
      </div>

      <br/>
      <div className='finalize'>
        <div className='card'>
          <div className='card-body'>
            <h5>5. Finalize details</h5>
            <p>mga input fields rani diri nga read only. diri mu reflect mga choices gi make sa user</p>
            <div className="buttonAreas col-md-12 d-grid gap-2 d-md-block">
                <button type="submit" className="btn btn-success me-2">Select schedule</button>
                <button type="reset" className="btn btn-danger me-2">Clear</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChurchHomepageBook;
import { useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'

export const Appointments = () => 
    {
    const [selectedDate, setSelectedDate] = useState(null);
        return (
        <>
        <div className="appoinmentsPage"></div>
        <h1>Appointments</h1>

        <div className="appointmentDate">
                <label htmlFor="dateSelect" className="form-label"></label>
                    <DatePicker selected={selectedDate} onChange={date=>setSelectedDate(date)}
                     showYearDropdown
                />
        </div>

        <div className="appointmentsView">
                <div className="pendingAppointments">
                    <h1>Pending Appointments</h1>
                        <div className="appointmentInfo">
                            <div className="appointmentInfo2">
                                <p>Time:</p>
                                <p>Purpose:</p>
                                <p>Requested by:</p>
                            </div>
                            <div className="appointmentInfobtn">
                                <button type="button" class="btn btn-success">Success</button>
                                <button type="button" class="btn btn-danger">Danger</button>
                                <button type="button" class="btn btn-info">Info</button>
                            </div>
                        </div>
                        <div className="appointmentInfo">
                            <div>
                                <p>Time:</p>
                                <p>Purpose:</p>
                                <p>Requested by:</p>
                            </div>
                            <div>
                                <button type="button" class="btn btn-success">Success</button>
                                <button type="button" class="btn btn-danger">Danger</button>
                                <button type="button" class="btn btn-info">Info</button>
                            </div>
                        </div>
                        <div className="appointmentInfo">
                            <div>
                                <p>Time:</p>
                                <p>Purpose:</p>
                                <p>Requested by:</p>
                            </div>
                            <div>
                                <button type="button" class="btn btn-success">Success</button>
                                <button type="button" class="btn btn-danger">Danger</button>
                                <button type="button" class="btn btn-info">Info</button>
                            </div>
                        </div>
                </div>

                <div className="confirmedAppointments">
                    <h1>Confirmed Appointments</h1>
                    <div className="appointmentInfo">
                            Time
                            Name
                            <button type="button" class="btn btn-danger">Danger</button>
                        </div>
                        <div className="appointmentInfo">
                            Time
                            Name
                            <button type="button" class="btn btn-danger">Danger</button>
                        </div>
                        <div className="appointmentInfo">
                            Time
                            Name
                            <button type="button" class="btn btn-danger">Danger</button>
                        </div>
                </div>
        
        </div>

        </>
    );
  };
  
  export default Appointments
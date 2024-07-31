import React, { useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import '../churchCoordinator.css';

export const Appointments = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [smsContent, setSmsContent] = useState('');

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleSendSms = () => {
        console.log(smsContent);
        // Handle the SMS sending logic here
        handleCloseModal();
    };

    const pendingAppointments = [1]; 
    const confirmedAppointments = [1];

    const formatDate = (date) => {
        if (!date) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <>
            <div className="appoinmentsPage"></div>
            <h1>Appointments</h1>
                <label htmlFor="dateSelect" className="form-label">
                    Select a date: 
                    <DatePicker 
                        selected={selectedDate} 
                        onChange={date => setSelectedDate(date)}
                        showYearDropdown
                    />
                </label>
                <div className="btn-group">
                    <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        Filter
                    </button>
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#">Date</a></li>
                        <li><a className="dropdown-item" href="#">Purpose</a></li>
                    </ul>
                </div>


            <div className="appointmentsView">
                <div className="slots">
                   <h1>{selectedDate ? ` ${formatDate(selectedDate)}` : 'No date selected'}</h1> 
                </div>                
                <div className="pendingAppointments">
                    <h1>Pending Appointments</h1>
                    <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                            <th scope="col">Period</th>
                            <th scope="col">Purpose</th>
                            <th scope="col">Requested by:</th>
                        </tr>
                    </thead>
                    <tbody> 
                    {pendingAppointments.map((appointment, index) => (
                        <tr>
                            <td>
                                11/22/21
                                {/*massSchedules.massDate*/}
                            </td>
                            <td>
                                1:00
                                {/*massSchedules.massDate*/}
                            </td>
                            <td>
                                Pm
                                {/*massSchedules.massDate*/}
                            </td>
                            <td>
                                Burial
                                {/*massSchedules.massDate*/}
                            </td>
                            <td>
                                Navia Caspar
                                {/*massSchedules.massDate*/}
                            </td>
                        </tr>
                    ))}

                    </tbody>
                    </table>
                </div>

                <div className="confirmedAppointments">
                    <h1>Completed Appointments</h1>
                    <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                            <th scope="col">Purpose</th>
                            <th scope="col">Requested by:</th>
                        </tr>
                    </thead>
                    <tbody>
                   
                    </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Send SMS</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formSmsContent" className="sms-content">
                            <Form.Label>SMS Content</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={smsContent} 
                                onChange={(e) => setSmsContent(e.target.value)} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSendSms}>
                        Send SMS
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Appointments;

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
    const [startDate, setStartDate] = useState(new Date()); 
    const [formattedDate, setFormattedDate] = useState('');

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleSendSms = () => {
        console.log(smsContent);

        handleCloseModal();
    };

    const pendingAppointments = [1]; 
    const confirmedAppointments = [1];

    const formatDate = (date) => {
        if (!date) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const handleDateChange = (date) => {
        setStartDate(date);
        setFormattedDate(formatDate(date));
    };

    return (
        <>
            <div className="appoinmentsPage"></div>
            <h1>Appointments</h1>

            <div className="appointmentsView">    
                <div className="Appointments">
                    <div className="titleFilter">
                        <h3>Pending Appointments:</h3>
                            <div className='appointmentFilterDates'>
                                <label className='me-2'><b></b></label>
                                <DatePicker
                                className='form-control'
                                selected={selectedDate}
                                onChange={date => setSelectedDate(date)}
                                showYearDropdown
                                />
                            </div>
                            <div className="btn-group">
                                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    Filter
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Date</a></li>
                                    <li><a className="dropdown-item" href="#">Purpose</a></li>
                                </ul>
                            </div>
                    </div>
                    <br/>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Time</th>
                                <th scope="col">Period</th>
                                <th scope="col">Purpose</th>
                                <th scope="col">Requested by:</th>
                                <th scope="col">More Info</th> 
                            </tr>
                        </thead>
                        <tbody> 
                            {pendingAppointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td>11/22/21</td>
                                    <td>1:00</td>
                                    <td>Pm</td>
                                    <td>Burial</td>
                                    <td>Navia Caspar</td>
                                    <td><button type="button" className="btn btn-info">Info</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="Appointments">
                    <div className="titleFilter">
                        <h3>Completed Appointments:</h3>
                            <div className='appointmentFilterDates'>
                                <label className='me-2'><b></b></label>
                                <DatePicker
                                className='form-control'
                                selected={selectedDate}
                                onChange={date => setSelectedDate(date)}
                                showYearDropdown
                                />
                            </div>
                            <div className="btn-group">
                                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    Filter
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Date</a></li>
                                    <li><a className="dropdown-item" href="#">Purpose</a></li>
                                </ul>
                            </div>
                    </div>
                    <br/>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Time</th>
                                <th scope="col">Period</th>
                                <th scope="col">Purpose</th>
                                <th scope="col">Requested by:</th>
                                <th scope="col">More Info</th> 
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>11/22/21</td>
                                <td>1:00</td>
                                <td>Pm</td>
                                <td>Burial</td>
                                <td>Navia Caspar</td>
                                <td><button type="button" className="btn btn-info">Info</button></td>
                            </tr>
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

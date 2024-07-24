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

    const pendingAppointments = [1, 2, 3]; 
    const confirmedAppointments = [1, 2, 3, 4, 5];

    return (
        <>
            <div className="appoinmentsPage"></div>
            <h1>Appointments</h1>

            <div className="appointmentDate">
                <label htmlFor="dateSelect" className="form-label"></label>
                <DatePicker 
                    selected={selectedDate} 
                    onChange={date => setSelectedDate(date)}
                    showYearDropdown
                />
            </div>

            <div className="appointmentsView">
                <div className="pendingAppointments">
                    <h1>Pending Appointments</h1>
                    {pendingAppointments.map((appointment, index) => (
                        <div className="appointmentInfo" key={index}>
                            <div className="appointmentInfo2">
                                <p>Time:</p>
                                <p>Purpose:</p>
                                <p>Requested by:</p>
                            </div>
                            <div className="appointmentInfobtn">
                                <button type="button" className="btn btn-success">Accept</button>
                                <button type="button" className="btn btn-danger">Reject</button>
                                <button type="button" className="btn btn-info" onClick={handleShowModal}>Send SMS</button>
                            </div>  
                        </div>
                    ))}
                </div>

                <div className="confirmedAppointments">
                    <h1>Confirmed Appointments</h1>
                    {confirmedAppointments.map((appointment, index) => (
                        <div className="appointmentInfo" key={index}>
                            <p>Time</p>
                            <p>Name</p>
                            <button type="button" className="btn btn-danger" style={{ width: "100px", marginLeft: "70%" }}>Delete</button>
                        </div>
                    ))}
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

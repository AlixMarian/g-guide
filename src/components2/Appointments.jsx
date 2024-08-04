import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "/backend/firebase"; // Adjust the import path as necessary
import { toast } from 'react-toastify';
import '../churchCoordinator.css';

export const Appointments = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [smsContent, setSmsContent] = useState('');
    const [startDate, setStartDate] = useState(new Date()); 
    const [formattedDate, setFormattedDate] = useState('');
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [approvedAppointments, setapprovedAppointments] = useState([]);
    const [deniedAppointments, setdeniedAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleSendSms = () => {
        console.log(smsContent);
        handleCloseModal();
    };

    const sendEmail = (email, subject, message) => {
        // Placeholder function to send an email
        // Replace with your email sending logic
        console.log(`Sending email to ${email}: ${subject} - ${message}`);
    };

    const handleApprove = async () => {
        if (!selectedAppointment) return;

        try {
            const appointmentRef = doc(db, "appointments", selectedAppointment.id);
            await updateDoc(appointmentRef, {
                appointmentStatus: "approved"
            });

            sendEmail(selectedAppointment.userFields?.requesterEmail, "Appointment Approved", "Your appointment has been approved.");
            toast.success('Appointment approved successfully!');
            handleCloseModal();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleDeny = async () => {
        if (!selectedAppointment) return;

        try {
            const appointmentRef = doc(db, "appointments", selectedAppointment.id);
            await updateDoc(appointmentRef, {
                appointmentStatus: "denied"
            });

            sendEmail(selectedAppointment.userFields?.requesterEmail, "Appointment Denied", "Your appointment has been denied.");
            toast.success('Appointment denied successfully!');
            handleCloseModal();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const appointmentTypeMapping = {
        marriageCertificate: "Marriage Certificate",
        birthCertificate: "Birth Certificate",
        baptismalCertificate: "Baptismal Certificate",
        burialCertificate: "Burial Certificate",
        confirmationCertificate: "Confirmation Certificate",
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) {
            return 'Invalid Date';
        }
        const date = new Date(timestamp.seconds * 1000);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const handleDateChange = (date) => {
        setStartDate(date);
        setFormattedDate(formatDate({ seconds: date.getTime() / 1000 }));
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            const pendingQuery = query(collection(db, "appointments"), where("appointmentStatus", "==", "pending"));
            const approvedQuery = query(collection(db, "appointments"), where("appointmentStatus", "==", "approved"));
            const deniedQuery = query(collection(db, "appointments"), where("appointmentStatus", "==", "denied"));
            
            const pendingSnapshot = await getDocs(pendingQuery);
            const approvedSnapshot = await getDocs(approvedQuery);
            const deniedSnapshot = await getDocs(deniedQuery);
            
            const pendingAppointmentsData = pendingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const approvedAppointmentsData = approvedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const deniedAppointmentsData = deniedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log("Pending Appointments:", pendingAppointmentsData);
            console.log("approved Appointments:", approvedAppointmentsData);
            console.log("denied Appointments:", deniedAppointmentsData);

            setPendingAppointments(pendingAppointmentsData);
            setapprovedAppointments(approvedAppointmentsData);
            setdeniedAppointments(deniedAppointmentsData);
        };

        fetchAppointments();
    }, []);

    return (
        <>
            <div className="appoinmentsPage"></div>
            <h1>Appointments</h1>

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
                                <th scope="col">Date of Request</th>
                                <th scope="col">Appointment Type</th>
                                <th scope="col">Requested by:</th>
                                <th scope="col">More Info</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {pendingAppointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td>{formatDate(appointment.userFields?.dateOfRequest)}</td>
                                    <td>{appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}</td> 
                                    <td>{appointment.userFields?.requesterName}</td>
                                    <td>
                                        <Button variant="info" onClick={() => handleShowModal(appointment)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                                            </svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            <div className="appointmentsView">    
                <div className="Appointments">
                    <div className="titleFilter">
                        <h3>Approved Appointments:</h3>
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
                                <th scope="col">Date of Request</th>
                                <th scope="col">Appointment Type</th>
                                <th scope="col">Requested by:</th>
                                <th scope="col">More Info</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {approvedAppointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td>{formatDate(appointment.userFields?.dateOfRequest)}</td>
                                    <td>{appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}</td>
                                    <td>{appointment.userFields?.requesterName}</td>
                                    <td>
                                        <Button variant="info" onClick={() => handleShowModal(appointment)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                                            </svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="Appointments">
                    <div className="titleFilter">
                        <h3>Denied Appointments:</h3>
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
                                <th scope="col">Date of Request</th>
                                <th scope="col">Appointment Type</th>
                                <th scope="col">Requested by:</th>
                                <th scope="col">More Info</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {deniedAppointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td>{formatDate(appointment.userFields?.dateOfRequest)}</td>
                                    <td>{appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}</td> 
                                    <td>{appointment.userFields?.requesterName}</td>
                                    <td>
                                        <Button variant="info" onClick={() => handleShowModal(appointment)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                                            </svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Appointment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <div>
                            <p><strong>Appointment Status:</strong> {selectedAppointment.appointmentStatus}</p>
                            <p><strong>Appointment Type:</strong> {appointmentTypeMapping[selectedAppointment.appointmentType] || selectedAppointment.appointmentType}</p>
                            {selectedAppointment.appointmentType === "confirmationCertificate" && (
                                <>
                                    <p><strong>Confirmation Date:</strong> {selectedAppointment.confirmationCertificate?.confirmationDate}</p>
                                    <p><strong>First Name:</strong> {selectedAppointment.confirmationCertificate?.firstName}</p>
                                    <p><strong>Last Name:</strong> {selectedAppointment.confirmationCertificate?.lastName}</p>
                                </>
                            )}
                            {selectedAppointment.appointmentType === "marriageCertificate" && (
                                <>
                                    <p><strong>Bride First Name:</strong> {selectedAppointment.marriageCertificate?.brideFirstName}</p>
                                    <p><strong>Bride Last Name:</strong> {selectedAppointment.marriageCertificate?.brideLastName}</p>
                                    <p><strong>Groom First Name:</strong> {selectedAppointment.marriageCertificate?.groomFirstName}</p>
                                    <p><strong>Groom Last Name:</strong> {selectedAppointment.marriageCertificate?.groomLastName}</p>
                                    <p><strong>Date of Marriage:</strong> {selectedAppointment.marriageCertificate?.dateOfMarriage}</p>
                                </>
                            )}
                            {selectedAppointment.appointmentType === "baptismalCertificate" && (
                                <>
                                    <p><strong>Birthday:</strong> {selectedAppointment.baptismalCertificate?.birthday}</p>
                                    <p><strong>Father First Name:</strong> {selectedAppointment.baptismalCertificate?.fatherFirstName}</p>
                                    <p><strong>Father Last Name:</strong> {selectedAppointment.baptismalCertificate?.fatherLastName}</p>
                                    <p><strong>First Name:</strong> {selectedAppointment.baptismalCertificate?.firstName}</p>
                                    <p><strong>Last Name:</strong> {selectedAppointment.baptismalCertificate?.lastName}</p>
                                    <p><strong>Mother First Name:</strong> {selectedAppointment.baptismalCertificate?.motherFirstName}</p>
                                    <p><strong>Mother Last Name:</strong> {selectedAppointment.baptismalCertificate?.motherLastName}</p>
                                </>
                            )}
                            {selectedAppointment.appointmentType === "burialCertificate" && (
                                <>
                                    <p><strong>Death Certificate:</strong> <a href={selectedAppointment.burialCertificate?.deathCertificate} target="_blank" rel="noopener noreferrer">View Document</a></p>
                                </>
                            )}
                            <p><strong>Date of Request:</strong> {formatDate(selectedAppointment.userFields?.dateOfRequest)}</p>
                            <p><strong>Payment Image:</strong> <a href={selectedAppointment.userFields?.paymentImage} target="_blank" rel="noopener noreferrer">View Image</a></p>
                            <p><strong>Requester Contact:</strong> {selectedAppointment.userFields?.requesterContact}</p>
                            <p><strong>Requester Email:</strong> {selectedAppointment.userFields?.requesterEmail}</p>
                            <p><strong>Requester Name:</strong> {selectedAppointment.userFields?.requesterName}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSendSms}>
                        Send SMS
                    </Button>
                    <Button variant="success" onClick={handleApprove}>
                        Approve
                    </Button>
                    <Button variant="danger" onClick={handleDeny}>
                        Deny
                    </Button>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Appointments;

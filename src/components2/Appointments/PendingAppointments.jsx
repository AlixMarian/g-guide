import { useEffect, useState } from "react";
import { Modal, Button, Form, Pagination, Dropdown, DropdownButton} from 'react-bootstrap';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "/backend/firebase"; 
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../../churchCoordinator.css'
import loadingGif from '/src/assets/Ripple@1x-1.0s-200px-200px.gif';


export const PendingAppointments = () => {
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSendMessageModal, setShowSendMessageModal] = useState(false);
    const [message, setMessage] = useState('');
    const [slots, setSlots] = useState([]);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [denialReason, setDenialReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedAppointmentType, setSelectedAppointmentType] = useState('All');
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const user = auth.currentUser;
    const appointmentsPerPage = 7; 

    const appointmentTypeMapping = {
        marriageCertificate: "Marriage Certificate",
        baptismalCertificate: "Baptismal Certificate",
        burialCertificate: "Burial Certificate",
        confirmationCertificate: "Confirmation Certificate",
        marriage:"Marriage",
        baptism:"Baptism",
        burial:"Burial",
        confirmation:"Confirmation",
        massintentions: "Mass Intentions"
    };

    useEffect(() => {
        const fetchPendingAppointments = async () => {
            if (!user ) return;
            try {
                const coordinatorQuery = query(
                    collection(db, "coordinator"),
                    where("userId", "==", user.uid)
                );
                const coordinatorSnapshot = await getDocs(coordinatorQuery);
                
                if (coordinatorSnapshot.empty) {
                    console.log("No coordinator found for this user.");
                    return;
                }
    
                const coordinatorID = coordinatorSnapshot.docs[0].id; 
    
                if (!coordinatorID) {
                    console.error("Coordinator ID is undefined.");
                    return;
                }
    
                const churchQuery = query(
                    collection(db, "church"),
                    where("coordinatorID", "==", coordinatorID)
                );
                const churchSnapshot = await getDocs(churchQuery);
                
                if (churchSnapshot.empty) {
                    console.log("No church found for this coordinator.");
                    return;
                }
    
                const churchID = churchSnapshot.docs[0].id;
    
                if (!churchID) {
                    console.error("Church ID is undefined.");
                    return;
                }
    
                const pendingAppointmentsQuery = query(
                    collection(db, "appointments"),
                    where("appointmentStatus", "==", "Pending"),
                    where("churchId", "==", churchID)
                );
                const pendingAppointmentsSnapshot = await getDocs(pendingAppointmentsQuery);
                const pendingAppointmentsData = pendingAppointmentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const sortedAppointments = pendingAppointmentsData.sort((a, b) => {
                    const dateA = a.userFields?.dateOfRequest.seconds || 0;
                    const dateB = b.userFields?.dateOfRequest.seconds || 0; 
                    return dateB - dateA;
                });
                
                console.log("Fetched Pending Appointments: ", pendingAppointmentsData);
                setPendingAppointments(sortedAppointments);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointments: ", error);
                setLoading(false);
            }
        };
    
        fetchPendingAppointments();
    }, [user]);

    const fetchChurchName = async (churchId) => {
        try {
            const churchRef = doc(db, "church", churchId);
            const churchSnap = await getDoc(churchRef);
    
            if (churchSnap.exists()) {
                return churchSnap.data().churchName || "Unknown Church"; 
            } else {
                console.warn(`Church with ID ${churchId} does not exist.`);
                return "Unknown Church";
            }
        } catch (error) {
            console.error(`Error fetching church name for ID ${churchId}:`, error);
            return "Unknown Church";
        }
    };
    

    const sendEmail = async (email, subject, message) => {
        try {
            const response = await axios.post('http://localhost:3006/send-email', {
                email: email,
                subject: subject,
                text: message
            });
            console.log('Email sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedAppointment || !message) {
            toast.error("Message cannot be empty.");
            return;
        }
    
        try {
            
            const churchName = await fetchChurchName(selectedAppointment.churchId);
            const inboxMessageData = {
                churchId: selectedAppointment.churchId,
                userId: selectedAppointment.userFields?.requesterId,
                appointmentId: selectedAppointment.id, 
                message,
                dateSent: Timestamp.fromDate(new Date()),
                status: "new",
            };
            await addDoc(collection(db, "inboxMessage"), inboxMessageData);        
            const appointmentType = appointmentTypeMapping[selectedAppointment.appointmentType] || selectedAppointment.appointmentType;
            const emailContent = `
                You got a message from ${churchName} regarding your appointment ${appointmentType}:
                "${message}"
            `;
            await sendEmail(
                selectedAppointment.userFields?.requesterEmail,
                "Message from Church Coordinator",
                emailContent 
            );
    
            toast.success("Message sent successfully!");
            setMessage('');
            setShowSendMessageModal(false);
        } catch (error) {
            console.error("Error sending message: ", error);
            toast.error("Failed to send message.");
        }
    };
    
    

    const handleShowSendMessageModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowSendMessageModal(true);
    };

    const handleCloseSendMessageModal = () => {
        setShowSendMessageModal(false);
        setMessage('');
    };
    
    

    const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) {
            return 'Invalid Date';
        }
        const date = new Date(timestamp.seconds * 1000);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const handleForPayment = async () => {
        if (!selectedAppointment) return;
    
        const message = "Your appointment is now pending for payment. <br>Please follow the instructions to complete the payment process.<br><br><small>Instructions:<br>1. Go to your homepage.<br> 2. In the 'Ongoing Transactions' section, locate your pending appointments.<br> 3. Click 'Pay here via QR Code'.<br> 4. Scan the displayed QR Code.<br> 5. Upload your official payment receipt.<br> 6. Check the box to confirm that you have read and understood the church's refund policy.<br> 7. Click 'Upload Receipt' to complete the process.<br></small>";
    
        try {
            const appointmentRef = doc(db, "appointments", selectedAppointment.id);
            await updateDoc(appointmentRef, {
                appointmentStatus: "For Payment"
            });
    
           
            const inboxMessageData = {
                churchId: selectedAppointment.churchId,
                userId: selectedAppointment.userFields?.requesterId,
                appointmentId: selectedAppointment.id,
                message,
                dateSent: Timestamp.fromDate(new Date())
            };
            await addDoc(collection(db, "inboxMessage"), inboxMessageData);
    
            
            await sendEmail(
                selectedAppointment.userFields?.requesterEmail,
                "Appointment Pending for Payment",
                message
            );
    
            toast.success('Appointment pending for payment.');
            handleCloseModal();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };
    
    const handleSubmitDenial = async () => {
        if (!selectedAppointment) return;
    
        const message = `We regret to inform you that your appointment has been denied. <br><span style="color: red;">Reason: ${denialReason}</span><br>`;
    
        try {
            const appointmentRef = doc(db, "appointments", selectedAppointment.id);
            await updateDoc(appointmentRef, {
                appointmentStatus: "Denied",
                denialReason: denialReason
            });
    
           
            const inboxMessageData = {
                churchId: selectedAppointment.churchId,
                userId: selectedAppointment.userFields?.requesterId,
                appointmentId: selectedAppointment.id,
                message,
                dateSent: Timestamp.fromDate(new Date())
            };
            await addDoc(collection(db, "inboxMessage"), inboxMessageData);
    
            
            await sendEmail(
                selectedAppointment.userFields?.requesterEmail,
                "Appointment Denied",
                message
            );
    
            toast.success('Appointment denied successfully!');
            setShowDenyModal(false);
            setDenialReason('');
            handleCloseModal();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };
    

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const slotsQuery = query(collection(db, 'slot'), where('slotStatus', '==', 'taken'));
                const allSlotsSnapshot = await getDocs(slotsQuery);
                const allSlots = allSlotsSnapshot.docs.reduce((acc, doc) => {
                    acc[doc.id] = doc.data();
                    return acc;
                }, {});
                setSlots(allSlots);
            } catch (error) {
                console.error('Error fetching slots:', error);
            }
        };
    
        fetchSlots();
    }, []);

    const getSlotData = (slotId) => {
        const slot = slots[slotId];
        return slot || {};
    };

    const convertTo12HourFormat = (time) => {
        if (!time || time === "none") return "none";
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
    };

    const filteredAppointments = pendingAppointments.filter((appointment) => {
        const matchesDate = selectedDate
            ? new Date(appointment.userFields?.dateOfRequest.seconds * 1000).toDateString() === selectedDate.toDateString()
            : true;

        const matchesType = selectedAppointmentType === 'All'
            || (appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType) === selectedAppointmentType;

        return matchesDate && matchesType;
    });

    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * appointmentsPerPage,
        currentPage * appointmentsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px', justifyContent: 'center' }} />
        </div>  
        )
      }
    

    return (
        <>
        
        <h1 className="me-3">Pending Appointments</h1>
        <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg" style={{ width: "85%" }}>
            <div className="card-body">
            <div className="row mb-4 align-items-center">
            <div className="col-md-4 d-flex align-items-center">
                <div className="form-group w-100 me-1">
                    <label className="form-label"><b>Filter by Date:</b></label>
                    <div className="input-group">
                        <DatePicker
                            className="form-control"
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            showYearDropdown
                        />
                        <button className="btn btn-danger" onClick={() => setSelectedDate(null)}>Clear</button>
                    </div>
                </div>
            </div>
            <div className="col-md-6 d-flex justify-content-start">
                <div>
                    <label className="form-label"><b>Filter by Type:</b></label>
                    <DropdownButton id="dropdown-basic-button" title={`Selected Type: ${selectedAppointmentType}`} variant="secondary">
                        <Dropdown.Item onClick={() => setSelectedAppointmentType('All')}>All</Dropdown.Item>
                        {Object.values(appointmentTypeMapping).map((type) => (
                            <Dropdown.Item key={type} onClick={() => setSelectedAppointmentType(type)}>{type}</Dropdown.Item>
                        ))}
                    </DropdownButton>
                </div>
            </div>
            </div>
            <table className="table">
                <thead className="table-dark">
                <tr>
                    <th scope="col" className="pending-th">Date of Request</th>
                    <th scope="col" className="pending-th">Appointment Option</th>
                    <th scope="col" className="pending-th">Appointment Type</th>
                    <th scope="col" className="pending-th">Requested by</th>
                    <th scope="col" className="pending-th">Requester Contact</th>
                    <th scope="col" className="pending-th">More Info</th>
                    <th scope="col" className="pending-th">Send Message</th>
                </tr>
                </thead>
                <tbody>
                {paginatedAppointments.length > 0 ?(
                    paginatedAppointments.map((appointment, index) => (
                        <tr key={index}>
                        <td className="pending-td">{formatDate(appointment.userFields?.dateOfRequest)}</td>
                        <td className="pending-td">{appointment.appointmentPurpose}</td>
                        <td className="pending-td">{appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}</td>
                        <td className="pending-td">{appointment.userFields?.requesterName}</td>
                        <td className="pending-td">{appointment.userFields?.requesterContact}</td>
                        <td>
                            <Button variant="info" onClick={() => handleShowModal(appointment)}>
                            <i className="bi bi-info-circle-fill"></i>
                            </Button>
                        </td>
                        <td>
                            <Button variant="primary" onClick={() => handleShowSendMessageModal(appointment)}>
                                <i className="bi bi-chat-text"></i>
                            </Button>
                        </td>
                        </tr>
                    ))
                    ): (
                        <tr>
                            <td colSpan="7" className="text-center py-5">
                                <h4 className="text-muted">No pending appointments found</h4>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Pagination className="justify-content-center">
            {[...Array(Math.ceil(filteredAppointments.length / appointmentsPerPage)).keys()].map((page) => (
                <Pagination.Item
                key={page + 1}
                active={page + 1 === currentPage}
                onClick={() => handlePageChange(page + 1)}
                >
                {page + 1}
                </Pagination.Item>
            ))}
            </Pagination>
            </div>
        </div>
        </div>

        <Modal show={showSendMessageModal} onHide={handleCloseSendMessageModal}>
                <Modal.Header>
                    <Modal.Title>Send Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="message">
                        <Form.Label>This message will be sent to the receiver&apos;s email and in-app inbox:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSendMessageModal}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleSendMessage}>
                        Send
                    </Button>
                </Modal.Footer>
        </Modal>


        <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Appointment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <div>
                            <p><strong>Appointment Status:</strong> {selectedAppointment.appointmentStatus}</p>
                            <p><strong>Appointment Option:</strong> {selectedAppointment.appointmentPurpose} </p>
                            <p><strong>Appointment Type:</strong> {appointmentTypeMapping[selectedAppointment.appointmentType] || selectedAppointment.appointmentType}</p>
                            <br/>
                            <h4>Submitted Details</h4>
                            {selectedAppointment.appointmentType === "marriage" && (
                                <>  
                                    <p><b>Selected Date for Marriage:</b> {selectedAppointment.slotId ? (() => {
                                        const slotData = getSlotData(selectedAppointment.slotId);
                                        return slotData.startDate || 'N/A';
                                    })() : 'N/A'}</p>
                                    <p><b>Selected Time for Marriage:</b> {selectedAppointment.slotId ? (() => {
                                        const slotData = getSlotData(selectedAppointment.slotId);
                                        const startTime = convertTo12HourFormat(slotData.startTime);
                                        const endTime = convertTo12HourFormat(slotData.endTime);
                                        return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                                    })() : 'N/A'}</p>
                                    <p><strong>Bride First Name:</strong> {selectedAppointment.marriage?.brideFirstName}</p>
                                    <p><strong>Bride Last Name:</strong> {selectedAppointment.marriage?.brideLastName}</p>
                                    <p><strong>Groom First Name:</strong> {selectedAppointment.marriage?.groomFirstName}</p>
                                    <p><strong>Groom Last Name:</strong> {selectedAppointment.marriage?.groomLastName}</p>
                                    <p><strong>Date of Marriage:</strong> {selectedAppointment.marriage?.dateOfMarriage}</p>
                                    <br/>

                                </>
                            )}

                            {selectedAppointment.appointmentType === "baptism" && (
                                <>  
                                    <p><b>Selected Date for Baptism:</b> {selectedAppointment.slotId ? (() => {
                                        const slotData = getSlotData(selectedAppointment.slotId);
                                        return slotData.startDate || 'N/A';
                                    })() : 'N/A'}</p>
                                    <p><b>Selected Time for Baptism:</b> {selectedAppointment.slotId ? (() => {
                                        const slotData = getSlotData(selectedAppointment.slotId);
                                        const startTime = convertTo12HourFormat(slotData.startTime);
                                        const endTime = convertTo12HourFormat(slotData.endTime);
                                        return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                                    })() : 'N/A'}</p>
                                    <p><strong>Child First Name:</strong> {selectedAppointment.baptism?.childFirstName}</p>
                                    <p><strong>Child Last Name:</strong> {selectedAppointment.baptism?.childLastName}</p>
                                    <p><strong>Birthday:</strong> {selectedAppointment.baptism?.dateOfBirth}</p>
                                    <p><strong>Place of Birth:</strong> {selectedAppointment.baptism?.placeOfBirth}</p>
                                    <p><strong>Father First Name:</strong> {selectedAppointment.baptism?.fatherFirstName}</p>
                                    <p><strong>Father Last Name:</strong> {selectedAppointment.baptism?.fatherLastName}</p>
                                    <p><strong>Mother First Name:</strong> {selectedAppointment.baptism?.motherFirstName}</p>
                                    <p><strong>Mother Last Name:</strong> {selectedAppointment.baptism?.motherLastName}</p>
                                    <br/>
                                    <p><strong>Other Details:</strong></p>
                                    <p><strong>Marriage date of parents:</strong> {selectedAppointment.baptism?.marriageDate}</p>
                                    <p><strong>Name of priest who will baptise:</strong> {selectedAppointment.baptism?.priestOptions}</p>
                                    <p><strong>Name of Godparents:</strong> {selectedAppointment.baptism?.godParents}</p>
                                    <br/>
                                </>
                            )}

                            {selectedAppointment.appointmentType === "burial" && (
                                <>
                                    <p><b>Selected Date for Burial Service:</b> {selectedAppointment.slotId ? (() => {
                                        const slotData = getSlotData(selectedAppointment.slotId);
                                        return slotData.startDate || 'N/A';
                                    })() : 'N/A'}</p>
                                    <p><b>Selected Time for Burial Service:</b> {selectedAppointment.slotId ? (() => {
                                        const slotData = getSlotData(selectedAppointment.slotId);
                                        const startTime = convertTo12HourFormat(slotData.startTime);
                                        const endTime = convertTo12HourFormat(slotData.endTime);
                                        return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                                    })() : 'N/A'}</p>
                                    <p><strong>Death Certificate:</strong> <a href={selectedAppointment.burial?.deathCertificate} target="_blank" rel="noopener noreferrer">View Document</a></p>
                                    <br/>
                                </>
                            )}

                            {selectedAppointment.appointmentType === "confirmation" && (
                                <>
                                    <p><strong>First Name:</strong> {selectedAppointment.confirmation?.firstName}</p>
                                    <p><strong>Last Name:</strong> {selectedAppointment.confirmation?.lastName}</p>
                                    <p><strong>Baptismal Certificate:</strong> <a href={selectedAppointment.confirmation?.baptismalCert} target="_blank" rel="noopener noreferrer">View Document</a></p>
                                    <p><strong>Birth Certificate:</strong> <a href={selectedAppointment.confirmation?.birthCertificate} target="_blank" rel="noopener noreferrer">View Document</a></p>
                                    <br/>
                                </>
                            )}


                            {selectedAppointment.appointmentType === "confirmationCertificate" && (
                                <>
                                    <p><strong>Confirmation Date:</strong> {selectedAppointment.confirmationCertificate?.confirmationDate}</p>
                                    <p><strong>First Name:</strong> {selectedAppointment.confirmationCertificate?.firstName}</p>
                                    <p><strong>Last Name:</strong> {selectedAppointment.confirmationCertificate?.lastName}</p>
                                    <br/>
                                </>
                            )}
                            {selectedAppointment.appointmentType === "marriageCertificate" && (
                                <>  
                                    
                                    <p><strong>Bride First Name:</strong> {selectedAppointment.marriageCertificate?.brideFirstName}</p>
                                    <p><strong>Bride Last Name:</strong> {selectedAppointment.marriageCertificate?.brideLastName}</p>
                                    <p><strong>Groom First Name:</strong> {selectedAppointment.marriageCertificate?.groomFirstName}</p>
                                    <p><strong>Groom Last Name:</strong> {selectedAppointment.marriageCertificate?.groomLastName}</p>
                                    <p><strong>Date of Marriage:</strong> {selectedAppointment.marriageCertificate?.dateOfMarriage}</p>
                                    <br/>

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
                                    <br/>
                                </>
                            )}
                            {selectedAppointment.appointmentType === "burialCertificate" && (
                                <>
                                    <p><strong>Death Certificate:</strong> <a href={selectedAppointment.burialCertificate?.deathCertificate} target="_blank" rel="noopener noreferrer">View Document</a></p>
                                    <br/>
                                </>
                            )}
                            <h4>Requester&apos;s Information</h4>
                            <p><strong>Date of Request:</strong> {formatDate(selectedAppointment.userFields?.dateOfRequest)}</p>

                            <p><strong>Payment Receipt Image: </strong> {selectedAppointment.appointments?.paymentImage ? (
                                <a href={selectedAppointment.appointments.paymentImage} target="_blank" rel="noopener noreferrer">
                                    View Document
                                </a>
                            ) : (
                                <span style={{ color: 'red' }}>Pending Payment</span>
                            )}</p>
                            <p><strong>Requester Contact:</strong> {selectedAppointment.userFields?.requesterContact}</p>
                            <p><strong>Requester Email:</strong> {selectedAppointment.userFields?.requesterEmail}</p>
                            <p><strong>Requester Name:</strong> {selectedAppointment.userFields?.requesterName}</p>
                            {selectedAppointment.appointmentPurpose === "others" && selectedAppointment.authorizationLetter && (
                                <>
                                    <p><strong>Authorization Letter:</strong> <a href={selectedAppointment.authorizationLetter} target="_blank" rel="noopener noreferrer">View Document</a></p>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                        <>
                           {!['For Payment', 'Approved', 'Denied'].includes(selectedAppointment?.appointmentStatus) && (
                                <Button variant="primary" style={{ backgroundColor: 'blue', borderColor: 'blue' }} onClick={handleForPayment}>
                                    For Payment
                                </Button>
                            )}
                            {!['Denied'].includes(selectedAppointment?.appointmentStatus) && (
                            <Button variant="danger" onClick={() => setShowDenyModal(true)}>
                                Deny
                            </Button>
                            )}
                        </>
                </Modal.Footer>
            </Modal>

            <Modal show={showDenyModal} onHide={() => setShowDenyModal(false)} className="custom-modal" dialogClassName="modal-dialog-centered">
                <Modal.Header closeButton>
                    <Modal.Title>Deny Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="denialReason">
                        <Form.Label>Reason for Denial:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={denialReason}
                            onChange={(e) => setDenialReason(e.target.value)}
                            placeholder="Enter reason for denial"
                            style={{ resize: 'vertical' }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowDenyModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleSubmitDenial}>Submit</Button>
                    <p style={{ fontSize: '12px', textAlign: 'center', margin: '0 auto', marginTop: '1rem' }}>Note: This message will send to both Email and In-app Inbox</p>
                </Modal.Footer>
            </Modal>
        </>
    );  
};

export default PendingAppointments;
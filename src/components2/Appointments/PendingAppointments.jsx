import { useEffect, useState } from "react";
import { Modal, Button, Form} from 'react-bootstrap';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "/backend/firebase"; 
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import '../../churchCoordinator.css'

export const PendingAppointments = () => {
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [slots, setSlots] = useState([]);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [denialReason, setDenialReason] = useState('');

    const auth = getAuth();
    const user = auth.currentUser;

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
                // Step 1: Query the coordinator collection to get the coordinatorID based on the userId
                const coordinatorQuery = query(
                    collection(db, "coordinator"),
                    where("userId", "==", user.uid)
                );
                const coordinatorSnapshot = await getDocs(coordinatorQuery);
                
                if (coordinatorSnapshot.empty) {
                    console.log("No coordinator found for this user.");
                    return;
                }
    
                const coordinatorData = coordinatorSnapshot.docs[0].data(); // Assuming only one coordinator per user
                const coordinatorID = coordinatorSnapshot.docs[0].id; // Get the document ID as the coordinatorID
    
                if (!coordinatorID) {
                    console.error("Coordinator ID is undefined.");
                    return;
                }
    
                // Step 2: Query the church collection to get the churchID based on the coordinatorID
                const churchQuery = query(
                    collection(db, "church"),
                    where("coordinatorID", "==", coordinatorID)
                );
                const churchSnapshot = await getDocs(churchQuery);
                
                if (churchSnapshot.empty) {
                    console.log("No church found for this coordinator.");
                    return;
                }
    
                const churchData = churchSnapshot.docs[0].data(); // Assuming only one church per coordinator
                const churchID = churchSnapshot.docs[0].id; // Get the document ID as the churchID
    
                if (!churchID) {
                    console.error("Church ID is undefined.");
                    return;
                }
    
                // Step 3: Query the appointments collection to get all pending appointments for the churchID
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
                
                console.log("Fetched Pending Appointments: ", pendingAppointmentsData);
                setPendingAppointments(pendingAppointmentsData);
            } catch (error) {
                console.error("Error fetching appointments: ", error);
            }
        };
    
        fetchPendingAppointments();
    }, [user]);
    
    

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

        try {
            const appointmentRef = doc(db, "appointments", selectedAppointment.id);
            await updateDoc(appointmentRef, {
                appointmentStatus: "For Payment"
            });

            await sendEmail(
                selectedAppointment.userFields?.requesterEmail,
                "Appointment Pending for Payment",
                "Your appointment is now pending for payment. <br>Please follow the instructions to complete the payment process.<br>"
            );

            toast.success('Appointment pending for payment.');
            handleCloseModal();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleSubmitDenial = async () => {
        if (!selectedAppointment) return;

        try {
            const appointmentRef = doc(db, "appointments", selectedAppointment.id);
            await updateDoc(appointmentRef, {
                appointmentStatus: "Denied",
                denialReason: denialReason
            });

            await sendEmail(
                selectedAppointment.userFields?.requesterEmail,
                "Appointment Denied",
                `We regret to inform you that your appointment has been denied. <br><span style="color: red;">Reason: ${denialReason}</span><br>`
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

    return (
        <>
        
        <h1 className="me-3">Pending Appointments</h1>
        <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg" style={{ width: "80%" }}>
            <div className="card-body">
            <table className="table">
                <thead className="table-dark">
                <tr>
                    <th scope="col" className="pending-th">Date of Request</th>
                    <th scope="col" className="pending-th">Appointment Option</th>
                    <th scope="col" className="pending-th">Appointment Type</th>
                    <th scope="col" className="pending-th">Requested by</th>
                    <th scope="col" className="pending-th">Requester Contact</th>
                    <th scope="col" className="pending-th">More Info</th>
                    <th scope="col" className="pending-th">Send SMS</th>
                </tr>
                </thead>
                <tbody>
                {pendingAppointments.map((appointment, index) => (
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
                        <Button>
                        <i className="bi bi-chat-text"></i>
                        </Button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
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
                    <p style={{ fontSize: '12px', textAlign: 'center', margin: '0 auto', marginTop: '1rem' }}>Note: This message will send to both Email and SMS</p>
                </Modal.Footer>
            </Modal>
        </>
    );  
};

export default PendingAppointments;
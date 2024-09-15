import React, { useEffect, useState } from "react";
import { Modal, Button, Form} from 'react-bootstrap';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase"; 
import { getAuth } from 'firebase/auth';
import '../../churchCoordinator.css'


export const MassIntentions = () => {
    const [massIntentions, setMassIntentions] = useState([]);
    const [showMassIntentionModal, setShowMassIntentionModal] = useState(false);
    const [selectedMassIntention, setSelectedMassIntention] = useState(null);
    
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
        const fetchMassIntentions = async () => {
            if (!user) return;
            const massIntentionsQuery = query(
                collection(db, "massIntentions"), 
                where("churchId", "==", user.uid)
            );
            const massIntentionsSnapshot = await getDocs(massIntentionsQuery);
            const massIntentionsData = massIntentionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Fetched Data: ", massIntentionsData);
            setMassIntentions(massIntentionsData);
        };

        fetchMassIntentions();
    }, [user]);

    const handleShowMassIntentionModal = (intention) => {
        setSelectedMassIntention(intention);
        setShowMassIntentionModal(true);
    };
    
    const handleCloseMassIntentionModal = () => {
        setShowMassIntentionModal(false);
        setSelectedMassIntention(null);
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) {
            return 'Invalid Date';
        }
        const date = new Date(timestamp.seconds * 1000);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
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
        <div className="Appointments">
            <div className="titleFilter">
                <h3>Mass Intentions</h3>
            </div>
            <br />
            <table className="table">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">Date of Request</th>
                        <th scope="col">Mass Date</th>
                        <th scope="col">Mass Time</th>
                        <th scope="col">Requested by</th>
                        <th scope="col">More Info</th>
                    </tr>
                </thead>
                <tbody>
                    {massIntentions.map((intention, index) => (
                        <tr key={index}>
                            <td>{formatDate(intention.dateOfRequest)}</td>
                            <td>{intention.massSchedule?.massDate}</td>
                            <td>{convertTo12HourFormat(intention.massSchedule?.massTime)}</td>
                            <td>{intention.userFields.requesterName}</td>
                            <td>
                                <Button variant="info" onClick={() => handleShowMassIntentionModal(intention)}>
                                    <i className="bi bi-info-circle-fill"></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <Modal show={showMassIntentionModal} onHide={handleCloseMassIntentionModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Mass Intention Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMassIntention && (
                        <>
                            <p><strong>Date of Request:</strong> {formatDate(selectedMassIntention.dateOfRequest)}</p>
                            <p><strong>Mass Date:</strong> {selectedMassIntention.massSchedule?.massDate}</p>
                            <p><strong>Mass Time:</strong> {convertTo12HourFormat(selectedMassIntention.massSchedule?.massTime)}</p>
                            <p><strong>Requester Contact:</strong> {selectedMassIntention.userFields?.requesterContact}</p>
                            <p><strong>Requester Email:</strong> {selectedMassIntention.userFields?.requesterEmail}</p>
                            <p><strong>Requester Name:</strong> {selectedMassIntention.userFields?.requesterName}</p>
                            
                            <br/>
                            <p><strong>Petition:</strong> {selectedMassIntention.petition}</p>
                            <p><strong>Thanksgiving Mass:</strong> {selectedMassIntention.thanksgivingMass}</p>
                            <p><strong>For the Souls of:</strong> {selectedMassIntention.forTheSoulOf}</p>
                            <br/>

                            <p><strong>Mass Intention receipt:</strong> <a href={selectedMassIntention.receiptImage} target="_blank" rel="noopener noreferrer">View Document</a></p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseMassIntentionModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MassIntentions;

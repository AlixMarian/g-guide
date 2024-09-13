import React, { useEffect, useState } from "react";
import { Button } from 'react-bootstrap';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase";


export const ApprovedAppointments = ({ user }) => {
    const [approvedAppointments, setApprovedAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Fetch Approved Appointments
    useEffect(() => {
        const fetchApprovedAppointments = async () => {
            if (!user) return;
            const approvedQuery = query(
                collection(db, "appointments"),
                where("appointmentStatus", "==", "Approved"),
                where("churchId", "==", user.uid)
            );
            const approvedSnapshot = await getDocs(approvedQuery);
            const approvedAppointmentsData = approvedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApprovedAppointments(approvedAppointmentsData);
        };

        fetchApprovedAppointments();
    }, [user]);

    const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
    };

    return (
        <>
        <h1 className="me-3">Approved Appointments</h1>
        <div className="Appointments">
            <br />
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Date of Request</th>
                        <th scope="col">Appointment Option</th>
                        <th scope="col">Appointment Type</th>
                        <th scope="col">Requested by</th>
                        <th scope="col">Requester Contact</th>
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
                                    <i className="bi bi-info-circle-fill"></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default ApprovedAppointments;

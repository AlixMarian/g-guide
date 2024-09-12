import React, { useEffect, useState } from "react";
import { Button } from 'react-bootstrap';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase";
import '../../churchCoordinator.css'

export const PendingAppointments = ({ user }) => {
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        const fetchPendingAppointments = async () => {
            if (!user) return;
            const pendingQuery = query(
                collection(db, "appointments"),
                where("appointmentStatus", "==", "Pending"),
                where("churchId", "==", user.uid)
            );
            const pendingSnapshot = await getDocs(pendingQuery);
            const pendingAppointmentsData = pendingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPendingAppointments(pendingAppointmentsData);
        };

        fetchPendingAppointments();
    }, [user]);

    const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
    };

    return (
        <div className="Appointments">
            <div className="titleFilter">
                <h3>Pending Appointments</h3>
            </div>
            <br />
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Date of Request</th>
                        <th scope="col">Appointment Type</th>
                        <th scope="col">Requested by:</th>
                        <th scope="col">More Info</th>
                        <th scope="col">Send SMS</th>
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
    );
};

export default PendingAppointments;
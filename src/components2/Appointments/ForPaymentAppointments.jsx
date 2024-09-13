import React, { useEffect, useState } from "react";
import { Button } from 'react-bootstrap';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase";


export const ForPaymentAppointments = ({ user }) => {
    const [forPaymentAppointments, setForPaymentAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Fetch For Payment Appointments
    useEffect(() => {
        const fetchForPaymentAppointments = async () => {
            if (!user) return;
            const forPaymentQuery = query(
                collection(db, "appointments"),
                where("appointmentStatus", "==", "For Payment"),
                where("churchId", "==", user.uid)
            );
            const forPaymentSnapshot = await getDocs(forPaymentQuery);
            const forPaymentAppointmentsData = forPaymentSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setForPaymentAppointments(forPaymentAppointmentsData);
        };

        fetchForPaymentAppointments();
    }, [user]);

    const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
    };

    return (
        <>
        <h1 className="me-3">For Payment Appointments</h1>
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
                        <th scope="col">Send SMS</th>
                    </tr>
                </thead>
                <tbody>
                    {forPaymentAppointments.map((appointment, index) => (
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
        </>
    );
};

export default ForPaymentAppointments;

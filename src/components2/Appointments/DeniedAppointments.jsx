import React, { useEffect, useState } from "react";
import { Button } from 'react-bootstrap';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase";

export const DeniedAppointments = ({user}) => {
    const [deniedAppointments, setDeniedAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        const fetchDeniedAppointments = async () => {
            if (!user) return;
            const deniedQuery = query(
                collection(db, "appointments"),
                where("appointmentStatus", "==", "Denied"),
                where("churchId", "==", user.uid)
            );
            const deniedSnapshot = await getDocs(deniedQuery);
            const deniedAppointmentsData = deniedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDeniedAppointments(deniedAppointmentsData);
        };

        fetchDeniedAppointments();
    }, [user]);

    const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
    };


    return (
        <>
        <h1 className="me-3">Denied Appointments</h1>
        <div className="Appointments">
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
                    {deniedAppointments.map((appointment, index) => (
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

export default DeniedAppointments;



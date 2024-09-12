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

    
};

export default PendingAppointments;
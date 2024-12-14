/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';
import { Pagination, DropdownButton, Dropdown } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const Messages = () => {
  const [churchId, setChurchId] = useState(null);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [users, setUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState('All');
  const messagesPerPage = 5;

  const appointmentTypeMapping = {
    marriageCertificate: "Marriage Certificate",
    birthCertificate: "Birth Certificate",
    baptismalCertificate: "Baptismal Certificate",
    burialCertificate: "Burial Certificate",
    confirmationCertificate: "Confirmation Certificate",
    baptism: "Baptism",
    burial: "Burial",
    marriage: "Marriage",
    confirmation: "Confirmation",
  };

  const stripHtmlTags = (htmlString) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  const fetchChurchId = async (userId) => {
    try {
      const coordinatorQuery = query(collection(db, 'coordinator'), where('userId', '==', userId));
      const coordinatorSnapshot = await getDocs(coordinatorQuery);

      if (coordinatorSnapshot.empty) {
        toast.error("No coordinator found for this user.");
        return;
      }

      const coordinatorId = coordinatorSnapshot.docs[0].id;
      const churchQuery = query(collection(db, 'church'), where('coordinatorID', '==', coordinatorId));
      const churchSnapshot = await getDocs(churchQuery);

      if (churchSnapshot.empty) {
        toast.error("No church associated with this coordinator.");
        return;
      }

      setChurchId(churchSnapshot.docs[0].id);
    } catch (error) {
      console.error("Error fetching church ID:", error);
      toast.error("Failed to fetch church ID.");
    }
  };

  const fetchMessages = async () => {
    if (!churchId) return;

    try {
      const messagesQuery = query(collection(db, 'inboxMessage'), where('churchId', '==', churchId));
      const messageDocs = await getDocs(messagesQuery);

      const messages = messageDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const appointmentIds = [...new Set(messages.map((msg) => msg.appointmentId))];
      const userIds = [...new Set(messages.map((msg) => msg.userId))];

      await fetchAppointments(appointmentIds);
      await fetchUsers(userIds);

      setInboxMessages(messages.sort((a, b) => b.dateSent.toDate() - a.dateSent.toDate()));
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages.");
    }
  };

  const fetchAppointments = async (appointmentIds) => {
    try {
      const appointmentData = await Promise.all(
        appointmentIds.map(async (id) => {
          const appointmentDoc = await getDoc(doc(db, 'appointments', id));
          return { id, data: appointmentDoc.exists() ? appointmentDoc.data() : null };
        })
      );

      const appointmentMap = appointmentData.reduce((acc, { id, data }) => {
        if (data) acc[id] = data;
        return acc;
      }, {});

      setAppointments(appointmentMap);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments.");
    }
  };

  const fetchUsers = async (userIds) => {
    try {
      const userData = await Promise.all(
        userIds.map(async (id) => {
          const userDoc = await getDoc(doc(db, 'users', id));
          return { id, data: userDoc.exists() ? userDoc.data() : null };
        })
      );

      const userMap = userData.reduce((acc, { id, data }) => {
        if (data) acc[id] = data;
        return acc;
      }, {});

      setUsers(userMap);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch user data.");
    }
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchChurchId(user.uid);
      }
    });
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [churchId]);

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;

  const filteredMessages = inboxMessages.filter((message) => {
    const appointment = appointments[message.appointmentId];
    const appointmentType = appointment ? appointmentTypeMapping[appointment.appointmentType] || "Unknown Appointment" : "Unknown Appointment";

    const matchesDate = selectedDate
      ? new Date(message.dateSent.toDate()).toDateString() === selectedDate.toDateString()
      : true;

    const matchesType = selectedAppointmentType === 'All' || appointmentType === selectedAppointmentType;

    return matchesDate && matchesType;
  });

  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="me-3">Sent Messages</h1>
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg" style={{ width: "85%" }}>
          <div className="card-body">
            <div className="row mb-4 align-items-center">
            <div className="col-md-4 d-flex align-items-center">
                <div className="form-group w-100 me-1">
                <label className="form-label"><b>Filter by Date:</b></label>
                <div className="input-group w-18">
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
            <div className="col-md-4 d-flex justify-content-start">
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
                  <th scope="col" className="pending-th">Date Sent</th>
                  <th scope="col" className="pending-th">Sent To</th>
                  <th scope="col" className="pending-th">Appointment Type</th>
                  <th scope="col" className="pending-th">Message Content</th>
                </tr>
              </thead>
              <tbody>
                {currentMessages.length > 0 ? (
                    currentMessages.map((message) => {
                        const user = users[message.userId];
                        const appointment = appointments[message.appointmentId];
                        const appointmentType = appointment
                        ? appointmentTypeMapping[appointment.appointmentType] || "Unknown Appointment"
                        : "Unknown Appointment";
                        return (
                        <tr key={message.id}>
                            <td>{message.dateSent.toDate().toLocaleString()}</td>
                            <td>{user ? `${user.firstName} ${user.lastName}` : "Unknown User"}</td>
                            <td>{appointmentType}</td>
                            <td>{stripHtmlTags(message.message)}</td>
                        </tr>
                        );
                    })
                    ) : (
                    <tr>
                        <td colSpan="4" className="text-center py-5">
                        <h4 className="text-muted">No messages found</h4>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
            {inboxMessages.length > 0 && (
              <Pagination className="justify-content-center">
                {[...Array(Math.ceil(inboxMessages.length / messagesPerPage)).keys()].map((number) => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;

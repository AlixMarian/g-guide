import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Modal, Pagination } from 'react-bootstrap';
import '../websiteUser.css';

export const WebsiteUserInbox = () => {
  const [userData, setUserData] = useState(null);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [churches, setChurches] = useState({});
  const [appointments, setAppointments] = useState({});
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;
  const navigate = useNavigate();
  
  const stripHtmlTags = (htmlString) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  const handleBackToHomepage = () => {
    navigate('/homepage');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const handleModalOpen = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    markAsRead(message.id); // Mark the message as read when opened
  };

  const markAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, "inboxMessage", messageId);
      // Update the `isRead` field and set the `status` field to "read"
      await updateDoc(messageRef, { isRead: true, status: "read" });
      setInboxMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true, status: "read" } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };
  

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            fetchInboxMessages(user.uid);
          } else {
            toast.error("User data not found");
          }
        } catch (error) {
          toast.error("Error fetching user data");
        }
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchInboxMessages = async (userId) => {
    try {
      const messagesQuery = query(
        collection(db, "inboxMessage"),
        where("userId", "==", userId)
      );
      const messageDocs = await getDocs(messagesQuery);
      const messages = messageDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const churchIds = [...new Set(messages.map((msg) => msg.churchId))];
      const appointmentIds = [...new Set(messages.map((msg) => msg.appointmentId))];

      await fetchChurches(churchIds);
      await fetchAppointments(appointmentIds);

      setInboxMessages(
        messages.sort((a, b) => b.dateSent.toDate() - a.dateSent.toDate())
      );
    } catch (error) {
      toast.error("Error fetching inbox messages");
      console.error(error);
    }
  };

  const fetchChurches = async (churchIds) => {
    try {
      const churchData = await Promise.all(
        churchIds.map(async (id) => {
          const churchDoc = await getDoc(doc(db, "church", id));
          return { id, data: churchDoc.exists() ? churchDoc.data() : null };
        })
      );
      const churchMap = churchData.reduce((acc, { id, data }) => {
        if (data) acc[id] = data;
        return acc;
      }, {});
      setChurches(churchMap);
    } catch (error) {
      toast.error("Error fetching church data");
      console.error(error);
    }
  };

  const fetchAppointments = async (appointmentIds) => {
    try {
      const appointmentData = await Promise.all(
        appointmentIds.map(async (id) => {
          const appointmentDoc = await getDoc(doc(db, "appointments", id));
          return { id, data: appointmentDoc.exists() ? appointmentDoc.data() : null };
        })
      );
      const appointmentMap = appointmentData.reduce((acc, { id, data }) => {
        if (data) acc[id] = data;
        return acc;
      }, {});
      setAppointments(appointmentMap);
    } catch (error) {
      toast.error("Error fetching appointment data");
      console.error(error);
    }
  };

  const appointmentTypeMapping = {
    marriageCertificate: "Marriage Certificate",
    birthCertificate: "Birth Certificate",
    baptismalCertificate: "Baptismal Certificate",
    burialCertificate: "Burial Certificate",
    confirmationCertificate: "Confirmation Certificate",
    baptism: "Baptism",
    burial:"Burial",
    marriage: "Marriage",
    confirmation: "Confirmation",
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = inboxMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="webUserInbox">
      <div className="container">
        <div className="row">
          <div className="col-12 mb-4">
            <button
              type="button"
              className="btn btn-custom-primary"
              onClick={handleBackToHomepage}
            >
              Back to Homepage
            </button>
          </div>
        </div>

        <h1>Hello, {userData ? userData.firstName : "Loading..."}</h1>

        <div className="col-12 mb-4">
        {inboxMessages.length === 0 ? (
          <div className='card'>
            <div className='card-body'>
              <h5 className='card-title'>No Messages</h5>
              <p className='card-text'>You haven&apos;t received any messages yet.</p>
            </div>
          </div>
        ) : (
          <>
            {currentMessages.map((message) => {
              const appointment = appointments[message.appointmentId];
              const church = churches[message.churchId];
              return (
                <div key={message.id} className="card mb-3">
                  <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <span className={`badge ${message.isRead ? "bg-secondary" : "bg-success"} me-2`}>
                        {message.isRead ? "Read" : "New"}
                      </span>
                      <h5 className="mb-0">
                        {appointment ? appointmentTypeMapping[appointment.appointmentType] : "Unknown Appointment"}
                      </h5>
                    </div>
                    <button className="btn btn-custom-primary" onClick={() => handleModalOpen(message)}>
                      Information
                    </button>
                  </div>
                    <p className="card-text">
                      <b>From:</b> {church ? church.churchName : "Unknown Church"}
                    </p>
                    <p className="card-text">
                      <b>Date Sent:</b> {message.dateSent.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
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
          </>
        )}
        </div>
      </div>

      {selectedMessage && (
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Message Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Appointment Type:</strong>{" "}
              {appointments[selectedMessage.appointmentId]
                ? appointmentTypeMapping[appointments[selectedMessage.appointmentId].appointmentType]
                : "Unknown Appointment"}
            </p>
            <p>
              <strong>From:</strong>{" "}
              {churches[selectedMessage.churchId]
                ? churches[selectedMessage.churchId].churchName
                : "Unknown Church"}
            </p>
            <p>
              <strong>Date Sent:</strong>{" "}
              {selectedMessage.dateSent.toDate().toLocaleString()}
            </p>
            <p>
            <p>
              <strong>Message:</strong> {selectedMessage ? stripHtmlTags(selectedMessage.message) : ""}
            </p>
            </p>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default WebsiteUserInbox;

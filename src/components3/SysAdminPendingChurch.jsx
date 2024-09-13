import { useState, useEffect } from 'react';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { db } from '/backend/firebase';
import { getDocs, doc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif'; // Import the GIF

export const SysAdminPendingChurch = () => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [modalContent, setModalContent] = useState('history'); // To track which modal content to show

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("Unauthorized access");
        navigate('/login');
      }
    });
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Show loading when data fetching starts
      try {
        // 1. Fetch all churches with status 'pending' from the 'church' collection
        const churchCollection = collection(db, 'church');
        const churchSnapshot = await getDocs(churchCollection);
        const churchList = churchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                  .filter(church => church.churchStatus === 'pending'); // Only 'pending' churches

        // Array to hold the processed church data
        const processedChurches = [];

        // 2. Iterate over each pending church to fetch the corresponding coordinator and user data
        for (const church of churchList) {
          if (!church.coordinatorID) continue;  // Skip if coordinatorID is missing

          // 2.1 Fetch the coordinator using coordinatorID from the 'coordinator' collection
          const coordinatorDocRef = doc(db, 'coordinator', church.coordinatorID);
          const coordinatorSnapshot = await getDoc(coordinatorDocRef);
          
          if (!coordinatorSnapshot.exists()) {
            console.log(`Coordinator not found for church: ${church.churchName}`);
            continue;
          }

          const coordinatorData = coordinatorSnapshot.data();
          
          // 2.2 Fetch the user details using userId from the 'users' collection
          const userDocRef = doc(db, 'users', coordinatorData.userId);
          const userSnapshot = await getDoc(userDocRef);
          
          if (!userSnapshot.exists()) {
            console.log(`User not found for coordinator: ${church.coordinatorID}`);
            continue;
          }

          const userData = userSnapshot.data();

          // Combine the church data with user details
          processedChurches.push({
            ...church,
            coordinatorName: `${userData.firstName || 'N/A'} ${userData.lastName || 'N/A'}`,
            coordinatorEmail: userData.email || 'N/A',
            coordinatorContactNum: userData.contactNum || 'N/A'
          });
        }

        // Update the state with the processed church data
        setChurches(processedChurches);
        setLoading(false); // Hide loading when data is fetched

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Hide loading if there is an error
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleShowModal = (church, content) => {
    setSelectedChurch(church);
    setModalContent(content); // 'history' or 'proof'
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChurch(null);
  };

  const renderProofOfAffiliation = (fileUrl) => {
    if (!fileUrl) {
      return <p>No proof of affiliation available.</p>;
    }

    const fileExtension = fileUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Church Proof" style={{ maxWidth: '100%', maxHeight: '500px' }} />;
    } else if (fileExtension === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          title="Church Proof"
          style={{ width: '100%', height: '500px', border: 'none' }}
        />
      );
    } else if (['doc', 'docx'].includes(fileExtension)) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Proof of Affiliation
        </a>
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Proof of Affiliation
        </a>
      );
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

const handleApprove = async (church) => {
  try {
    // Update the church's status in Firestore
    const churchRef = doc(db, "church", church.id);
    await updateDoc(churchRef, {
      churchStatus: "Approved"
    });

    const coordinatorRef = doc(db, "coordinator", church.coordinatorID); // Ensure coordinatorID is available in the church object
    await updateDoc(coordinatorRef, {
      status: "Approved"
    });

    // Send approval email
    await sendEmail(
      church.coordinatorEmail,  // Use the email of the church coordinator
      "Church Approval Notification",
      "Your church has been approved successfully. Thank you for your registration."
    );

    // Update the state by removing the approved church from the list
    setChurches((prevChurches) =>
      prevChurches.filter((c) => c.id !== church.id)
    );

    toast.success('Church approved successfully!');
  } catch (error) {
    console.error("Error approving church: ", error);
    toast.error('Failed to approve church');
  }
};


const handleDeny = async (church) => {
  try {
    const churchRef = doc(db, "church", church.id);
    await updateDoc(churchRef, {
      churchStatus: "Denied"
    });

    const coordinatorRef = doc(db, "coordinator", church.coordinatorID); // Ensure coordinatorID is available in the church object
    await updateDoc(coordinatorRef, {
      status: "Denied"
    });

    await sendEmail(
      church.coordinatorEmail,  
      "Church Rejection Notification",
      "We regret to inform you that your church registration has been rejected. For more details, please contact our support team."
    );

    setChurches((prevChurches) =>
      prevChurches.filter((c) => c.id !== church.id)
    );

    toast.success('Church rejected successfully!');
    handleCloseModal();
  } catch (error) {
    console.error("Error rejecting church: ", error);
    toast.error('Failed to reject church');
  }
};


  const filteredChurches = selectedStatus === 'All' ? churches : churches.filter(church => church.churchStatus === selectedStatus);

  return (
    <div className='pending-church-page'>
      <h3>Pending Church Registrations</h3>

      {loading ? ( 
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <img src={loadingGif} alt="Loading..." />
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th colSpan="3">Coordinator Information</th>
              <th colSpan="7">Church Information</th>
              <th rowSpan="2">Proof of Affiliation</th>
              <th rowSpan="2">Actions</th>
            </tr>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Church Name</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Address</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {filteredChurches.map((church) => {
              return (
                <tr key={church.id}>
                  
                  <td>{church.coordinatorName}</td>
                  <td>{church.coordinatorEmail}</td>
                  <td>{church.coordinatorContactNum}</td>
                  <td>{church.churchName}</td>
                  <td>{church.churchEmail}</td>
                  <td>{church.churchContactNum}</td>
                  <td>{church.churchAddress}</td>
                  <td>{new Date(church.churchRegistrationDate).toLocaleDateString()}</td>
                  <td>{church.churchStatus}</td>
                  <td>
                    <Button variant="info" className="view-history" onClick={() => handleShowModal(church, 'history')}>
                      View History
                    </Button>
                  </td>
                  <td>
                    <Button variant="info" className="view-proof" onClick={() => handleShowModal(church, 'proof')}>
                      View Proof
                    </Button>
                  </td>
                  <td className="pending-church-action">
                    <Button variant="success" className="approve" onClick={() => handleApprove(church)}>
                      Approve
                    </Button>
                    <Button variant="danger" className="deny" onClick={() => handleDeny(church)}>
                      Deny
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedChurch && modalContent === 'history' && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Church History</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ textAlign: 'justify', textJustify: 'auto' }}>
              {selectedChurch.churchHistory || 'No history available'}
            </p>
          </Modal.Body>
        </Modal>
      )}

      {selectedChurch && modalContent === 'proof' && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Proof of Affiliation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {renderProofOfAffiliation(selectedChurch.churchProof)}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default SysAdminPendingChurch;

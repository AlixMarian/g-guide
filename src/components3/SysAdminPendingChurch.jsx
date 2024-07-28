import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Table, Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from 'axios';

export const SysAdminPendingChurch = () => {
  const navigate = useNavigate();
  const [churchData, setChurchData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);

  useEffect(() => {
    const fetchPendingChurches = async () => {
      try {
        const churchCollection = collection(db, 'church');
        const churchSnapshot = await getDocs(churchCollection);
        const churchList = churchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mappedData = churchList.map((church) => {
          const user = usersList.find(user => user.id === church.id);
          return {
            ...church,
            lastName: user?.lastName || '',
            firstName: user?.firstName || '',
            email: user?.email || '',
            contactNum: user?.contactNum || '',
          };
        });

        setChurchData(mappedData.filter(church => church.churchStatus === 'pending'));
      } catch (error) {
        console.error('Error fetching church data: ', error);
      }
    };

    fetchPendingChurches();
  }, []);

  const handleShowModal = (church) => {
    setSelectedChurch(church);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChurch(null);
  };

  const handleApprove = async () => {
    if (selectedChurch) {
      const { id, email, name } = selectedChurch;

      if (!id) {
        toast.error('Selected church ID is missing.');
        return;
      }

      try {
        const churchDocRef = doc(db, 'church', id);
        await updateDoc(churchDocRef, { churchStatus: 'approved' });

        toast.success('Church approved');
        setChurchData(churchData.filter(church => church.id !== id));
        handleCloseModal();

        // Send a confirmation email
        await sendMail(email, name);
        toast.success('Confirmation email sent');
      } catch (error) {
        console.error('Error approving church:', error);
        toast.error('Failed to approve church.');
      }
    }
  };

  const sendMail = async (email, name) => {
    try {
      const response = await axios.post('http://localhost:3006/send-email', { email, name });
      if (response.status === 200) {
        return response.data.message;
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const sendRejectionMail = async (email, name) => {
    try {
      const response = await axios.post('http://localhost:3006/send-rejection-email', { email, name });
      if (response.status === 200) {
        return response.data.message;
      } else {
        throw new Error('Failed to send rejection email');
      }
    } catch (error) {
      console.error('Error sending rejection email:', error);
      throw error;
    }
  };

  const handleDeny = async () => {
    if (selectedChurch) {
      const { id, email, name } = selectedChurch;

      if (!id) {
        toast.error('Selected church ID is missing.');
        return;
      }

      try {
        const churchDocRef = doc(db, 'church', id);
        await updateDoc(churchDocRef, { churchStatus: 'rejected' });

        toast.success('Church rejected');
        setChurchData(churchData.filter(church => church.id !== id));
        handleCloseModal();

        await sendRejectionMail(email, name);
        toast.success('Rejection email sent');
      } catch (error) {
        console.error('Error rejecting church:', error);
        toast.error('Failed to reject church.');
      }
    }
  };

  function renderProofOfAffiliation(fileUrl) {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      // Render an image
      return <img src={fileUrl} alt="Church Proof" style={{ width: '100%' }} />;
    } else if (fileExtension === 'pdf') {
      // Render a PDF file
      return (
        <iframe
          src={fileUrl}
          title="Church Proof"
          style={{ width: '100%', height: '500px' }}
        />
      );
    } else if (['doc', 'docx'].includes(fileExtension)) {
      // Render a link for Word documents
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Proof of Affiliation
        </a>
      );
    } else {
      // Fallback for other file types
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Proof of Affiliation
        </a>
      );
    }
  }

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  return (
    <div className="container">
      <h1>Pending Church Registrations</h1>
      <br></br>
      <div style={{ display: 'grid', justifyContent: 'center' }}>
        <Table striped bordered hover style={{ width: '120%' }}>
          <thead>
            <tr>
              <th>Church Name</th>
              <th>Coordinator Last Name</th>
              <th>Coordinator First Name</th>
              <th>Coordinator Email</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {churchData.map(church => (
              <tr key={church.id}>
                <td>{church.churchName}</td>
                <td>{church.lastName}</td>
                <td>{church.firstName}</td>
                <td>{church.email}</td>
                <td>{new Date(church.churchRegistrationDate).toLocaleDateString()}</td>
                <td>
                  <Button variant="info" onClick={() => handleShowModal(church)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Submitted Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedChurch && (
              <>
                <h4>Church Coordinator Information</h4>
                <p><strong>Coordinator Last Name:</strong> {selectedChurch.lastName}</p>
                <p><strong>Coordinator First Name:</strong> {selectedChurch.firstName}</p>
                <p><strong>Coordinator Email:</strong> {selectedChurch.email}</p>
                <p><strong>Contact Number:</strong> {selectedChurch.contactNum}</p>

                <h4>Church Information</h4>
                <p><strong>Church Name:</strong> {selectedChurch.churchName}</p>
                <p><strong>Church Address:</strong> {selectedChurch.churchAddress}</p>
                <p><strong>Church Email:</strong> {selectedChurch.churchEmail}</p>
                <p><strong>Church Contact Number:</strong> {selectedChurch.churchContactNum}</p>
                <p><strong>Registration Date:</strong> {new Date(selectedChurch.churchRegistrationDate).toLocaleDateString()}</p>

                <h4>Proof of Affiliation</h4>
                {renderProofOfAffiliation(selectedChurch.churchProof)}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="success" onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="danger" onClick={handleDeny}>
              Deny
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default SysAdminPendingChurch;

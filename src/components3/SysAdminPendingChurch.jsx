import { useState, useEffect } from 'react';
import { db} from '/backend/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc} from 'firebase/firestore';
import { Table, Modal, Button } from 'react-bootstrap';
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from 'react-toastify';


export const SysAdminPendingChurch = () => {
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
      const { id} = selectedChurch;

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

      } catch (error) {
        console.error('Error in handleApprove: ', error);
        toast.error('Unable to approve the church');
        toast.error(error.message);
      }
    } else {
      toast.error('Unable to perform action. Selected church is undefined.');
    }
  };
  
  const handleDeny = async () => {
    if (selectedChurch) {
      try {
        // Send rejection email
        const functions = getFunctions();
        const sendRejectionEmail = httpsCallable(functions, 'sendRejectionEmail');
        await sendRejectionEmail({ email: selectedChurch.email });
        toast.success('Email sent to the church coordinator email');

        // Remove user and church from Firestore
        const userDocRef = doc(db, 'users', selectedChurch.userId);
        const churchDocRef = doc(db, 'church', selectedChurch.id);
        await deleteDoc(userDocRef);
        await deleteDoc(churchDocRef);

        // Remove from the displayed list
        setChurchData(churchData.filter(church => church.id !== selectedChurch.id));
        handleCloseModal();
      } catch (error) {
        toast.error('Unable to send email');
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

  return (
    <div className="container">
      <h1>Pending Church Registrations</h1>
      <Table striped bordered hover>
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
  );
};

export default SysAdminPendingChurch;

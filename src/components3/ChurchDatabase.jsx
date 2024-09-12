import { useState, useEffect } from 'react';
import { Table, Button, Modal, Dropdown } from 'react-bootstrap';
import { db } from '/backend/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


export const ChurchDatabase = () => {
  const [churches, setChurches] = useState([]);
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
    const fetchChurchData = async () => {
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
            profileImage: user?.profileImage || '',
          };
        });

        setChurches(mappedData);
      } catch (error) {
        console.error('Error fetching church data: ', error);
      }
    };

    fetchChurchData();
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
    setModalContent(content); // Track which content (history or proof) to show in modal

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
  

  const filteredChurches = selectedStatus === 'All' ? churches : churches.filter(church => church.churchStatus === selectedStatus);

  return (
    <div className='church-database-page'>
      <h3>Church Database</h3> <br/>
      <div className="mb-3">
        <Dropdown>
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            Filter Status
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleStatusChange('All')}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => handleStatusChange('pending')}>Pending</Dropdown.Item>
            <Dropdown.Item onClick={() => handleStatusChange('approved')}>Approved</Dropdown.Item>
            <Dropdown.Item onClick={() => handleStatusChange('denied')}>Denied</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <h4 className="mb-3">Now viewing: {selectedStatus}</h4>
      <table>
        <thead>
          <tr>
            <th colSpan="4">Coordinator Information</th>
            <th colSpan="7">Church Information</th>
            <th rowSpan="2">Proof of Affiliation</th> {/* Adjusted rowspan */}
          </tr>
          <tr>
            <th>Photo</th>
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
            const fullName = `${church.firstName || 'N/A'} ${church.lastName || 'N/A'}`;
            const email = church.email || 'N/A';
            const contactNum = church.contactNum || 'N/A';

            return (
              <tr key={church.id}>
                <td>
                  <img
                    src={church.profileImage || 'default-profile.jpg'}
                    alt="Profile"
                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                  />
                </td>
                <td>{fullName}</td>
                <td>{email}</td>
                <td>{contactNum}</td>
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

              </tr>
            );
          })}
        </tbody>
      </table>

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

export default ChurchDatabase;

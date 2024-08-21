import { useState, useEffect } from 'react';
import { Table, Button, Modal, Dropdown } from 'react-bootstrap';
import { db } from '/backend/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate} from 'react-router-dom';

export const ChurchDatabase = () => {
  const [churches, setChurches] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
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

  const handleShowModal = (church) => {
    setSelectedChurch(church);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChurch(null);
  };

  const renderProofOfAffiliation = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Church Proof" style={{ width: '100%' }} />;
    } else if (fileExtension === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          title="Church Proof"
          style={{ width: '100%', height: '500px' }}
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
    <div>
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
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Church Name</th>
            <th>Email</th>
            <th>Contact Number</th>
            <th>Address</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredChurches.map(church => (
            <tr key={church.id}>
              <td>{church.churchName}</td>
              <td>{church.churchEmail}</td>
              <td>{church.churchContactNum}</td>
              <td>{church.churchAddress}</td>
              <td>{church.churchStatus}</td>
              <td>
                <Button variant="info" onClick={() => handleShowModal(church)}>View Details</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selectedChurch && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Church Coordinator Information</h4>
            <div className="d-flex justify-content-center mb-3">
                <img src={selectedChurch.profileImage} alt="Profile" 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%' 
                  }} 
                />
              </div>
              <p><strong>Coordinator Last Name:</strong> {selectedChurch.lastName}</p>
              <p><strong>Coordinator First Name:</strong> {selectedChurch.firstName}</p>
              <p><strong>Coordinator Email:</strong> {selectedChurch.email}</p>
              <p><strong>Contact Number:</strong> {selectedChurch.contactNum}</p>
            <h4>Church Information</h4>
              <p><strong>Church Name:</strong> {selectedChurch.churchName}</p>
              <p><strong>Email:</strong> {selectedChurch.churchEmail}</p>
              <p><strong>Contact Number:</strong> {selectedChurch.churchContactNum}</p>
              <p><strong>Address:</strong> {selectedChurch.churchAddress}</p>
              <p><strong>Status:</strong> {selectedChurch.churchStatus}</p>
              <p><strong>Registration Date:</strong> {selectedChurch.churchRegistrationDate}</p>
              <p><strong>History:</strong> {selectedChurch.churchHistory}</p>
            <h4>Proof of Affiliation</h4>
              {renderProofOfAffiliation(selectedChurch.churchProof)}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default ChurchDatabase;

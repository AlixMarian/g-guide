import { useState, useEffect } from 'react';
import { Button, Modal, Dropdown, Pagination } from 'react-bootstrap';
import { db } from '/backend/firebase';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif'; 

export const ChurchDatabase = () => {
  const [churches, setChurches] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [modalContent, setModalContent] = useState('history');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 5; 

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
      setLoading(true);
      try {
        const churchCollection = collection(db, 'church');
        const churchSnapshot = await getDocs(churchCollection);
        const churchList = churchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const processedChurches = [];

        for (const church of churchList) {
          if (!church.coordinatorID) continue;  
          const coordinatorDocRef = doc(db, 'coordinator', church.coordinatorID);
          const coordinatorSnapshot = await getDoc(coordinatorDocRef);
          if (!coordinatorSnapshot.exists()) continue;
          const coordinatorData = coordinatorSnapshot.data();
          const userDocRef = doc(db, 'users', coordinatorData.userId);
          const userSnapshot = await getDoc(userDocRef);
          if (!userSnapshot.exists()) continue;
          const userData = userSnapshot.data();
          processedChurches.push({
            ...church,
            coordinatorName: `${userData.firstName || 'N/A'} ${userData.lastName || 'N/A'}`,
            coordinatorEmail: userData.email || 'N/A',
            coordinatorContactNum: userData.contactNum || 'N/A',
            profileImage: userData.profileImage || 'default-profile.jpg'
          });
        }

        setChurches(processedChurches);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching church data:', error);
        setLoading(false);
      }
    };

    fetchChurchData();
  }, []);

  const handleStatusChange = (status) => {
    console.log('Selected Status:', status); // Log selected filter
    setSelectedStatus(status);
    setCurrentPage(1);
  };
  

  const handleShowModal = (church, content) => {
    setSelectedChurch(church);
    setModalContent(content); 
    setModalContent(content);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChurch(null);
  };

  const roleTypeMapping = {
    pending: 'Pending',
    approved: 'Approved',
    archived: 'Archived',
  };

  const filteredChurches = selectedStatus === 'All'
  ? churches
  : churches.filter((church) =>
      (church.churchStatus || '').toLowerCase() === selectedStatus.toLowerCase()
  );

  const totalPages = Math.ceil(filteredChurches.length / itemsPerPage);
  const paginatedChurches = filteredChurches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='church-database-page'>
      <h1 className="me-3">Church Database</h1>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <img src={loadingGif} alt="Loading..." />
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Filter Status
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleStatusChange('All')}>All</Dropdown.Item>
                <Dropdown.Item onClick={() => handleStatusChange('pending')}>Pending</Dropdown.Item>
                <Dropdown.Item onClick={() => handleStatusChange('approved')}>Approved</Dropdown.Item>
                <Dropdown.Item onClick={() => handleStatusChange('archived')}>Archived</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <h4 className='mb-3'>
            Now viewing: {selectedStatus === 'All' ? 'All Entries' : roleTypeMapping[selectedStatus] || 'Unknown Role'}
          </h4>
          <table className='admin-table table table-striped table-bordered table-hover'>
            <thead>
              <tr>
                <th colSpan="4" className='pndngchrch-coor'>Coordinator Information</th>
                <th colSpan="7" className='pndngchrch-chrch'>Church Information</th>
                <th rowSpan="2" className='pndngchrch-act'>Proof of Affiliation</th>
              </tr>
              <tr>
                <th className='pndngchrch-coor2'>Photo</th>
                <th className='pndngchrch-coor2'>Full Name</th>
                <th className='pndngchrch-coor2'>Email</th>
                <th className='pndngchrch-coor2'>Contact Number</th>
                <th className='pndngchrch-chrch2'>Church Name</th>
                <th className='pndngchrch-chrch2'>Email</th>
                <th className='pndngchrch-chrch2'>Contact Number</th>
                <th className='pndngchrch-chrch2'>Address</th>
                <th className='pndngchrch-chrch2'>Registration Date</th>
                <th className='pndngchrch-chrch2'>Status</th>
                <th className='pndngchrch-chrch2'>Other</th>
              </tr>
            </thead>
            <tbody>
              {paginatedChurches.length > 0 ? (
                paginatedChurches.map((church) => (
                  <tr key={church.id}>
                    <td>
                      <img
                        src={church.profileImage || 'default-profile.jpg'}
                        alt="Profile"
                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                      />
                    </td>
                    <td>{church.coordinatorName}</td>
                    <td>{church.coordinatorEmail}</td>
                    <td>{church.coordinatorContactNum}</td>
                    <td>{church.churchName}</td>
                    <td>{church.churchEmail}</td>
                    <td>{church.churchContactNum}</td>
                    <td>{church.churchAddress}</td>
                    <td>{new Date(church.churchRegistrationDate).toLocaleDateString()}</td>
                    <td
                      style={{
                        color:
                          church.churchStatus === 'Approved'
                            ? 'green'
                            : church.churchStatus === 'Pending'
                            ? '#b8860b'
                            : church.churchStatus === 'Archived'
                            ? 'red'
                            : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      ●{church.churchStatus || 'N/A'}
                    </td>
                    <td>
                      <Button variant="primary" className="view-history mb-1" onClick={() => handleShowModal(church, 'history')}>
                        History
                      </Button>
                      <Button variant="primary" className="view-history" onClick={() => handleShowModal(church, 'refundPolicy')}>
                        Refund Policy
                      </Button>
                    </td>
                    <td>
                    <Button variant="primary" className="view-proof" onClick={() => window.open(church.churchProof, '_blank')}>
                      View Proof
                    </Button>
                    </td>
                  </tr>
                ))
              ):(
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center'}}>
                    No registered churches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
              {[...Array(totalPages).keys()].map((page) => (
                <Pagination.Item
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>

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

          {selectedChurch && modalContent === 'refundPolicy' && (
            <Modal show={showModal} onHide={handleCloseModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Refund Policy</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p style={{ textAlign: 'justify', textJustify: 'auto' }}>
                  {selectedChurch.refundPolicy || 'No refund policy available'}
                </p>
              </Modal.Body>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default ChurchDatabase;

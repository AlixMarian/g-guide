import { useState, useEffect } from 'react';
import { Button, Modal, Pagination} from 'react-bootstrap';
import { db } from '/backend/firebase';
import { getDocs, doc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';


export const SysAdminPendingChurch = () => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [modalContent, setModalContent] = useState('history');
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const churchCollection = collection(db, 'church');
        const churchSnapshot = await getDocs(churchCollection);
        const churchList = churchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(church =>
            church.churchStatus === 'Denied'
          );
        const processedChurches = [];
        for (const church of churchList) {
          if (!church.coordinatorID) continue;  
          const coordinatorDocRef = doc(db, 'coordinator', church.coordinatorID);
          const coordinatorSnapshot = await getDoc(coordinatorDocRef);
         
          if (!coordinatorSnapshot.exists()) {
            console.log(`Coordinator not found for church: ${church.churchName}`);
            continue;
          }


          const coordinatorData = coordinatorSnapshot.data();
          const userDocRef = doc(db, 'users', coordinatorData.userId);
          const userSnapshot = await getDoc(userDocRef);
         
          if (!userSnapshot.exists()) {
            console.log(`User not found for coordinator: ${church.coordinatorID}`);
            continue;
          }


          const userData = userSnapshot.data();


         
          processedChurches.push({
            ...church,
            coordinatorName: `${userData.firstName || 'N/A'} ${userData.lastName || 'N/A'}`,
            coordinatorEmail: userData.email || 'N/A',
            coordinatorContactNum: userData.contactNum || 'N/A'
          });
        }


       
        setChurches(processedChurches);
        setLoading(false);


      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };


    fetchData();
  }, []);


  const handleShowModal = (church, content) => {
    setSelectedChurch(church);
    setModalContent(content);
    setShowModal(true);
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChurch(null);
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
    const churchRef = doc(db, "church", church.id);
    await updateDoc(churchRef, {
      churchStatus: "Approved"
    });
    const coordinatorRef = doc(db, "coordinator", church.coordinatorID);
    await updateDoc(coordinatorRef, {
      status: "Active"
    });
    await sendEmail(
      church.coordinatorEmail,
      "Church Approval Notification",
      "We are writing to inform you of an important update regarding your church's approval status. After reviewing your application again, we discovered that the initial denial was due to an error in our system. We sincerely apologize for any confusion or inconvenience this may have caused. <br>We are pleased to inform you that your church has now been re-approved. If there are any additional steps you need to take or if you have any questions, please do not hesitate to reach out to us. We are here to assist you and ensure a smooth process going forward. <br>Thank you for your understanding, and we appreciate your patience in this matter."
    );
    setChurches((prevChurches) =>
      prevChurches.filter((c) => c.id !== church.id)
    );
    toast.success('Church approved successfully!');
  } catch (error) {
    console.error("Error approving church: ", error);
    toast.error('Failed to approve church');
  }
};


  const totalPages = Math.ceil(churches.length / itemsPerPage);
  const paginatedChurches = churches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className='pending-church-page'>
      <h1 className="me-3">Denied Church Registrations</h1>
     
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <img src={loadingGif} alt="Loading..." />
        </div>
      ) : (
      <div className="table-responsive">
        <table className="pending-table table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th colSpan="3" className='pndngchrch-coor'>Coordinator Information</th>
              <th colSpan="7" className='pndngchrch-chrch'>Church Information</th>
              <th rowSpan="2" className='pndngchrch-act'>Proof of Affiliation</th>
              <th rowSpan="2" className='pndngchrch-act'>Actions</th>
            </tr>
            <tr>
              <th className='pndngchrch-coor2'>Full Name</th>
              <th className='pndngchrch-coor2'>Email</th>
              <th className='pndngchrch-coor2'>Contact Number</th>
              <th className='pndngchrch-chrch2'>Church Name</th>
              <th className='pndngchrch-chrch2'>Email</th>
              <th className='pndngchrch-chrch2'>Contact Number</th>
              <th className='pndngchrch-chrch2'>Address</th>
              <th className='pndngchrch-chrch2'>Registration Date</th>
              <th className='pndngchrch-chrch2'>Status</th>
              <th className='pndngchrch-chrch2'>Refund Policy</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChurches.length > 0 ? (
              paginatedChurches.map((church) => (
                <tr key={church.id}>
                  <td>{church.coordinatorName}</td>
                  <td>{church.coordinatorEmail}</td>
                  <td>{church.coordinatorContactNum}</td>
                  <td>{church.churchName}</td>
                  <td>{church.churchEmail}</td>
                  <td>{church.churchContactNum}</td>
                  <td>{church.churchAddress}</td>
                  <td>{new Date(church.churchRegistrationDate).toLocaleDateString()}</td>
                  <td style={{color: 'red', fontWeight: 'bold'}}>{church.churchStatus}</td>
                  <td>
                    <Button
                      variant="primary"
                      className="view-refund-policy"
                      onClick={() => handleShowModal(church, 'refundPolicy')}
                    >
                      View Policy
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      className="view-proof"
                      onClick={() => window.open(church.churchProof, '_blank')}
                    >
                      View Proof
                    </Button>
                  </td>
                  <td className="pending-church-action">
                      <Button
                        variant="success"
                        className="approve mb-2"
                        onClick={() => handleApprove(church)}
                      >
                        Approve
                      </Button>
                  </td>
                </tr>
              ))
            ):(
              <tr>
                <td  colSpan="20" style={{ textAlign: 'center'}}>
                  No denied church registration
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
      </div>
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


    </div>
  );
};


export default SysAdminPendingChurch;
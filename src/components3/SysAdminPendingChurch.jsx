import { useState, useEffect } from 'react';
import { Button, Modal, Pagination} from 'react-bootstrap';
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
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [modalContent, setModalContent] = useState('history'); // To track which modal content to show
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 5; // Number of entries per page

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
                              .filter(church => 
                                  church.churchStatus === 'Pending' || 
                                  church.churchStatus === 'For Renewal'
                              );
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

  const handleShowModal = (church, content) => {
    setSelectedChurch(church);
    setModalContent(content); // 'refundPolicy' or 'proof'
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
    // Update the church's status in Firestore
    const churchRef = doc(db, "church", church.id);
    await updateDoc(churchRef, {
      churchStatus: "Approved"
    });

    const coordinatorRef = doc(db, "coordinator", church.coordinatorID); // Ensure coordinatorID is available in the church object
    await updateDoc(coordinatorRef, {
      status: "Active"
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

const handleRenew = async (church) => {
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
      "Church Renewal Notification",
      "Your church has been renewed successfully. Thank you for your renewal."
    );

    // Update the state by removing the approved church from the list
    setChurches((prevChurches) =>
      prevChurches.filter((c) => c.id !== church.id)
    );

    toast.success('Church renewed successfully!');
  } catch (error) {
    console.error("Error renweing church: ", error);
    toast.error('Failed to renew church');
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

  const totalPages = Math.ceil(churches.length / itemsPerPage);
  const paginatedChurches = churches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='pending-church-page'>
      <h1 className="me-3">Pending Church Registrations</h1>
      
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
            {paginatedChurches.map((church) => (
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
                  {church.churchStatus === 'For Renewal' ? (
                    <Button
                      variant="warning"
                      className="renew mb-2"
                      onClick={() => handleRenew(church)}
                    >
                      Renew
                    </Button>
                  ) : church.churchStatus === 'Pending' ? (
                    <Button
                      variant="success"
                      className="approve mb-2"
                      onClick={() => handleApprove(church)}
                    >
                      Approve
                    </Button>
                  ) : null}
                  <Button
                    variant="danger"
                    className="deny mb-2"
                    onClick={() => handleDeny(church)}
                  >
                    Deny
                  </Button>
                </td>
              </tr>
            ))}
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

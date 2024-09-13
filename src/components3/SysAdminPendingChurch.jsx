// import { useState, useEffect } from 'react';
// import { db } from '/backend/firebase';
// import { useNavigate } from 'react-router-dom';
// import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
// import { Table, Modal, Button } from 'react-bootstrap';
// import { toast } from 'react-toastify';
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import axios from 'axios';

// export const SysAdminPendingChurch = () => {
//   const navigate = useNavigate();
//   const [churchData, setChurchData] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedChurch, setSelectedChurch] = useState(null);

//   const fetchPendingChurches = async () => {
//     try {
//       const churchCollection = collection(db, 'church');
//       const churchSnapshot = await getDocs(churchCollection);
//       const churchList = churchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//       const usersCollection = collection(db, 'users');
//       const usersSnapshot = await getDocs(usersCollection);
//       const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//       const mappedData = churchList.map((church) => {
//         const user = usersList.find(user => user.id === church.id);
//         return {
//           ...church,
//           lastName: user?.lastName || '',
//           firstName: user?.firstName || '',
//           email: user?.email || '',
//           contactNum: user?.contactNum || '',
//         };
//       });

//       setChurchData(mappedData.filter(church => church.churchStatus === 'pending'));
//     } catch (error) {
//       console.error('Error fetching church data: ', error);
//     }
//   };

//   useEffect(() => {
//     fetchPendingChurches();
//   }, []);

//   const handleShowModal = (church) => {
//     setSelectedChurch(church);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedChurch(null);
//   };

//   const handleApprove = async () => {
//     if (selectedChurch) {
//       const { id, churchName, email } = selectedChurch;

//       if (!id) {
//         toast.error('Selected church ID is missing.');
//         return;
//       }

//       try {
        
//         await fetchPendingChurches();

//         const churchDocRef = doc(db, 'church', id);
//         await updateDoc(churchDocRef, { churchStatus: 'approved' });

//         toast.success('Church approved');
//         setChurchData(churchData.filter(church => church.id !== id));
//         handleCloseModal();

        
//         await sendMail(email, churchName); 
//         toast.success('Confirmation email sent');
//       } catch (error) {
//         console.error('Error approving church:', error);
//         toast.error('Failed to approve church.');
//       }
//     }
//   };

//   const sendMail = async (email, name) => {
//     try {
//       const response = await axios.post('http://localhost:3006/send-email', { email, name });
//       if (response.status === 200) {
//         return response.data.message;
//       } else {
//         throw new Error('Failed to send email');
//       }
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw error;
//     }
//   };

//   const sendRejectionMail = async (email, name) => {
//     try {
//       const response = await axios.post('http://localhost:3006/send-rejection-email', { email, name });
//       if (response.status === 200) {
//         return response.data.message;
//       } else {
//         throw new Error('Failed to send rejection email');
//       }
//     } catch (error) {
//       console.error('Error sending rejection email:', error);
//       throw error;
//     }
//   };

//   const handleDeny = async () => {
//     if (selectedChurch) {
//       const { id, churchName, email } = selectedChurch;

//       if (!id) {
//         toast.error('Selected church ID is missing.');
//         return;
//       }

//       try {
       
//         await fetchPendingChurches();

//         const churchDocRef = doc(db, 'church', id);
//         await updateDoc(churchDocRef, { churchStatus: 'rejected' });

//         toast.success('Church rejected');
//         setChurchData(churchData.filter(church => church.id !== id));
//         handleCloseModal();

//         await sendRejectionMail(email, churchName);
//         toast.success('Rejection email sent');
//       } catch (error) {
//         console.error('Error rejecting church:', error);
//         toast.error('Failed to reject church.');
//       }
//     }
//   };

//   function renderProofOfAffiliation(fileUrl) {
//     const fileExtension = fileUrl.split('.').pop().toLowerCase();

//     if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      
//       return <img src={fileUrl} alt="Church Proof" style={{ width: '100%' }} />;
//     } else if (fileExtension === 'pdf') {
      
//       return (
//         <iframe
//           src={fileUrl}
//           title="Church Proof"
//           style={{ width: '100%', height: '500px' }}
//         />
//       );
//     } else if (['doc', 'docx'].includes(fileExtension)) {
      
//       return (
//         <a href={fileUrl} target="_blank" rel="noopener noreferrer">
//           Download Proof of Affiliation
//         </a>
//       );
//     } else {
      
//       return (
//         <a href={fileUrl} target="_blank" rel="noopener noreferrer">
//           Download Proof of Affiliation
//         </a>
//       );
//     }
//   }

//   useEffect(() => {
//     const auth = getAuth();
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         console.log("User signed in:", user);
//       } else {
//         console.log("No user signed in.");
//         navigate('/login');
//       }
//     });
//   }, [navigate]);

//   return (
//     <div className="pending-church-page">
//       <h3>Pending Church Registrations</h3>
//       <div style={{ display: 'grid', justifyContent: 'center' }}>
//         <Table striped bordered hover style={{ width: '100%' }}>
//           <thead>
//             <tr>
//               <th>Church Name</th>
//               <th>Coordinator Last Name</th>
//               <th>Coordinator First Name</th>
//               <th>Coordinator Email</th>
//               <th>Registration Date</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {churchData.map(church => (
//               <tr key={church.id}>
//                 <td>{church.churchName}</td>
//                 <td>{church.lastName}</td>
//                 <td>{church.firstName}</td>
//                 <td>{church.email}</td>
//                 <td>{new Date(church.churchRegistrationDate).toLocaleDateString()}</td>
//                 <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <Button variant="info"  onClick={() => handleShowModal(church)}>
//                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
//                       <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
//                     </svg>
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>

//         <Modal show={showModal} onHide={handleCloseModal}>
//           <Modal.Header closeButton>
//             <Modal.Title>Submitted Information</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {selectedChurch && (
//               <>
//                 <h4>Church Coordinator Information</h4>
//                 <p><strong>Coordinator Last Name:</strong> {selectedChurch.lastName}</p>
//                 <p><strong>Coordinator First Name:</strong> {selectedChurch.firstName}</p>
//                 <p><strong>Coordinator Email:</strong> {selectedChurch.email}</p>
//                 <p><strong>Contact Number:</strong> {selectedChurch.contactNum}</p>

//                 <h4>Church Information</h4>
//                 <p><strong>Church Name:</strong> {selectedChurch.churchName}</p>
//                 <p><strong>Church Address:</strong> {selectedChurch.churchAddress}</p>
//                 <p><strong>Church Email:</strong> {selectedChurch.churchEmail}</p>
//                 <p><strong>Church Contact Number:</strong> {selectedChurch.churchContactNum}</p>
//                 <p><strong>Registration Date:</strong> {new Date(selectedChurch.churchRegistrationDate).toLocaleDateString()}</p>

//                 <h4>Proof of Affiliation</h4>
//                 {renderProofOfAffiliation(selectedChurch.churchProof)}
//               </>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Close
//             </Button>
//             <Button variant="success" className="pending-church-action" onClick={handleApprove}>
//               Approve
//             </Button>
//             <Button variant="danger" onClick={handleDeny}>
//               Deny
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default SysAdminPendingChurch;

import { useState, useEffect } from 'react';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { db } from '/backend/firebase';
import { getDocs, doc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const SysAdminPendingChurch = () => {
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
    const fetchData = async () => {
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

      } catch (error) {
        console.error('Error fetching data:', error);
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

  const handleApprove = async (church) => {
    try {
      const churchDocRef = doc(db, 'church', church.id);
      await updateDoc(churchDocRef, { churchStatus: 'approved' });

      toast.success('Church approved');
      setChurches((prevChurches) => prevChurches.filter(c => c.id !== church.id));
    } catch (error) {
      console.error('Error approving church:', error);
      toast.error('Failed to approve church.');
    }
  };

  const handleDeny = async (church) => {
    try {
      const churchDocRef = doc(db, 'church', church.id);
      await updateDoc(churchDocRef, { churchStatus: 'rejected' });
      toast.success('Church rejected');
      setChurches((prevChurches) => prevChurches.filter(c => c.id !== church.id));
    } catch (error) {
      console.error('Error rejecting church:', error);
      toast.error('Failed to reject church.');
    }
  };

  const filteredChurches = selectedStatus === 'All' ? churches : churches.filter(church => church.churchStatus === selectedStatus);

  return (
    <div className='pending-church-page'>
      <h3>Pending Church Registrations</h3>
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

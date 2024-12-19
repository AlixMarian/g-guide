import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Table, Modal, Button, Pagination} from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import '../churchCoordinator.css';

const PaymentHistory = () => {
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 7;
  
    useEffect(() => {
        const fetchPaymentHistory = async () => {
          const auth = getAuth();
          const currentUser = auth.currentUser;
      
          if (!currentUser) {
            console.log('No user is logged in.');
            return;
          }
      
          console.log('Logged in user:', currentUser);
      
          try {
            
            const coordinatorQuery = query(
              collection(db, 'coordinator'),
              where('userId', '==', currentUser.uid)
            );
            const coordinatorSnapshot = await getDocs(coordinatorQuery);
      
            if (coordinatorSnapshot.empty) {
              console.log('No coordinator found for this user.');
              return;
            }
      
            const coordinatorData = coordinatorSnapshot.docs[0].data();
            const coordinatorID = coordinatorSnapshot.docs[0].id;
            console.log('Coordinator Data:', coordinatorData);
            console.log('Coordinator ID:', coordinatorID);
      
           
            const churchQuery = query(
              collection(db, 'church'),
              where('coordinatorID', '==', coordinatorID)
            );
            const churchSnapshot = await getDocs(churchQuery);
      
            if (churchSnapshot.empty) {
              console.log('No church found for this coordinator.');
              return;
            }
      
            const churchData = churchSnapshot.docs[0].data();
            const churchID = churchSnapshot.docs[0].id;
            console.log('Church Data:', churchData);
            console.log('Church ID:', churchID);
      
            
            const paymentQuery = query(
              collection(db, 'appointments'),
              where('churchId', '==', churchID),
              where('appointmentStatus', 'in', ['For Payment', 'Approved', 'Denied'])
            );
      
            const paymentSnapshot = await getDocs(paymentQuery);
            const paymentData = paymentSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((appointment) => appointment.appointments?.paymentImage && appointment.appointments?.paymentImage !== 'none')
            .sort((a, b) => {
              const dateA = a.userFields?.paymentUploadDate?.seconds || 0;
              const dateB = b.userFields?.paymentUploadDate?.seconds || 0;
              return dateB - dateA; 
          })
            ;
      
            console.log('Fetched Payment Appointments:', paymentData);
            setPaymentHistory(paymentData);
          } catch (error) {
            console.error('Error fetching payment history:', error);
          }
        };
      
        onAuthStateChanged(getAuth(), (user) => {
          if (user) {
            setUser(user);
            fetchPaymentHistory();
          }
        });
      }, []);
    
      const appointmentTypeMapping = {
        marriageCertificate: "Marriage Certificate",
        birthCertificate: "Birth Certificate",
        baptismalCertificate: "Baptismal Certificate",
        burialCertificate: "Burial Certificate",
        confirmationCertificate: "Confirmation Certificate",
        baptism: "Baptism",
        burial: "Burial",
        marriage: "Wedding",
        confirmation: "Confirmation",
    };

    const totalPages = Math.ceil(paymentHistory.length / entriesPerPage);
    const paginatedEntries = paymentHistory.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
      
  
    return (
      <>
      <h1 className='me-3'>Payment History</h1>
      <div className='d-flex justify-content-center align-items-center mt-5'>
        <div className='card shadow-lg' style={{width: "85%"}}>
            <div className='card-body'>
            <Table striped bordered hover responsive>
            <thead className="table-dark">
            <tr>
              <th className='payment-th'>Payment ID</th>
              <th className='payment-th'>Requester ID</th>
              <th className='payment-th'>Requester Name</th>
              <th className='payment-th'>Request Made</th>
              <th className='payment-th'>Payment Date</th>
              <th className='payment-th'>Payment Image</th>
            </tr>
          </thead>
          <tbody>
          {paginatedEntries.length > 0 ? (
              paginatedEntries.map((appointment) => (
                <tr key={appointment.id}>
                    <td className='payment-td'>{appointment.id}</td>
                    <td className='payment-td'>{appointment.userFields?.requesterId || 'N/A'}</td>
                    <td className='payment-td'>{appointment.userFields?.requesterName || 'N/A'}</td>
                    <td className='payment-td'>{appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}</td>
                    <td className='payment-td'>
                        {appointment.appointments?.paymentUploadDate
                            ? new Date(
                                appointment.appointments.paymentUploadDate.seconds * 1000
                            ).toLocaleString()
                            : 'N/A'}
                    </td>
                    <td className='payment-td'>
                        {appointment.appointments?.paymentImage ? (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setSelectedImage(appointment.appointments.paymentImage);
                                    setShowImageModal(true);
                                }}
                            >
                                View Receipt
                            </Button>
                        ) : (
                            'N/A'
                        )}
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="6" className="text-center py-5">
                    <h4 className="text-muted">No payment history found</h4>
                </td>
            </tr>
        )}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <Pagination className="justify-content-center">
          {[...Array(totalPages).keys()].map((page) => (
              <Pagination.Item
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => handlePageChange(page + 1)}
              >
                  {page + 1}
              </Pagination.Item>
          ))}
          </Pagination>
        )}
        </div>
        </div>
      </div>
      
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Receipt Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Receipt"
              className="img-fluid"
              style={{ maxHeight: "80vh", maxWidth: "100%" }}
            />
          ) : (
            "No image available"
          )}
        </Modal.Body>
      </Modal>
      </>
    );
  };
  
  export default PaymentHistory;
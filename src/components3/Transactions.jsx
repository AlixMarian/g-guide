import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase'; 
import { Button, Modal, Pagination } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif'; 
import '../systemAdmin.css'; 

export const Transactions = () => {
  const [payments, setPayments] = useState([]);
  const [churches, setChurches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState('All');
  const [selectedDate, setSelectedDate] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 10; 

 
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const churchSnapshot = await getDocs(collection(db, 'church'));
        const churchList = churchSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().churchName,
        }));
        setChurches(churchList);
      } catch (error) {
        console.error('Error fetching churches:', error);
      }
    };

    fetchChurches();
  }, []);

    
    useEffect(() => {
      const fetchPayments = async () => {
        try {
          const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
          const appointmentsList = await Promise.all(
            appointmentsSnapshot.docs.map(async (appointmentDoc) => {
              const appointmentData = appointmentDoc.data();
  
              
              let churchName = 'Unknown';
              if (appointmentData.churchId) {
                const churchDocRef = doc(db, 'church', appointmentData.churchId);
                const churchDoc = await getDoc(churchDocRef);
                if (churchDoc.exists()) {
                  churchName = churchDoc.data().churchName;
                }
              }
  
             
              const dateCreated = appointmentData.userFields?.dateOfRequest?.toDate?.() || new Date();
  
              
              if (appointmentData.appointments?.paymentImage) {
                return {
                  paymentId: appointmentDoc.id,
                  dateCreated: dateCreated,
                  formattedDate: dateCreated.toLocaleDateString(), 
                  churchName,
                  userId: appointmentData.userFields?.requesterId || 'Unknown User',
                  amountPaid: appointmentData.appointments?.paymentImage || null, 
                };
              } else {
                return null; 
              }
            })
          );
  
          
          const filteredAppointments = appointmentsList.filter(appointment => appointment !== null);
  
          setPayments(filteredAppointments);
        } catch (error) {
          console.error('Error fetching payments:', error);
        } finally {
          setLoading(false); 
        }
      };
  
      fetchPayments();
    }, []);

  const handleViewPaymentImage = (imageUrl) => {
    setSelectedPaymentImage(imageUrl);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPaymentImage(null);
  };

  const handleChurchChange = (churchId) => {
    setSelectedChurch(churchId);
  };

  const filteredPayments = payments.filter((payment) => {
    
    const churchMatch = selectedChurch === 'All' || payment.churchName === selectedChurch;

    
    const dateMatch = selectedDate ? payment.dateCreated.toLocaleDateString() === selectedDate.toLocaleDateString() : true;

    return churchMatch && dateMatch;
  });

  
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="transactions-page">
      <h1 className="me-3">User Transactions</h1>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <img src={loadingGif} alt="Loading..." />
        </div>
      ) : (
        <>
        <div className="filtering mb-3">
          <div className="d-flex align-items-start gap-4">
            <div className="form-group">
              <label className="form-label"><b>Filter by Church:</b></label>
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  {selectedChurch === 'All' ? 'All Churches' : selectedChurch}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleChurchChange('All'); }}>
                      All Churches
                    </a>
                  </li>
                  {churches.map((church) => (
                    <li key={church.id}>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleChurchChange(church.name); }}
                      >
                        {church.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><b>Filter by Date:</b></label>
              <div className="input-group">
                <DatePicker
                  className="form-control"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  showYearDropdown
                />
                <button className="btn btn-danger" onClick={() => setSelectedDate(null)}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>


          <h4 className="mb-3">
            Now viewing transactions for: {selectedChurch} Entries on {selectedDate ? selectedDate.toLocaleDateString() : 'All Dates'}
          </h4>

          <table className="admin-table table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className='custom-th'>Payment ID</th>
                <th className='custom-th'>Date of Transaction</th>
                <th className='custom-th'>Church Name</th>
                <th className='custom-th'>User ID</th>
                <th className='custom-th'>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td>{payment.paymentId}</td>
                    <td>{payment.formattedDate}</td>
                    <td>{payment.churchName}</td>
                    <td>{payment.userId}</td>
                    <td>
                      {payment.amountPaid ? (
                        <Button variant="primary" className="view-payment" onClick={() => handleViewPaymentImage(payment.amountPaid)}>
                          View Payment
                        </Button>
                      ) : (
                        'No Payment Image'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No transactions available
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
        </>
      )}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {selectedPaymentImage ? (
              <img
                src={selectedPaymentImage}
                alt="Payment Proof"
                style={{ maxWidth: '100%', maxHeight: '500px' }}
              />
            ) : (
              <p>No payment image available.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Transactions;

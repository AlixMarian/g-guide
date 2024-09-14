import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase'; // Adjust path based on your project structure
import { Button, Modal, Dropdown } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import styles for react-datepicker
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif'; 
import '../systemAdmin.css'; // Ensure this file has the necessary CSS styles

export const Transactions = () => {
  const [payments, setPayments] = useState([]);
  const [churches, setChurches] = useState([]); // Store list of churches
  const [loading, setLoading] = useState(true);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState(null); // For modal
  const [showModal, setShowModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState('All');
  const [selectedDate, setSelectedDate] = useState(null); // For react-datepicker

  // Fetch church list from Firestore
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

  // Fetch payments from Firestore
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
        const appointmentsList = await Promise.all(
          appointmentsSnapshot.docs.map(async (appointmentDoc) => {
            const appointmentData = appointmentDoc.data();

            // Fetch the church name using the churchId from the 'church' collection
            let churchName = 'Unknown';
            if (appointmentData.churchId) {
              const churchDocRef = doc(db, 'church', appointmentData.churchId);
              const churchDoc = await getDoc(churchDocRef);
              if (churchDoc.exists()) {
                churchName = churchDoc.data().churchName;
              }
            }

            // Convert Firestore timestamp to a JavaScript Date object
            const dateCreated = appointmentData.userFields?.dateOfRequest?.toDate?.() || new Date();

            return {
              paymentId: appointmentDoc.id,
              dateCreated: dateCreated,
              formattedDate: dateCreated.toLocaleDateString(), // For displaying
              churchName,
              userId: appointmentData.userFields?.requesterId || 'Unknown User',
              amountPaid: appointmentData.appointments?.paymentImage || null, // Check if the payment image exists
            };
          })
        );

        setPayments(appointmentsList);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false); // Ensure loading is set to false in the finally block
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderPaymentImage = (fileUrl) => {
    if (!fileUrl) {
      return <p>No payment image available.</p>;
    }

    const fileExtension = fileUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Payment Proof" style={{ maxWidth: '100%', maxHeight: '500px' }} />;
    } else if (fileExtension === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          title="Payment Proof"
          style={{ width: '100%', height: '500px', border: 'none' }}
        />
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Payment Proof
        </a>
      );
    }
  };

  const filteredPayments = payments.filter((payment) => {
    // Filter by church
    const churchMatch = selectedChurch === 'All' || payment.churchName === selectedChurch;

    // Filter by selected date
    const dateMatch = selectedDate ? payment.dateCreated.toLocaleDateString() === selectedDate.toLocaleDateString() : true;

    return churchMatch && dateMatch;
  });

  return (
    <div className="transactions-page">
      <h3>User Transactions</h3>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <img src={loadingGif} alt="Loading..." />
        </div>
      ) : (
        <>
        <div className='filter-container'>
          {/* Dropdown to filter by church */}
          <div className="mb-3">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-church">
                Filter by Church
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleChurchChange('All')}>All Churches</Dropdown.Item>
                {churches.map((church) => (
                  <Dropdown.Item key={church.id} onClick={() => handleChurchChange(church.name)}>
                    {church.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Date Picker styled like dropdown */}
          <div className="mb-3">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-date">
                {selectedDate ? selectedDate.toLocaleDateString() : 'Filter by Date'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                  customInput={
                    <Button variant="primary">
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Select Date'}
                    </Button>
                  }
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
          </div>

          <h4 className="mb-3">
            Now viewing transactions for: {selectedChurch} on {selectedDate ? selectedDate.toLocaleDateString() : 'All Dates'}
          </h4>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date Created</th>
                <th>Church Name</th>
                <th>User ID</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td>{payment.paymentId}</td>
                    <td>{payment.formattedDate}</td>
                    <td>{payment.churchName}</td>
                    <td>{payment.userId}</td>
                    <td>
                      {payment.amountPaid ? (
                        <Button variant="info" className="view-payment" onClick={() => handleViewPaymentImage(payment.amountPaid)}>
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
                    No payment data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Modal to display the payment image */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {renderPaymentImage(selectedPaymentImage)}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Transactions;

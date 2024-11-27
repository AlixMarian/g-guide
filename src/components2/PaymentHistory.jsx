import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Table } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import '../churchCoordinator.css';

const PaymentHistory = () => {
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
  
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
            // Step 1: Fetch Coordinator info for the current user
            const coordinatorQuery = query(
              collection(db, 'coordinator'),
              where('userId', '==', currentUser.uid)
            );
            const coordinatorSnapshot = await getDocs(coordinatorQuery);
      
            if (coordinatorSnapshot.empty) {
              console.log('No coordinator found for this user.');
              return;
            }
      
            const coordinatorData = coordinatorSnapshot.docs[0].data(); // Assuming only one coordinator per user
            const coordinatorID = coordinatorSnapshot.docs[0].id;
            console.log('Coordinator Data:', coordinatorData);
            console.log('Coordinator ID:', coordinatorID);
      
            // Step 2: Fetch Church info associated with this coordinator
            const churchQuery = query(
              collection(db, 'church'),
              where('coordinatorID', '==', coordinatorID)
            );
            const churchSnapshot = await getDocs(churchQuery);
      
            if (churchSnapshot.empty) {
              console.log('No church found for this coordinator.');
              return;
            }
      
            const churchData = churchSnapshot.docs[0].data(); // Assuming only one church per coordinator
            const churchID = churchSnapshot.docs[0].id;
            console.log('Church Data:', churchData);
            console.log('Church ID:', churchID);
      
            // Step 3: Fetch Appointments for the church with payment details
            const paymentQuery = query(
              collection(db, 'appointments'),
              where('churchId', '==', churchID),
              where('appointmentStatus', 'in', ['For Payment', 'Approved', 'Denied']) // Fetching appointments that are either "For Payment" or "Approved"
            );
      
            const paymentSnapshot = await getDocs(paymentQuery);
            const paymentData = paymentSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
      
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
        marriage: "Marriage",
        confirmation: "Confirmation",
    };
      
  
    return (
      <>
      <h1 className='me-3'>Payment History</h1>
      <div className='d-flex justify-content-center align-items-center mt-5'>
        <div className='card shadow-lg' style={{width: "80%"}}>
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
            {paymentHistory.length > 0 ? (
              paymentHistory.map((appointment) => (
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
                      <a
                        href={appointment.appointments.paymentImage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Receipt
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No payment history available.</td>
              </tr>
            )}
          </tbody>
        </Table>
            </div>
        </div>
      </div>
      </>
    );
  };
  
  export default PaymentHistory;
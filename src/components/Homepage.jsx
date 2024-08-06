import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import '../websiteUser.css';
import useChatbot from './Chatbot';
import { Modal, Button} from 'react-bootstrap'; 
import { toast } from 'react-toastify';

export const Homepage = () => {
  const navigate = useNavigate();
  const [bookmarkedChurches, setBookmarkedChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [churches, setChurches] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useChatbot();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
        fetchBookmarkedChurches(user.uid);
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchBookmarkedChurches = async (userId) => {
    try {
      const bookmarksQuery = query(collection(db, 'userBookmark'), where('webUserId', '==', userId));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);

      const churchIds = bookmarksSnapshot.docs.map(doc => doc.data().churchId);
      const churchPromises = churchIds.map(churchId => getDoc(doc(db, 'church', churchId)));
      const churchSnapshots = await Promise.all(churchPromises);

      const churches = churchSnapshots.map(churchDoc => ({
        id: churchDoc.id,
        ...churchDoc.data()
      }));

      setBookmarkedChurches(churches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarked churches:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const q = query(collection(db, 'appointments'), where('userFields.requesterId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const userAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAppointments(userAppointments);

          
          const churchIds = [...new Set(userAppointments.map(app => app.churchId))];

          
          if (churchIds.length > 0) {
            const churchesData = await Promise.all(
              churchIds.map(id => getDoc(doc(db, 'church', id)))
            );

           
            const churchMap = churchesData.reduce((acc, doc) => {
              if (doc.exists()) {
                acc[doc.id] = doc.data();
              }
              return acc;
            }, {});

            setChurches(churchMap);
          }

        } catch (error) {
          toast.error('Error fetching appointments: ' + error.message);
        }
      }
    };

    fetchAppointments();
  }, [user]);

  const appointmentTypeMapping = {
    marriageCertificate: "Marriage Certificate",
    birthCertificate: "Birth Certificate",
    baptismalCertificate: "Baptismal Certificate",
    burialCertificate: "Burial Certificate",
    confirmationCertificate: "Confirmation Certificate",
  };
  
  const handleShowModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const renderPaymentImage = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      
      return <img src={fileUrl} alt="Payment Proof" style={{ width: '100%' }} />;
    } else if (fileExtension === 'pdf') {
      
      return (
        <iframe src={fileUrl} title="Payment Proof" style={{ width: '100%', height: '500px' }}/>
      );
    } else if (['doc', 'docx'].includes(fileExtension)) {
      
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download Payment Proof</a>
      );
    } else {
      
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Payment Proof
        </a>
      );
    }
  };

  const renderDeathCertificate = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      
      return <img src={fileUrl} alt="Death Certificate" style={{ width: '100%' }} />;
    } else if (fileExtension === 'pdf') {
      
      return (
        <iframe
          src={fileUrl}
          title="Death Certificate"
          style={{ width: '100%', height: '500px' }}
        />
      );
    } else if (['doc', 'docx'].includes(fileExtension)) {
      
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Death Certificate
        </a>
      );
    } else {
      
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download Death Certificate
        </a>
      );
    }
  };

  const handleViewAppnts = () => {
    navigate('/view-appointments');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="homepage-container d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">In need of a local church?</h5>
                <p className="card-text">We can help you find your nearest church, get up-to-date information, and connect with them</p>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/map')}>Open Maps</button>
              </div>
              <img src="src/assets/mapImg.png" className="card-img-bottom" alt="..." />
            </div>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title"><b>Bookmarked Churches</b></h5>
                {bookmarkedChurches.length > 0 ? (
                  bookmarkedChurches.map((church) => (
                    <div className="card w-100 mb-3" key={church.id}>
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                          <h5 className="card-title mb-0">{church.churchName}</h5>
                          <p className="card-text mb-0">{church.location}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => navigate(`/church-homepage/${church.id}`)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                            <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1" />
                          </svg> Visit Church Information Page
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No Bookmarks</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0"><b>Ongoing Appointments</b></h5>
                <button type="button" className="btn btn-primary ms-3" onClick={handleViewAppnts}>View Appointment History</button>
              </div>
              <div className="card-body">
                <div className="row">
                  {appointments.length > 0 ? (
                    appointments
                      .filter(appointment => appointment.appointmentStatus === "pending")
                      .map(appointment => {
                        const church = churches[appointment.churchId];
                        return (
                          <div key={appointment.id} className="col-12 mb-3">
                            <div className="card">
                              <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                  <h5 className="card-title mb-0">{appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}</h5>
                                  <p className="card-text mb-0"><b>Status: {appointment.appointmentStatus}</b></p>
                                  {church && <p className='card-text mb-0'>Church Name: {church.churchName}</p>}
                                </div>
                                <button className='btn btn-info' onClick={() => handleShowModal(appointment)}>View Information</button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p>No appointments found.</p>
                  )}
                  <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {selectedAppointment && (
                        <div>
                          <h4>Appointment Details</h4>
                          <p><b>Type:</b> {appointmentTypeMapping[selectedAppointment.appointmentType] || selectedAppointment.appointmentType}</p>
                          <p><b>Status:</b> {selectedAppointment.appointmentStatus}</p>
                          <p><b>Requester Contact:</b> {selectedAppointment.userFields.requesterContact}</p>
                          <p><b>Requester Email:</b> {selectedAppointment.userFields.requesterEmail}</p>
                          <p><b>Date of Request:</b> {new Date(selectedAppointment.userFields.dateOfRequest.seconds * 1000).toLocaleString()}</p>
                          {selectedAppointment.churchId && churches[selectedAppointment.churchId] && (
                            <div>
                              <br />
                              <h4>Church Information</h4>
                              <p><b>Church Name:</b> {churches[selectedAppointment.churchId].churchName}</p>
                              <p><b>Church Address:</b> {churches[selectedAppointment.churchId].churchAddress}</p>
                              <p><b>Contact Number:</b> {churches[selectedAppointment.churchId].churchContactNum}</p>
                              <p><b>Church Email:</b> {churches[selectedAppointment.churchId].churchEmail}</p>
                            </div>
                          )}
                          {selectedAppointment.appointmentType === 'marriageCertificate' && (
                            <div>
                              <br />
                              <h4>Submitted Requirements</h4>
                              <p><b>Bride's First Name:</b> {selectedAppointment.marriageCertificate.brideFirstName}</p>
                              <p><b>Bride's Last Name:</b> {selectedAppointment.marriageCertificate.brideLastName}</p>
                              <br />
                              <p><b>Groom's First Name:</b> {selectedAppointment.marriageCertificate.groomFirstName}</p>
                              <p><b>Groom's Last Name:</b> {selectedAppointment.marriageCertificate.groomLastName}</p>
                              <br />
                              <p><b>Date of Marriage:</b> {selectedAppointment.marriageCertificate.dateOfMarriage}</p>
                            </div>
                          )}
                          {selectedAppointment.appointmentType === 'confirmationCertificate' && (
                            <div>
                              <br />
                              <h4>Submitted Requirements</h4>
                              <p><b>First Name:</b> {selectedAppointment.confirmationCertificate.firstName}</p>
                              <p><b>Last Name:</b> {selectedAppointment.confirmationCertificate.lastName}</p>
                              <p><b>Confirmation Date:</b> {selectedAppointment.confirmationCertificate.confirmationDate}</p>
                            </div>
                          )}
                          {selectedAppointment.appointmentType === 'baptismalCertificate' && (
                            <div>
                              <br />
                              <h4>Submitted Requirements</h4>
                              <p><b>First Name:</b> {selectedAppointment.baptismalCertificate.firstName}</p>
                              <p><b>Last Name:</b> {selectedAppointment.baptismalCertificate.lastName}</p>
                              <p><b>Birthday:</b> {selectedAppointment.baptismalCertificate.birthday}</p>
                              <br />
                              <p><b>Father's First Name:</b> {selectedAppointment.baptismalCertificate.fatherFirstName}</p>
                              <p><b>Father's Last Name:</b> {selectedAppointment.baptismalCertificate.fatherLastName}</p>
                              <p><b>Mother's First Name:</b> {selectedAppointment.baptismalCertificate.motherFirstName}</p>
                              <p><b>Mother's Last Name:</b> {selectedAppointment.baptismalCertificate.motherLastName}</p>
                            </div>
                          )}
                          {selectedAppointment.appointmentType === 'burialCertificate' && (
                            <div>
                              <br />
                              <h4>Submitted Requirements</h4>
                              {renderDeathCertificate(selectedAppointment.burialCertificate.deathCertificate)}
                            </div>
                          )}
                          <br />
                          <h4>Payment Details</h4>
                          {renderPaymentImage(selectedAppointment.userFields.paymentImage)}
                        </div>
                      )}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

export default Homepage;

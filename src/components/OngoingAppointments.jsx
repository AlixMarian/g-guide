import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '/backend/firebase';
import '../websiteUser.css';
import useChatbot from './Chatbot';
import { Modal, Button} from 'react-bootstrap'; 
import { toast } from 'react-toastify';
import Pagination from 'react-bootstrap/Pagination';

export const OngoingAppointments = () => {
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [churches, setChurches] = useState({});
  const [churchQRDetail, setChurchQRDetail] = useState(null); 
  const [churchInstruction, setChurchInstruction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [paymentImageUrl, setPaymentImageUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  
  const appointmentsPerPage = 2;
  
  const auth = getAuth();
  const user = auth.currentUser;
  const fileInputRef = useRef(null);

  useChatbot();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);


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

    const handleViewAppnts = () => {
        navigate('/view-appointments');
      };

      const appointmentTypeMapping = {
        marriageCertificate: "Marriage Certificate",
        birthCertificate: "Birth Certificate",
        baptismalCertificate: "Baptismal Certificate",
        burialCertificate: "Burial Certificate",
        confirmationCertificate: "Confirmation Certificate",
        baptism: "Baptism",
        burial: "Burial",
      };
      
      const handleShowModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
      };
    
      const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
      };
    
      const handlePayment = async (appointmentId) => {
        try {
            setSelectedAppointmentId(appointmentId);
    
            const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
            if (appointmentDoc.exists()) {
                const appointmentData = appointmentDoc.data();
                setPaymentImageUrl(appointmentData.userFields.paymentImage || null);
    
                
                const churchId = appointmentData.churchId;
                const churchDoc = await getDoc(doc(db, 'church', churchId));
    
                if (churchDoc.exists()) {
                    const churchData = churchDoc.data();
                    setChurchQRDetail(churchData.churchQRDetail || null);
                    setChurchInstruction(churchData.churchInstruction || null);
                } else {
                    console.error('No such church document!');
                }
            } else {
                console.error('No such appointment document!');
            }
        } catch (error) {
            console.error('Error fetching payment image or church details:', error);
        }
        setShowPaymentModal(true);
        console.log(`Initiating payment for appointment ID: ${appointmentId}`);
      };
    
      const handleClosePaymentModal = () => {
          setShowPaymentModal(false);
      };
    
    
      const renderDeathCertificate = (fileUrl) => {
        const fileExtension = fileUrl.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          return <img src={fileUrl} alt="Death Certificate" style={{ width: '100%' }} />;
        } else if (fileExtension === 'pdf') {
          return <iframe src={fileUrl} title="Death Certificate" style={{ width: '100%', height: '500px' }} />;
        } else if (['doc', 'docx'].includes(fileExtension)) {
          return <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download Death Certificate</a>;
        } else {
          return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Death Certificate</a>;
        }
      };
      

      const handleChoosePayment = (e) => {
        const { files } = e.target;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        } else {
            setSelectedFile(null);
        }
    };
    

      const handleSubmitPayment = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user && selectedFile) {
            try {
                const storageRef = ref(getStorage(), `userPaymentReceipt/${user.uid}/${selectedFile.name}`);
                await uploadBytes(storageRef, selectedFile);
                const paymentImageUrl = await getDownloadURL(storageRef);
    
                await updateDoc(doc(db, "appointments", selectedAppointmentId), {
                    'appointments.paymentImage': paymentImageUrl,
                });
    
                toast.success("Payment receipt uploaded successfully");
                
                setShowPaymentModal(false);
    
            } catch (error) {
                toast.error("Error uploading payment receipt");
                console.error("Error uploading payment receipt:", error);
            }
    
            fileInputRef.current.value = "";
            setSelectedFile(null);
        } else {
            toast.error("Please select a file to upload");
        }
    };
    
    const renderPaymentImage = (fileUrl) => {
      const fileExtension = fileUrl.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        return <img src={fileUrl} alt="Payment Proof" style={{ width: '100%' }} />;
      } else if (fileExtension === 'pdf') {
        return <iframe src={fileUrl} title="Payment Proof" style={{ width: '100%', height: '500px' }} />;
      } else if (['doc', 'docx'].includes(fileExtension)) {
        return <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download Payment Proof</a>;
      } else {
        return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Payment Proof</a>;
      }
    };
    

      const filteredAppointments = appointments
      .sort((a, b) => {
        if (a.appointmentStatus === "For Payment" && b.appointmentStatus !== "For Payment") {
          return -1;
        }
        if (b.appointmentStatus === "For Payment" && a.appointmentStatus !== "For Payment") {
          return 1;
        }
    
        const dateA = a.userFields.dateOfRequest ? a.userFields.dateOfRequest.seconds : 0;
        const dateB = b.userFields.dateOfRequest ? b.userFields.dateOfRequest.seconds : 0;
        return dateB - dateA;
      })
      .filter(appointment => appointment.appointmentStatus === "Pending" || appointment.appointmentStatus === "For Payment");
    
    const indexOfLastAppointment = currentAppointmentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    
    const pageNumbersAppointment = [];
    for (let i = 1; i <= Math.ceil(filteredAppointments.length / appointmentsPerPage); i++) {
      pageNumbersAppointment.push(i);
    }
    
    const paginateAppointments = (pageNumber) => {
      setCurrentAppointmentPage(pageNumber);
    };

  return (
    <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0"><b>Ongoing Appointments</b></h5>
                <button type="button" className="btn btn-primary ms-3" onClick={handleViewAppnts}>View Appointment History</button>
              </div>
              <div className="card-body">
                <div className="row">
                  {filteredAppointments.length > 0 ? (
                    currentAppointments.map(appointment => {
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
                                <div className="d-flex align-items-center">
                                {appointment.appointmentStatus === "For Payment" && (
                                    <button className='btn btn-warning ms-2' onClick={() => handlePayment(appointment.id)}>Pay here via QR Code</button>
                                )}
                                  <button className='btn btn-info ms-2' onClick={() => handleShowModal(appointment)}>View Information</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p>No appointments found.</p>
                  )}
                  <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
                  <Modal.Header closeButton>
                    <Modal.Title>Submit Payment Receipt</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {churchInstruction && (
                      <>
                        <h5>Instructions:</h5>
                        <p>{churchInstruction}</p>
                      </>
                    )}
                    {churchQRDetail && (
                      <>
                        <h5>Church QR Code:</h5>
                        <div className="d-flex justify-content-center">
                          <img src={churchQRDetail} alt="Church QR Code" className="qr-image" />
                        </div>
                      </>
                    )}
                    <form className='submitPayment' onSubmit={handleSubmitPayment}>
                      <h5>Submit Receipt</h5>
                      <input type="file" className="form-control" id="paymentReceiptImage" accept="image/*" onChange={handleChoosePayment} ref={fileInputRef} readOnly />
                      <button type="submit" className="btn btn-primary mt-2">Upload Receipt</button>
                    </form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePaymentModal}>Close</Button>
                    <Button variant="primary" onClick={() => console.log('Submit')}>Submit</Button>
                  </Modal.Footer>
                </Modal>

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
                              <p><b>Bride&apos;s First Name:</b> {selectedAppointment.marriageCertificate.brideFirstName}</p>
                              <p><b>Bride&apos;s Last Name:</b> {selectedAppointment.marriageCertificate.brideLastName}</p>
                              <br />
                              <p><b>Groom&apos;s First Name:</b> {selectedAppointment.marriageCertificate.groomFirstName}</p>
                              <p><b>Groom&apos;s Last Name:</b> {selectedAppointment.marriageCertificate.groomLastName}</p>
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
                              <p><b>Father&apos;s First Name:</b> {selectedAppointment.baptismalCertificate.fatherFirstName}</p>
                              <p><b>Father&apos;s Last Name:</b> {selectedAppointment.baptismalCertificate.fatherLastName}</p>
                              <p><b>Mother&apos;s First Name:</b> {selectedAppointment.baptismalCertificate.motherFirstName}</p>
                              <p><b>Mother&apos;s Last Name:</b> {selectedAppointment.baptismalCertificate.motherLastName}</p>
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
                          {selectedAppointment.appointments?.paymentImage && selectedAppointment.appointments.paymentImage !== 'none' ? (
                                renderPaymentImage(selectedAppointment.appointments.paymentImage)
                            ) : (
                                <p>Not yet paid</p>
                            )}
                        </div>
                      )}
                    </Modal.Body>

                  </Modal>
                  <div className="d-flex justify-content-center">
                    <Pagination className="mt-3">
                    {pageNumbersAppointment.map((number) => (
                        <Pagination.Item key={number} active={number === currentAppointmentPage} onClick={() => paginateAppointments(number)}>
                        {number}
                        </Pagination.Item>
                    ))}
                    </Pagination>
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default OngoingAppointments;

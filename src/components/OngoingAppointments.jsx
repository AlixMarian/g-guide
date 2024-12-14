import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '/backend/firebase';
import '../websiteUser.css';
import useChatbot from './Chatbot';
import { Modal, Badge } from 'react-bootstrap'; 
import { toast } from 'react-toastify';
import Pagination from 'react-bootstrap/Pagination';


export const OngoingAppointments = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [churches, setChurches] = useState({});
  const [churchQRDetail, setChurchQRDetail] = useState(null);
  const [slots, setSlots] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [events, setEvents] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [refundPolicyAcknowledged, setRefundPolicyAcknowledged] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [paymentImageUrl, setPaymentImageUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const [refundPolicy, setRefundPolicy] = useState(null);
  const [servicesData, setServicesData] = useState({});
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

  const fetchServicesData = async (churchId) => {
    try {
        const servicesDoc = await getDoc(doc(db, "services", churchId));
        if (servicesDoc.exists()) {
            const services = servicesDoc.data();
            console.log("Services data found:", services);
            setServicesData(services);
        } else {
            console.warn("No services document found for Church ID:", churchId);
        }
    } catch (error) {
        console.error("Error fetching services data:", error);
        toast.error("Error fetching services data.");
    }
};

  
  useEffect(() => {
    const fetchAppointmentsAndSlots = async () => {
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
  
          const slotsQuery = query(collection(db, 'slot'), where('slotStatus', '==', 'taken'));
          const allSlotsSnapshot = await getDocs(slotsQuery);
          const allSlots = allSlotsSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {});
          setSlots(allSlots);
  
          const eventsQuery = query(
            collection(db, 'events'),
            where('eventName', 'in', ['Confirmation', 'confirmation'])
          );
          const eventsSnapshot = await getDocs(eventsQuery);
          const eventsData = eventsSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc[doc.id] = { ...data, eventDate: new Date(data.eventDate) };
            return acc;
          }, {});
          setEvents(eventsData);
        } catch (error) {
          toast.error('Error fetching appointments: ' + error.message);
        }
      }
    };
  
    fetchAppointmentsAndSlots();
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
    marriage: "Marriage",
    confirmation: "Confirmation",
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
              setSelectedAppointment(appointmentData);
              setPaymentImageUrl(appointmentData.userFields.paymentImage || null);
              

              const churchId = appointmentData.churchId;
              const churchDoc = await getDoc(doc(db, 'church', churchId));

              if (churchDoc.exists()) {
                  const churchData = churchDoc.data();
                  setChurchQRDetail(churchData.churchQRDetail || null);
                  setRefundPolicy(churchData.refundPolicy || null);

                  // Fetch services data
                  console.log("Fetching services data for Church ID:", churchId);
                  await fetchServicesData(churchId);
              } else {
                  console.error("No such church document!");
              }
          } else {
              console.error("No such appointment document!");
          }
      } catch (error) {
          console.error("Error fetching payment image or church details:", error);
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
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Death Certificate</a>;
    } else {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Death Certificate</a>;
    }
  };
  
  const renderBaptismalCertificate = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Baptismal Certificate" style={{ width: '100%' }} />;
    } else if (fileExtension === 'pdf') {
      return <iframe src={fileUrl} title="Baptismal Certificate" style={{ width: '100%', height: '500px' }} />;
    } else if (['doc', 'docx'].includes(fileExtension)) {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Baptismal Certificate</a>;
    } else {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Baptismal Certificate</a>;
    }
  };
  
  const renderBirthCertificate = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Birth Certificate" style={{ width: '100%' }} />;
    } else if (fileExtension === 'pdf') {
      return <iframe src={fileUrl} title="Birth Certificate" style={{ width: '100%', height: '500px' }} />;
    } else if (['doc', 'docx'].includes(fileExtension)) {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Birth Certificate</a>;
    } else {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Birth Certificate</a>;
    }
  };

  const renderAuthorizationLetter = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt="Authorization Letter" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} />;
    } else if (fileExtension === 'pdf') {
      return <iframe src={fileUrl} title="Authorization Letter" style={{ width: '100%', height: '500px' }} />;
    } else if (['doc', 'docx'].includes(fileExtension)) {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download Authorization Letter</a>;
    } else {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Authorization Letter</a>;
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
          'appointments.paymentUploadDate': Timestamp.now(),
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
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Payment Proof</a>;
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
  
  const getSlotData = (slotId) => {
    console.log("Slots State:", slots);
    const slot = slots[slotId];
    console.log("Found Slot Data:", slot);
    return slot || {};
  };
  
  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };
  
    return (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body d-flex align-items-center justify-content-between">
            <h5 className="card-title mb-0"><b>Ongoing Transactions</b></h5>
            <button type="button" className="btn btn-custom-primary ms-3" onClick={handleViewAppnts}>View History</button>
          </div>
          <div className="card-body">
            <div className="row">
              {filteredAppointments.length > 0 ? (
                currentAppointments.map(appointment => {
                  const church = churches[appointment.churchId];
                  return (
                    <div key={appointment.id} className="col-12 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-12 col-md-8">
                              <h5 className="card-title mb-0">
                                {appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}
                              </h5>
                              <p className="card-text mb-0"><b>Status: {appointment.appointmentStatus}</b></p>
                              {church && <p className='card-text mb-0'>Church Name: {church.churchName}</p>}
                            </div>
                            <div className="col-12 col-md-4 d-flex justify-content-md-end mt-3 mt-md-0">
                              {appointment.appointmentStatus === "For Payment" && (
                                <button className='btn btn-warning me-2 mb-2 mb-md-0' onClick={() => handlePayment(appointment.id)}>Pay here via QR Code</button>
                              )}
                              <button className='btn btn-custom-primary' onClick={() => handleShowModal(appointment)}>View Information</button>
                            </div>
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
                {selectedAppointment ? (
                  servicesData ? (
                    <>
                      <h5>Service Fee:</h5>
                      {(() => {
                        const normalizedType = appointmentTypeMapping[selectedAppointment.appointmentType];
                        const serviceDetails = servicesData[normalizedType];
                        if (serviceDetails) {
                          return (
                            <>
                              <p>{`PHP ${serviceDetails.fee}`}</p>
                              <h5>Instructions:</h5>
                              <p>{serviceDetails.instructions || "No instructions provided for this service."}</p>
                            </>
                          );
                        } else {
                          console.warn("No matching service found for:", selectedAppointment.appointmentType);
                          return <p>Service details are unavailable.</p>;
                        }
                      })()}
                    </>
                  ) : (
                    <p>Loading service data...</p>
                  )
                ) : (
                  <p>No appointment selected.</p>
                )}
                  {refundPolicy && (
                    <>
                      <h5>Refund Policy:</h5>
                      <p>{refundPolicy}</p>
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
                  <form className="submitPayment d-flex flex-column" onSubmit={handleSubmitPayment}>
                    <h5>Submit Receipt</h5>
                    <input type="file" className="form-control" id="paymentReceiptImage" accept="image/*" onChange={handleChoosePayment} ref={fileInputRef} readOnly />
                    <div className="form-check mt-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="refundPolicyCheckbox"
                            onChange={(e) => setRefundPolicyAcknowledged(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="refundPolicyCheckbox">
                            I have read and understood the church&apos;s refund policy
                        </label>
                    </div>
                    <div className="mt-2 d-flex justify-content-end">
                    <button type="submit" className="btn btn-custom-primary" disabled={!refundPolicyAcknowledged}>
                        Upload Receipt
                    </button>
                    </div>
                  </form>
                </Modal.Body>
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
                      <p>
                        <b>Status:</b>{' '}
                        {selectedAppointment.appointmentStatus === 'For Payment' && (
                          <Badge bg="warning" pill>● For Payment</Badge>
                        )}
                        {selectedAppointment.appointmentStatus === 'Pending' && (
                          <Badge bg="secondary" pill>● Pending</Badge>
                        )}
                        {selectedAppointment.appointmentStatus !== 'For Payment' &&
                          selectedAppointment.appointmentStatus !== 'Pending' && (
                            <Badge bg="light" pill>● {selectedAppointment.appointmentStatus}</Badge>
                          )}
                      </p>
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
                          <p>
                            <b>Authorization Letter:</b>{' '}
                            {selectedAppointment.appointmentPurpose === 'others' 
                              ? renderAuthorizationLetter(selectedAppointment.authorizationLetter) 
                              : 'none'}
                          </p>
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
                          <p>
                            <b>Authorization Letter:</b>{' '}
                            {selectedAppointment.appointmentPurpose === 'others' 
                              ? renderAuthorizationLetter(selectedAppointment.authorizationLetter) 
                              : 'none'}
                          </p>
                          <p><b>First Name:</b> {selectedAppointment.confirmationCertificate.firstName}</p>
                          <p><b>Last Name:</b> {selectedAppointment.confirmationCertificate.lastName}</p>
                          <p><b>Date of Birth:</b> {selectedAppointment.confirmationCertificate.birthdayDate}</p>
                        </div>
                      )}
                      {selectedAppointment.appointmentType === 'baptismalCertificate' && (
                        <div>
                          <br />
                          <h4>Submitted Requirements</h4>
                          <p>
                            <b>Authorization Letter:</b>{' '}
                            {selectedAppointment.appointmentPurpose === 'others' 
                              ? renderAuthorizationLetter(selectedAppointment.authorizationLetter) 
                              : 'none'}
                          </p>
                          <br/>
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
                          <p>
                            <b>Authorization Letter:</b>{' '}
                            {selectedAppointment.appointmentPurpose === 'others' 
                              ? renderAuthorizationLetter(selectedAppointment.authorizationLetter) 
                              : 'none'}
                          </p>
                          <p><b>Death Certificate: </b>{renderDeathCertificate(selectedAppointment.burialCertificate.deathCertificate)}</p>
                        </div>
                      )}
                      {selectedAppointment.appointmentType === 'baptism' && (
                        <div>
                          <br />
                          <h4>Submitted Requirements</h4>
                          <p><b>Selected Date for Baptism: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            return slotData.startDate || 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>Selected Time for Baptism: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            const startTime = convertTo12HourFormat(slotData.startTime);
                            const endTime = convertTo12HourFormat(slotData.endTime);
                            return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>Child&apos;s First Name:</b> {selectedAppointment.baptism.childFirstName}</p>
                          <p><b>Child&apos;s Last Name:</b> {selectedAppointment.baptism.childLastName}</p>
                          <p><b>Father&apos;s First Name:</b> {selectedAppointment.baptism.fatherFirstName}</p>
                          <p><b>Father&apos;s Last Name:</b> {selectedAppointment.baptism.fatherLastName}</p>
                          <p><b>Mother&apos;s First Name:</b> {selectedAppointment.baptism.motherFirstName}</p>
                          <p><b>Mother&apos;s Last Name:</b> {selectedAppointment.baptism.motherLastName}</p>
                          <p><b>Date of Birth:</b> {selectedAppointment.baptism.dateOfBirth}</p>
                          <p><b>Place of Birth:</b> {selectedAppointment.baptism.placeOfBirth}</p>
                          <p><b>Marriage Date of Parents:</b> {selectedAppointment.baptism.marriageDate}</p>
                          <p><b>Home Address:</b> {selectedAppointment.baptism.homeAddress}</p>
                          <p><b>Name of Priest who will Baptise:</b> {selectedAppointment.baptism.priestOptions}</p>
                          <p><b>Name of Godparents:</b> {selectedAppointment.baptism.godParents}</p>
                        </div>
                      )}
                      {selectedAppointment.appointmentType === 'burial' && (
                        <div>
                          <h4>Submitted Requirements</h4>
                          <p><b>Selected Date for Burial Service: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            return slotData.startDate || 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>Selected Time for Burial Service: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            const startTime = convertTo12HourFormat(slotData.startTime);
                            const endTime = convertTo12HourFormat(slotData.endTime);
                            return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>Death Certificate: </b>{renderDeathCertificate(selectedAppointment.burial.deathCertificate)}</p>
                        </div>
                      )}
                      {selectedAppointment.appointmentType === 'marriage' && (
                        <div>
                          <br />
                          <h4>Submitted Requirements</h4>
                          <p><b>Selected Date for Marriage Seminar: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            return slotData.startDate || 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>Selected Time for Marriage Seminar: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            const startTime = convertTo12HourFormat(slotData.startTime);
                            const endTime = convertTo12HourFormat(slotData.endTime);
                            return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                          })() : 'N/A'}</p>
                          <br/>
                          <p><b>Bride&apos;s First Name:</b> {selectedAppointment.marriage.brideFirstName}</p>
                          <p><b>Bride&apos;s Last Name:</b> {selectedAppointment.marriage.brideLastName}</p>
                          <br />
                          <p><b>Groom&apos;s First Name:</b> {selectedAppointment.marriage.groomFirstName}</p>
                          <p><b>Groom&apos;s Last Name:</b> {selectedAppointment.marriage.groomLastName}</p>
                          <br />
                          <p><b>Planned Wedding Date:</b> {selectedAppointment.marriage.dateOfMarriage}</p>
                        </div>
                      )}
                      {selectedAppointment.appointmentType === 'confirmation' && (
                        <div>
                          <br />
                          <h4>Submitted Requirements</h4>
                          <p><b>Selected Date for Confirmation: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            return slotData.startDate || 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>Selected Time for Confirmation: </b>{selectedAppointment.slotId ? (() => {
                            const slotData = getSlotData(selectedAppointment.slotId);
                            const startTime = convertTo12HourFormat(slotData.startTime);
                            const endTime = convertTo12HourFormat(slotData.endTime);
                            return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                          })() : 'N/A'}</p>
                          <p><b>First Name:</b> {selectedAppointment.confirmation.firstName}</p>
                          <p><b>Last Name:</b> {selectedAppointment.confirmation.lastName}</p>
                          <br/>
                          <p><b>Baptismal Certificate: </b> {renderBaptismalCertificate(selectedAppointment.confirmation.baptismalCert)}</p> 
                          <p><b>Birth Certificate: </b> {renderBirthCertificate(selectedAppointment.confirmation.birthCertificate)}</p> 
                        </div>
                      )}
                      <br />
                      <h4>Payment Details</h4>
                      {selectedAppointment.appointments?.paymentImage && selectedAppointment.appointments.paymentImage !== 'none' ? (
                        renderPaymentImage(selectedAppointment.appointments.paymentImage)
                      ) : (
                        <Badge bg="danger" pill>Not yet paid</Badge>
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
    );
}

export default OngoingAppointments;

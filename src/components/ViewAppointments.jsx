import '../websiteUser.css';
import { useNavigate } from 'react-router-dom';
import { db } from '/backend/firebase';
import { getAuth } from 'firebase/auth';
import {  collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal} from 'react-bootstrap'; 

export const ViewAppointments = () => {
  const navigate = useNavigate();

  const handleBackToHomepage = () => {
    navigate('/homepage');
  };

  const [appointments, setAppointments] = useState([]);
  const [churches, setChurches] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [slots, setSlots] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

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

         // Fetch only slots with slotStatus: "taken"
      const slotsQuery = query(collection(db, 'slot'), where('slotStatus', '==', 'taken'));
      const allSlotsSnapshot = await getDocs(slotsQuery);
      const allSlots = allSlotsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});
      setSlots(allSlots);  // Store slots as an object

      console.log("Fetched Slots with 'taken' status:", allSlots);



        } catch (error) {
          toast.error('Error fetching appointments: ' + error.message);
        }
      }
    };

    fetchAppointmentsAndSlots();
  }, [user]);

  const appointmentTypeMapping = {
    marriageCertificate: "Marriage Certificate",
    birthCertificate: "Birth Certificate",
    baptismalCertificate: "Baptismal Certificate",
    burialCertificate: "Burial Certificate",
    confirmationCertificate: "Confirmation Certificate",
    baptism: "Baptism",
    burial:"Burial",
  };

  const getSlotData = (slotId) => {
    console.log("Slots State:", slots);
    const slot = slots[slotId];
    console.log("Found Slot Data:", slot);
    return slot || {};
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
      return <iframe src={fileUrl} title="Payment Proof" style={{ width: '100%', height: '500px' }} />;
    } else if (['doc', 'docx'].includes(fileExtension)) {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download Payment Proof</a>;
    } else {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Payment Proof</a>;
    }
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

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };


  return (
    <div className="viewApp">
      <div className="container">
        <div className="row">
        <div className="col-12 mb-4">
            <button type="button" className="btn btn-primary" onClick={handleBackToHomepage}>Back to Homepage</button>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Appointment History</h5>
                <div className="row">
                  {appointments.length > 0 ? (
                    appointments
                      .filter(appointment => appointment.appointmentStatus === "Approved" || appointment.appointmentStatus === "Denied")
                      .map(appointment => {
                        const church = churches[appointment.churchId];
                        return (
                          <div key={appointment.id} className="col-12 mb-3">
                            <div className="card">
                              <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                  <h5 className="card-title mb-0">
                                    {appointmentTypeMapping[appointment.appointmentType] || appointment.appointmentType}
                                  </h5>
                                  <p className="card-text mb-0"><b>Status: {appointment.appointmentStatus}</b></p>
                                  {church && (
                                    <div>
                                      <p className='mb-0'>Church Name: {church.churchName}</p>
                                      <p className='mb-0'>Church Location: {church.churchAddress}</p>
                                    </div>
                                  )}
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
                </div>
              </div>
            </div>
          </div>

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
                  <br/>
                  <h4>Church Information</h4>
                  <p><b>Church Name:</b> {churches[selectedAppointment.churchId].churchName}</p>
                  <p><b>Church Address:</b> {churches[selectedAppointment.churchId].churchAddress}</p>
                  <p><b>Contact Number:</b> {churches[selectedAppointment.churchId].churchContactNum}</p>
                  <p><b>Church Email:</b> {churches[selectedAppointment.churchId].churchEmail}</p>
                </div>
              )}
              
              {selectedAppointment.appointmentType === 'marriageCertificate' && (
                <div>
                  <br/>
                  <h4>Submitted Requirements</h4>
                  <p><b>Bride's First Name:</b> {selectedAppointment.marriageCertificate.brideFirstName}</p>
                  <p><b>Bride's Last Name:</b> {selectedAppointment.marriageCertificate.brideLastName}</p>
                  <br/>
                  <p><b>Groom's First Name:</b> {selectedAppointment.marriageCertificate.groomFirstName}</p>
                  <p><b>Groom's Last Name:</b> {selectedAppointment.marriageCertificate.groomLastName}</p>
                  <br/>
                  <p><b>Date of Marriage:</b> {selectedAppointment.marriageCertificate.dateOfMarriage}</p>
                </div>
              )}
              

              {selectedAppointment.appointmentType === 'confirmationCertificate' && (
                <div>
                <br/>
                <h4>Submitted Requirements</h4>
                <p><b>First Name:</b> {selectedAppointment.confirmationCertificate.firstName}</p>
                <p><b>Last Name:</b> {selectedAppointment.confirmationCertificate.lastName}</p>
                <p><b>Confirmation Date:</b> {selectedAppointment.confirmationCertificate.confirmationDate}</p>
                </div>
              )}

              {selectedAppointment.appointmentType === 'baptismalCertificate' && (
                <div>
                <br/>  
                <h4>Submitted Requirements</h4>
                <p><b>First Name:</b> {selectedAppointment.baptismalCertificate.firstName}</p>
                <p><b>Last Name:</b> {selectedAppointment.baptismalCertificate.lastName}</p>
                <p><b>Birthday:</b> {selectedAppointment.baptismalCertificate.birthday}</p>

                <br/>
                <p><b>Father's First Name:</b> {selectedAppointment.baptismalCertificate.fatherFirstName}</p>
                <p><b>Father's Last Name:</b> {selectedAppointment.baptismalCertificate.fatherLastName}</p>
                <p><b>Mother's First Name</b> {selectedAppointment.baptismalCertificate.motherFirstName}</p>
                <p><b>Mother's Last Name:</b> {selectedAppointment.baptismalCertificate.motherLastName}</p>

                </div>
              )}

              {selectedAppointment.appointmentType === 'burialCertificate' && (
                <div>
                  <br/>
                  <h4>Submitted Requirements</h4>
                  {renderDeathCertificate(selectedAppointment.burialCertificate.deathCertificate)}
                </div>
              )}

              {selectedAppointment.appointmentType === 'baptism' &&  (
                <div>
                  <br/>
                  <h4>Submitted Requirements</h4>
                  <p><b>Selected Date for Baptism: </b> 
                  {selectedAppointment.slotId ? 
                    (() => {
                      const slotData = getSlotData(selectedAppointment.slotId);
                      return slotData.startDate || 'N/A';
                    })()
                    : 'N/A'
                  }</p>
                  <p><b>Selected Time for Baptism: </b> 
                  {selectedAppointment.slotId ? 
                  (() => {
                    const slotData = getSlotData(selectedAppointment.slotId);
                    const startTime = convertTo12HourFormat(slotData.startTime);
                    const endTime = convertTo12HourFormat(slotData.endTime);
                    return startTime && endTime ? `${startTime} - ${endTime}` : 'N/A';
                  })()
                  : 'N/A'
                  }
                  </p>

                  <p><b>Child's First Name:</b> {selectedAppointment.baptism.childFirstName}</p>
                  <p><b>Child's Last Name:</b> {selectedAppointment.baptism.childLastName}</p>
                  <p><b>Father's First Name:</b> {selectedAppointment.baptism.fatherFirstName}</p>
                  <p><b>Father's Last Name:</b> {selectedAppointment.baptism.fatherLastName}</p>
                  <p><b>Mother's First Name:</b> {selectedAppointment.baptism.motherFirstName}</p>
                  <p><b>Mother's Last Name:</b> {selectedAppointment.baptism.motherLastName}</p>
                  <p><b>Date of Birth:</b> {selectedAppointment.baptism.dateOfBirth}</p>
                  <p><b>Place of Birth:</b> {selectedAppointment.baptism.placeOfBirth}</p>
                  <p><b>Marriage Date of Parents:</b> {selectedAppointment.baptism.marriageDate}</p>
                  <p><b>Home Address:</b> {selectedAppointment.baptism.homeAddress}</p>
                  <p><b>Name of Priest who will Baptise:</b> {selectedAppointment.baptism.priestOptions}</p>
                  <p><b>Name of Godparents:</b> {selectedAppointment.baptism.godParents}</p>
                </div>
              )}
              
              <br/>
              <h4>Payment Details</h4>
              {/* {renderPaymentImage(selectedAppointment.userFields.paymentImage)} */}
              {selectedAppointment.appointments?.paymentImage && selectedAppointment.appointments.paymentImage !== 'none' ? (
                                renderPaymentImage(selectedAppointment.appointments.paymentImage)
                            ) : (
                                <p>Not yet paid</p>
                            )}
            </div>
          )}
        </Modal.Body>
      </Modal>


        </div>
      </div>
    </div>
  );
};

export default ViewAppointments;

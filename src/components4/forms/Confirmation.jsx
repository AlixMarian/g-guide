/* eslint-disable react-hooks/exhaustive-deps */
import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, storage } from '/backend/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export const Confirmation = () => {
  const [dateToday, setdateToday] = useState(new Date());
  const { churchId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [churchData, setChurchData] = useState(null);
  const [matchedDates, setMatchedDates] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [baptismalCert,setBaptismalCert] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [baptismalCertUrl, setBaptismalCertUrl] = useState('');
  const [birthCert, setBirthCert] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [birthCertUrl, setBirthCertUrl] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('');
  const [slots, setSlots] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [activeDates, setActiveDates] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const auth = getAuth();
  const user = auth.currentUser;

  const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

  useEffect(() => {
    const fetchChurchData = async () => {
      const docRef = doc(db, 'church', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const churchData = docSnap.data();
        setChurchData(churchData);
        console.log("Church Data:", churchData);
      } else {
        console.log("No such church document!");
      }
    };
  
    const fetchSlots = async () => {
      try {
          const slotsQuery = query(collection(db, 'slot'), where('churchId', '==', churchId));
          const querySnapshot = await getDocs(slotsQuery);
          if (!querySnapshot.empty) {
              const slotsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setSlots(slotsData);

              const now = new Date();
              now.setHours(0, 0, 0, 0);

              const active = slotsData
                  .filter(slot => slot.slotStatus === "active" && new Date(slot.startDate) >= now)
                  .map(slot => new Date(slot.startDate));
              const disabled = slotsData
                  .filter(slot => slot.slotStatus === "disabled")
                  .map(slot => new Date(slot.startDate));

              setActiveDates(active);
              setDisabledDates(disabled);
          } else {
              console.log("No slots available or no matching documents found.");
          }
      } catch (error) {
          console.error("Error fetching slots:", error.message);
      }
  };
    
    fetchChurchData();
    fetchSlots(); 
    fetchRefundPolicy();
  }, [churchId]);
  

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserData(userData);
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
          });
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const fetchRefundPolicy = async () => {
    try {
        const churchDocRef = doc(db, 'church', churchId);
        const churchDocSnap = await getDoc(churchDocRef);

        if (churchDocSnap.exists()) {
            const data = churchDocSnap.data();
            setRefundPolicy(data.refundPolicy || "No refund policy available.");
        } else {
            console.log("No church data found for refund policy.");
            setRefundPolicy("No refund policy available.");
        }
    } catch (error) {
        console.error("Error fetching refund policy:", error);
        toast.error("Failed to fetch refund policy.");
    }
};
  
const handleSlotChange = (event) => {
  const selectedSlotId = event.target.value;
  if (selectedSlotId) {
      setSelectedSlotId(selectedSlotId);
      console.log("Selected Slot ID:", selectedSlotId);
  } else {
      console.error("No Slot ID found. Please select a valid slot.");
  }
};

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  const handleDateChange = (date) => {
    setdateToday(date);
    checkSlotAvailability(date);
};


  const checkSlotAvailability = (selectedDate) => {
      const offset = new Date().getTimezoneOffset() / 60;
      const adjustedDate = new Date(selectedDate.getTime() - offset * 3600000);
      const formattedDate = adjustedDate.toISOString().split('T')[0];
      console.log("Formatted Date:", formattedDate);

      const availableSlots = slots.filter(slot => {
          return slot.startDate === formattedDate && slot.slotStatus === "active";
      });

      setMatchedDates(availableSlots);
  };

  const sortSlotsByTime = (slots) => {
    return slots.sort((a, b) => {
        const timeA = parseInt(a.startTime.replace(':', ''), 10);
        const timeB = parseInt(b.startTime.replace(':', ''), 10);
        return timeA - timeB;
    });
};

const renderTime = (slot) => {
    if (!slot.startTime || !slot.endTime ||
        slot.startTime === "none" || slot.endTime === "none") {
        return 'Information unavailable: Date disabled';
    }
    return `${convertTo12HourFormat(slot.startTime)} - ${convertTo12HourFormat(slot.endTime)}`;
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    const regex = /^[A-Za-z ]*$/;
    if (regex.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  

  const handleUploadBaptismalCert = (e) => {
    const file = e.target.files[0];
    if (file){
      setBaptismalCert(file);
    }else{
        toast.error("no image detected")
    }
  };

  const handleUploadBirthCert = (e) => {
    const file = e.target.files[0];
    if (file){
      setBirthCert(file);
    }else{
        toast.error("no image detected")
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (user && baptismalCert && birthCert){
        try {
             
            const baptismalCertRef = ref(storage, `userRequirementSubmissions/${user.uid}/${baptismalCert.name}`);
            await uploadBytes(baptismalCertRef, baptismalCert);
            const baptismalCertUrl = await getDownloadURL(baptismalCertRef);
            setBaptismalCert(baptismalCertUrl);

            const birthCertRef = ref(storage, `userRequirementSubmissions/${user.uid}/${birthCert.name}`);
            await uploadBytes(birthCertRef, birthCert);
            const birthCertUrl = await getDownloadURL(birthCertRef);
            setBirthCertUrl(birthCertUrl);
                
            const appointmentData = {
              appointmentType: 'confirmation',
              appointmentStatus: 'Pending',
              appointmentPurpose: 'personal',
              authorizationLetter: 'none',
              paymentImage: 'none',
              churchId: churchId,
              slotId: selectedSlotId,
              userFields: {
                requesterId: user.uid,
                requesterName: fullName,
                requesterContact: userData.contactNum,
                requesterEmail: userData.email,
                dateOfRequest: Timestamp.fromDate(new Date()),
              },
              confirmation: {
               firstName: formData.firstName,
               lastName: formData.lastName,
               birthCertificate: birthCertUrl,
               baptismalCert: baptismalCertUrl,
              }
            };
      
            await addDoc(collection(db, 'appointments'), appointmentData);

            const slotRef = doc(db, 'slot', selectedSlotId);
            await updateDoc(slotRef, { slotStatus: 'taken' });

                
            setSlots(prevSlots => prevSlots.filter(slot => slot.id !== selectedSlotId));
            setMatchedDates(prevMatchedDates => prevMatchedDates.filter(slot => slot.id !== selectedSlotId));

            toast.success("Request submitted to Church Coordinator. Please wait for approval");
            resetForm();
          } catch (error) {
            console.error("Error submitting request: ", error);
            toast.error(`Error submitting request: ${error.message}`);
          }
        }
        
    };

  const handleClear = () => {
    resetForm();
    toast.success('Form cleared');
  };

  const resetForm = () => {
    setBaptismalCert(null);
    setBirthCert(null);
    setBaptismalCertUrl('');
    setBirthCertUrl('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form id='confirmation' onSubmit={handleCreateAppointment}>
        <div className="userDetails card mb-4">
        <div className="card-body">
            <h5 className="card-title">User Details</h5>
            <div className="userOverview d-flex align-items-center mb-3">
            <div className="container">
                <div className="row mb-3">
                <div className="col-md-6">
                    <div className="mb-3">
                    <label className="form-label">Selected Service</label>
                    <input type="text" className="form-control" id="selectedService" readOnly placeholder="Confirmation" />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                    <label className="form-label">User Name</label>
                    <input type="text" className="form-control" id="userName" readOnly defaultValue={`${userData?.firstName || ""} ${userData?.lastName || ""}`}/>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                    <label className="form-label">User Contact</label>
                    <input type="text" className="form-control" id="userContact" readOnly defaultValue={userData?.contactNum || ""} />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                    <label className="form-label">User Email</label>
                    <input type="text" className="form-control" id="userEmail" readOnly defaultValue={userData?.email || ""} />
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>

        <div className="userDetails card mb-4">
          <div className="card-body">
            <h5 className="card-title">Refund Policy</h5>
            <p>{refundPolicy}</p>
          </div>
        </div>

  
        <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Select the Confirmation Date</h5>
                <div className="row g-3 align-items-start justify-content-center">
                  <div className="col-lg-4 col-md-6 me-3">
                    <DatePicker
                      inline
                      selected={dateToday}
                      onChange={handleDateChange}
                      dateFormat="MMMM d, yyyy"
                      minDate={new Date()}
                      className="w-100"
                      maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                      excludeDates={disabledDates}
                      highlightDates={activeDates}
                    />
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <div className="d-flex flex-column h-100">
                      <div className="mb-3">
                        <p className="fw-bold mb-1">Slots available for:</p>
                        <p className="text-muted">
                          {dateToday && dateToday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex-grow-1">
                        {matchedDates.length > 0 ? (
                          sortSlotsByTime(matchedDates).map((slot, index) => (
                            <div key={index} className="mb-2">
                              <label className="form-check-label">
                                <input
                                  type="radio"
                                  name="slotTime"
                                  value={slot.id}
                                  className="form-check-input me-2"
                                  onChange={handleSlotChange}
                                  required
                                />
                                {renderTime(slot)}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No slots available for the selected date.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
      
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="reset" className="btn btn-danger">Clear</button>
                </div>
              </div>
            </div>
  
        <div className="submitReq card mb-4">
              <div className="card-body">
                <h5 className="card-title">Submit Requirements</h5>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" onChange={handleChange} value={formData.firstName || ''} required readOnly/>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" onChange={handleChange} value={formData.lastName || ''} required readOnly/>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="baptismalCert" className="form-label">Baptismal Certificate</label>
                  <input
                    className="form-control"
                    type="file"
                    id="baptismalCert"
                    name="baptismalCert"
                    onChange={handleUploadBaptismalCert}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="birthCert" className="form-label">Birth Certificate</label>
                  <input
                    className="form-control"
                    type="file"
                    id="birthCert"
                    name="birthCert"
                    onChange={handleUploadBirthCert}
                    required
                  />
                </div>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit Request</button>
                  <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
                </div>
              </div>
            </div>

      </form>
    </div>
  )
}

export default Confirmation;

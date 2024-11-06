import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc, updateDoc  } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, storage } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

export const Burial = () => {
    const [dateToday, setdateToday] = useState(new Date());
    const [matchedDates, setMatchedDates] = useState([]);
    const { churchId } = useParams();
    const [churchData, setChurchData] = useState(null);
    const [slots, setSlots] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [disabledDates, setDisabledDates] = useState([]);
    const [activeDates, setActiveDates] = useState([]);
    const [deathCert,setDeathCert] = useState(null);
    const [refundPolicy, setRefundPolicy] = useState('');
    const [deathCertUrl, setDeathCertUrl] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const auth = getAuth();
    const user = auth.currentUser;

    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

    useEffect(() => {
        const fetchChurchData = async () => {
            const docRef = doc(db, 'church', churchId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setChurchData(docSnap.data());
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
        
    }, [churchId]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                    setLoading(false);
                }
            }
        };
        fetchRefundPolicy();
        fetchUserData();
    }, [user]);

    const fetchRefundPolicy = async () => {
      try {
          const churchDocRef = doc(db, 'church', churchId);
          const churchDocSnap = await getDoc(churchDocRef);

          if (churchDocSnap.exists()) {
              const data = churchDocSnap.data();
              setRefundPolicy(data.refundPolicy || "No refund policy available."); // Set refund policy or default message
          } else {
              console.log("No church data found for refund policy.");
              setRefundPolicy("No refund policy available.");
          }
      } catch (error) {
          console.error("Error fetching refund policy:", error);
          toast.error("Failed to fetch refund policy.");
      }
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
    
    const convertTo12HourFormat = (time) => {
        if (!time || time === "none") return "none";
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
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

    const handleUploadDeathCert = (e) => {
        const file = e.target.files[0];
        if (file){
            setDeathCert(file);
        }else{
            toast.error("no image detected")
        }
    }

    const handleSlotChange = (event) => {
        const selectedSlotId = event.target.value;
        if (selectedSlotId) {
            setSelectedSlotId(selectedSlotId);
            console.log("Selected Slot ID:", selectedSlotId);
        } else {
            console.error("No Slot ID found. Please select a valid slot.");
        }
    };
    

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (user && deathCert){
            try {
                 
                const deathCertRef = ref(storage, `userRequirementSubmissions/${user.uid}/${deathCert.name}`);
                await uploadBytes(deathCertRef, deathCert);
                const deathCertUrl = await getDownloadURL(deathCertRef);
                setDeathCertUrl(deathCertUrl);
    
                    
                const appointmentData = {
                  appointmentType: 'burial',
                  appointmentStatus: 'Pending',
                  appointmentPurpose: 'none',
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
                  burial: {
                   deathCertificate: deathCertUrl,
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
            setDeathCert(null);
            setDeathCertUrl('');
            setSelectedSlotId(null);
        };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
          <form id='burial' onSubmit={handleCreateAppointment}>
            <div className="userDetails card mb-4">
            <div className="card-body">
                <h5 className="card-title">User Details</h5>
                <div className="userOverview d-flex align-items-center mb-3">
                <div className="container">
                    <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="mb-3">
                        <label className="form-label">Selected Service</label>
                        <input type="text" className="form-control" id="selectedService" readOnly placeholder="Burial" />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                        <label className="form-label">User Name</label>
                        <input type="text" className="form-control" id="userName" readOnly defaultValue={`${userData?.firstName || ""} ${userData?.lastName || ""}`} />
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
                <h5 className="card-title">Select the Burial Date</h5>
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
                <h5 className="card-title">Submit Requirement</h5>
                <div className="mb-3">
                  <label htmlFor="deathCertificate" className="form-label">Death Certificate</label>
                  <input
                    className="form-control"
                    type="file"
                    id="deathCertificate"
                    name="deathCertificate"
                    onChange={handleUploadDeathCert}
                    required
                  />
                </div>
      
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit Requirement</button>
                  <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )
      
}

export default Burial;

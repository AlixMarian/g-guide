import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export const Marriage = () => {
    const [dateToday, setdateToday] = useState(new Date());
    const [matchedDates, setMatchedDates] = useState([]);
    const { churchId } = useParams();
    // eslint-disable-next-line no-unused-vars
    const [churchData, setChurchData] = useState(null);
    const [slots, setSlots] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [disabledDates, setDisabledDates] = useState([]);
    const [activeDates, setActiveDates] = useState([]);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [formData, setFormData] = useState({
        brideFirstName: '',
        brideLastName: '',
        groomFirstName: '',
        groomLastName: '',
        marriageDate: ''
      });

    const auth = getAuth();
    const user = auth.currentUser;

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
        fetchUserData();
    }, [user]);

    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value
        });
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
    if (user){
        try {
                            
            const appointmentData = {
              appointmentType: 'marriage',
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
              marriage: {
                brideFirstName: formData.brideFirstName,
                brideLastName: formData.brideLastName,
                dateOfMarriage: formData.marriageDate,
                groomFirstName: formData.groomFirstName,
                groomLastName: formData.groomLastName
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
        setFormData({
            brideFirstName: '',
            brideLastName: '',
            groomFirstName: '',
            groomLastName: '',
            marriageDate: ''
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
          <form id='marriages' onSubmit={handleCreateAppointment}>
            <div className="userDetails card mb-4">
              <div className="card-body">
                <h5 className="card-title">User Details</h5>
                <div className="userOverview d-flex align-items-center mb-3">
                  <div className="container">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Selected Service</label>
                          <input type="text" className="form-control" id="selectedService" readOnly placeholder="Marriage" />
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
      
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Select Schedule for Marriage Seminar</h5>
                <p>Please visit the church&apos;s office on the selected date for further instructions regarding the marriage seminar.</p>
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
                                <input type="radio" name="slotTime" value={slot.id} className="form-check-input me-2" onChange={handleSlotChange} required />
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
      
                <div><b>Bride&apos;s</b></div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="brideFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="brideFirstName" name="brideFirstName" onChange={handleChange} required />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="brideLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="brideLastName" name="brideLastName" onChange={handleChange} required />
                  </div>
                </div>
      
                <div><b>Groom&apos;s</b></div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="groomFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="groomFirstName" name="groomFirstName" onChange={handleChange} required />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="groomLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="groomLastName" name="groomLastName" onChange={handleChange} required />
                  </div>
                </div>
      
                <div className="mb-3">
                  <label htmlFor="marriageDate" className="form-label">Planned Wedding Date</label>
                  <input type="date" className="form-control" id="marriageDate" name="marriageDate" onChange={handleChange} required />
                </div>
      
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit Requirements</button>
                  <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
                </div>
              </div>
            </div>
          </form>
        </div>
    );      
}

export default Marriage;

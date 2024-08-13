import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, storage } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

export const Baptism = () => {
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
                if (querySnapshot.empty) {
                    console.log("No slots available or no matching documents found.");
                } else {
                    const slotsData = querySnapshot.docs.map(doc => doc.data());
                    setSlots(slotsData);

                    
                    const active = slotsData
                        .filter(slot => slot.slotStatus === "active")
                        .map(slot => new Date(slot.startDate));
                    const disabled = slotsData
                        .filter(slot => slot.slotStatus === "disabled")
                        .map(slot => new Date(slot.startDate));

                    setActiveDates(active);
                    setDisabledDates(disabled);
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

    const renderTime = (slot) => {
        if (!slot.startTime || !slot.endTime ||
            slot.startTime === "none" || slot.endTime === "none") {
            return 'Information unavailable: Date disabled';
        }
        return `${convertTo12HourFormat(slot.startTime)} - ${convertTo12HourFormat(slot.endTime)}`;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

  return (
    <div>
    <form id='baptism'>

    <div className="userDetails card mb-4">
      <div className="card-body">
        <h5 className="card-title">User Details</h5>
        <div className="userOverview d-flex align-items-center mb-3">
          <div className="container">
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Selected Service</label>
                  <input type="text" className="form-control" id="selectedService" readOnly placeholder="Baptism" />
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

        <div className="calendar card mb-4">
            <div className="card-body">
                <h5 className="card-title">Select date of Baptism</h5>
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
                        matchedDates.map((slot, index) => (
                            <div key={index} className="mb-2">
                            <label className="form-check-label">
                                <input type="radio" name="slotTime" value={slot.startTime} className="form-check-input me-2" required/>
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
                    
                    <div><b>Father&apos;s Details</b></div>
                    <div className="row mb-3">
                        <div className="col mb-3">
                            <label htmlFor="fatherFirstName" className="form-label">First Name</label>
                            <input type="text" className="form-control" id="fatherFirstName" name="fatherFirstName" required/>
                        </div>
                        <div className="col mb-3">
                            <label htmlFor="fatherLastName" className="form-label">Last Name</label>
                            <input type="text" className="form-control" id="fatherLastName" name="fatherLastName" required/>
                        </div>
                    </div>

                    <div><b>Mother&apos;s Details</b></div>
                    <div className="row mb-3">
                        <div className="col mb-3">
                            <label htmlFor="motherFirstName" className="form-label">First Name</label>
                            <input type="text" className="form-control" id="motherFirstName" name="motherFirstName" required/>
                        </div>
                        <div className="col mb-3">
                            <label htmlFor="motherLastName" className="form-label">Last Name</label>
                            <input type="text" className="form-control" id="motherLastName" name="motherLastName" required/>
                        </div>
                    </div>
                    
                    <div><b>Child&apos;s Details</b></div>
                    <div className="row mb-3">
                        <div className="col mb-3">
                            <label htmlFor="childFirstName" className="form-label">First Name</label>
                            <input type="text" className="form-control" id="childFirstName" name="childFirstName" required/>
                        </div>
                        <div className="col mb-3">
                            <label htmlFor="childLastName" className="form-label">Last Name</label>
                            <input type="text" className="form-control" id="childLastName" name="childLastName" required/>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                        <input type="date" className="form-control" id="dateOfBirth" name="dateOfBirth"  required/>
                    </div>

                    <div className="row mb-3">
                        <div className="col mb-12">
                            <label htmlFor="placeOfBirth" className="form-label">Place of Birth</label>
                            <input type="text" className="form-control" id="placeOfBirth" name="placeOfBirth" required/>
                        </div>
                    </div>

                    <div><b>Other Details</b></div>
                    <div className="mb-3">
                        <label htmlFor="marriageDate" className="form-label">Marriage Date of Parents</label>
                        <input type="date" className="form-control" id="marriageDate" name="marriageDate"  required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="homeAddress" className="form-label">Home Address</label>
                        <input type="text" className="form-control" id="homeAddress" name="homeAddress"  required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="priestOptions" className="form-label">Name of Priest who will Baptise</label>
                        <input type="dropdown" className="form-control" id="priestOptions" name="priestOptions"  required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="godParents" className="form-label">Name of Godparents</label>
                        <input type="text" className="form-control" id="godParents" name="godParents"  required/>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button type="submit" className="btn btn-success me-md-2">Submit Requirements</button>
                        <button type="reset" className="btn btn-danger" >Clear</button>
                    </div>
                </div>
            </div>
    </form>
</div>
  )
}

export default Baptism;

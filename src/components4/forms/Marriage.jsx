import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, storage } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
                    const slotsData = querySnapshot.docs.map(doc => {
                        return doc.data();
                    });
                    setSlots(slotsData);
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
            <form className='marriages'>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Select schedule</h5>
                        <p>Mu appear rani if ang gi select sa user kay mu appointment siyag event like bunyag, etc..</p>
                        <div className="row">
                            <div className="col-lg-4 col-md-6 mb-3 me-5">
                                <DatePicker
                                    inline
                                    selected={dateToday}
                                    onChange={handleDateChange}
                                    dateFormat="MMMM d, yyyy"
                                    minDate={new Date()}
                                />
                            </div>
                            <div className="col-12 col-lg-3 col-md-4 mb-3">
                                <p>
                                    <b>
                                        Slots available for
                                        {dateToday && (
                                            <p>
                                                {dateToday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        )}
                                    </b>
                                </p>
                                {matchedDates.length > 0 ? (
                                    <div>
                                        {matchedDates.map((slot, index) => (
                                            <div key={index}>
                                                <label>
                                                    <input type="radio" name="slotTime" value={slot.startTime} className='me-3' />
                                                    {renderTime(slot)}
                                                </label>
                                                <br />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No slots available for the selected date.</p>
                                )}
                            </div>
                        </div>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button type="reset" className="btn btn-danger">Clear</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Marriage;

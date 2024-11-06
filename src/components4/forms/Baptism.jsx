import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export const Baptism = () => {
    const [dateToday, setdateToday] = useState(new Date());
    const [matchedDates, setMatchedDates] = useState([]);
    const { churchId } = useParams();
    const [churchData, setChurchData] = useState(null);
    const [slots, setSlots] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [priests, setPriests] = useState([]);
    const [disabledDates, setDisabledDates] = useState([]);
    const [activeDates, setActiveDates] = useState([]);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [refundPolicy, setRefundPolicy] = useState(''); // State for refund policy
    const [formData, setFormData] = useState({
        fatherFirstName: '',
        fatherLastName: '',
        motherFirstName: '',
        motherLastName: '',
        childFirstName: '',
        childLastName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        marriageDate: '',
        homeAddress: '',
        priestOptions: '',
        godParents: '',
    });

    const auth = getAuth();
    const user = auth.currentUser;
    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';
    const getPriestFullName = (priest) => {
        return priest ? `${priest.priestType || ''} ${priest.firstName || ''} ${priest.lastName || ''}`.trim() : '';
    };

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

        const fetchPriests = async () => {
            try {
                const priestsQuery = query(collection(db, 'priest'), where('creatorId', '==', churchId));
                const querySnapshot = await getDocs(priestsQuery);
                const priestsData = querySnapshot.docs.map(doc => doc.data());
                setPriests(priestsData);
            } catch (error) {
                console.error("Error fetching priests:", error.message);
            }
        };

        fetchChurchData();
        fetchSlots();
        fetchPriests();
        fetchRefundPolicy(); // Fetch refund policy on component mount
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

    // Function to fetch the refund policy
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value
        });
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (user) {
            try {
                const appointmentData = {
                    appointmentType: 'baptism',
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
                    baptism: {
                        fatherFirstName: formData.fatherFirstName,
                        fatherLastName: formData.fatherLastName,
                        motherFirstName: formData.motherFirstName,
                        motherLastName: formData.motherLastName,
                        childFirstName: formData.childFirstName,
                        childLastName: formData.childLastName,
                        dateOfBirth: formData.dateOfBirth,
                        placeOfBirth: formData.placeOfBirth,
                        marriageDate: formData.marriageDate,
                        homeAddress: formData.homeAddress,
                        priestOptions: formData.priestOptions,
                        godParents: formData.godParents,
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
        } else {
            toast.error("Error submitting request:");
        }
    };

    const handleClear = () => {
        resetForm();
        toast.success('Form cleared');
    };

    const resetForm = () => {
        setFormData({
            fatherFirstName: '',
            fatherLastName: '',
            motherFirstName: '',
            motherLastName: '',
            childFirstName: '',
            childLastName: '',
            dateOfBirth: '',
            placeOfBirth: '',
            marriageDate: '',
            homeAddress: '',
            priestOptions: "",
            godParents: '',
        });
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <form className='baptism' onSubmit={handleCreateAppointment}>
                {/* User Details and Selected Service */}
                <div className="userDetails card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">User Details</h5>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Selected Service</label>
                                <input type="text" className="form-control" readOnly value="Baptism" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">User Name</label>
                                <input type="text" className="form-control" readOnly value={fullName} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">User Contact</label>
                                <input type="text" className="form-control" readOnly value={userData?.contactNum || ''} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">User Email</label>
                                <input type="text" className="form-control" readOnly value={userData?.email || ''} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refund Policy Section */}
                <div className="userDetails card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Refund Policy</h5>
                        <p>{refundPolicy}</p>
                    </div>
                </div>

                {/* Calendar and Slots */}
                <div className="calendar card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Select date of Baptism</h5>
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
                        <div className="mt-3">
                            <h6>Available Slots:</h6>
                            {matchedDates.length > 0 ? (
                                sortSlotsByTime(matchedDates).map((slot) => (
                                    <div key={slot.id} className="mb-2">
                                        <label className="form-check-label">
                                            <input type="radio" name="slotTime" value={slot.id} className="form-check-input me-2" onChange={handleSlotChange} required/>
                                            {renderTime(slot)}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p>No slots available for the selected date.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form for submitting baptism requirements */}
                <div className="submitReq card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Submit Requirements</h5>
                        <div><b>Father&apos;s Details</b></div>
                        <div className="row mb-3">
                            <div className="col">
                                <label htmlFor="fatherFirstName" className="form-label">First Name</label>
                                <input type="text" className="form-control" id="fatherFirstName" name="fatherFirstName" required onChange={handleChange} value={formData.fatherFirstName}/>
                            </div>
                            <div className="col">
                                <label htmlFor="fatherLastName" className="form-label">Last Name</label>
                                <input type="text" className="form-control" id="fatherLastName" name="fatherLastName" required onChange={handleChange} value={formData.fatherLastName}/>
                            </div>
                        </div>

                        <div><b>Mother&apos;s Details</b></div>
                        <div className="row mb-3">
                            <div className="col">
                                <label htmlFor="motherFirstName" className="form-label">First Name</label>
                                <input type="text" className="form-control" id="motherFirstName" name="motherFirstName" required onChange={handleChange} value={formData.motherFirstName}/>
                            </div>
                            <div className="col">
                                <label htmlFor="motherLastName" className="form-label">Last Name</label>
                                <input type="text" className="form-control" id="motherLastName" name="motherLastName" required onChange={handleChange} value={formData.motherLastName}/>
                            </div>
                        </div>
                        
                        <div><b>Child&apos;s Details</b></div>
                        <div className="row mb-3">
                            <div className="col">
                                <label htmlFor="childFirstName" className="form-label">First Name</label>
                                <input type="text" className="form-control" id="childFirstName" name="childFirstName" required onChange={handleChange} value={formData.childFirstName}/>
                            </div>
                            <div className="col">
                                <label htmlFor="childLastName" className="form-label">Last Name</label>
                                <input type="text" className="form-control" id="childLastName" name="childLastName" required onChange={handleChange} value={formData.childLastName}/>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                            <input type="date" className="form-control" id="dateOfBirth" name="dateOfBirth" required onChange={handleChange} value={formData.dateOfBirth}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="placeOfBirth" className="form-label">Place of Birth</label>
                            <input type="text" className="form-control" id="placeOfBirth" name="placeOfBirth" required onChange={handleChange} value={formData.placeOfBirth}/>
                        </div>

                        <div><b>Other Details</b></div>
                        <div className="mb-3">
                            <label htmlFor="marriageDate" className="form-label">Marriage Date of Parents</label>
                            <input type="date" className="form-control" id="marriageDate" name="marriageDate" required onChange={handleChange} value={formData.marriageDate}/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="homeAddress" className="form-label">Home Address</label>
                            <input type="text" className="form-control" id="homeAddress" name="homeAddress" required onChange={handleChange} value={formData.homeAddress}/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="priestOptions" className="form-label">Name of Priest who will Baptise</label>
                            <select className="form-control" id="priestOptions" name="priestOptions" required onChange={handleChange} value={formData.priestOptions}>
                                <option value="" disabled>Select a Priest</option>
                                {priests.map((priest, index) => (
                                    <option key={index} value={getPriestFullName(priest)}>
                                        {getPriestFullName(priest)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="godParents" className="form-label">Name of Godparents</label>
                            <input type="text" className="form-control" id="godParents" name="godParents" required onChange={handleChange} value={formData.godParents} placeholder="e.g., John Doe, Jane Doe"/>
                        </div>
                    </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="submit" className="btn btn-success me-md-2">Submit Requirements</button>
                    <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
                </div>
            </form>
        </div>
    )
}

export default Baptism;

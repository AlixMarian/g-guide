import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, Timestamp, addDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, storage } from '/backend/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'react-datepicker/dist/react-datepicker.css';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export const Confirmation = () => {
  const [maxDate, setMaxDate] = useState(new Date());
  const { churchId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [churchData, setChurchData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [eventTime, setEventTime] = useState('');
  const [eventId, setEventId] = useState('');
  const [baptismalCert,setBaptismalCert] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [baptismalCertUrl, setBaptismalCertUrl] = useState('');
  const [birthCert, setBirthCert] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [birthCertUrl, setBirthCertUrl] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const auth = getAuth();
  const user = auth.currentUser;

  const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

  useEffect(() => {
    const getEndOfMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    setMaxDate(getEndOfMonth(new Date()));
  }, []);


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
  
    const fetchEventsData = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('creatorId', '==', churchId),
          where('eventName', 'in', ['Confirmation', 'confirmation'])
        );
        const querySnapshot = await getDocs(eventsQuery);
    
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); 
    
        const events = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            eventDate: new Date(doc.data().eventDate)
          }))
          .filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
          });
    
        setEventsData(events);
    
        if (events.length > 0) {
          const firstEvent = events[0];
          setEventTime(convertTo12HourFormat(firstEvent.eventTime));
          setEventId(firstEvent.id); 
        } else {
          setEventTime('');
          setEventId('');
        }
    
        console.log("Filtered Events Data:", events);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };
    
    fetchChurchData();
    fetchEventsData().finally(() => setLoading(false)); 
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
  

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
              appointmentPurpose: 'none',
              authorizationLetter: 'none',
              paymentImage: 'none',
              churchId: churchId,
              eventId: eventId,
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
            
          </div>
        </div>

  
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Available Date for Confirmation</h5>
            <div className="row g-3 align-items-start justify-content-center">
              <div className="col-lg-4 col-md-6 me-3">
                <DatePicker
                  inline
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  className="w-100"
                  maxDate={maxDate}
                  highlightDates={eventsData.map(event => event.eventDate)}
                />
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="d-flex flex-column h-100">
                  <div className="mb-3">
                    <p className="fw-bold mb-1">Date and Time of Confirmation</p>
                    {eventsData.length > 0 ? (
                      <>
                        <p className="text-muted">
                          {eventsData[0].eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-muted">
                          {convertTo12HourFormat(eventsData[0].eventTime)}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted">No Confirmation set for this month.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
  
        <div className="submitReq card mb-4">
              <div className="card-body">
                <h5 className="card-title">Submit Requirements</h5>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" onChange={handleChange} value={formData.firstName || ''} required/>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" onChange={handleChange} value={formData.lastName || ''} required/>
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

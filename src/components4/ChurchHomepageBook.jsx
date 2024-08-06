import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import BaptismalCertificate from './forms/BaptismalCertificate';
import ConfirmationCertificate from './forms/ConfirmationCertificate';
import MarriageCertificate from './forms/MarriageCertificate';
import BurialCertificate from './forms/BurialCertificate';

export const ChurchHomepageBook = () => {
  const [dateToday, setdateToday] = useState(new Date());
  const [matchedDates, setMatchedDates] = useState([]);
  const { churchId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [churchData, setChurchData] = useState(null);
  const [services, setServices] = useState({ activeSchedules: [], activeRequests: [] });
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [slots, setSlots] = useState([]);
  


  useEffect(() => {
    const fetchChurchData = async () => {
      const docRef = doc(db, 'church', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChurchData(docSnap.data());
      }
    };
  
    const fetchServices = async () => {
      const servicesDoc = await getDoc(doc(db, 'services', churchId));
      if (servicesDoc.exists()) {
        const data = servicesDoc.data();
        setServices({
          activeSchedules: data.activeSchedules || [],
          activeRequests: data.activeRequests || [],
        });
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
    fetchServices();
    fetchSlots();
  }, [churchId]);

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

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book Church Services</h2>
  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Select from the services we offer</h5>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="servicesTypeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  {selectedServiceType || "Select Service Type"}
              </button>
              <ul className="dropdown-menu" aria-labelledby="servicesTypeDropdown">
                <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedServiceType("Book an Appointment"); setSelectedService(''); }}>Book an Appointment</a></li>
                <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedServiceType("Request Document"); setSelectedService(''); }}>Request Document</a></li>
              </ul>
            </div>
            {selectedServiceType && (
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="servicesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  {selectedService || "Select Service"}
                </button>
                <ul className="dropdown-menu" aria-labelledby="servicesDropdown">
                  {selectedServiceType === "Event" && services.activeSchedules.map((service, index) => (
                    <li key={index}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedService(service); }}>{service}</a></li>
                  ))}
                  {selectedServiceType === "Request Document" && services.activeRequests.map((service, index) => (
                    <li key={index}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedService(service); }}>{service}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <br />
          
        </div>
      </div>

      <div>
      {selectedServiceType === "Book an Appointment" && (
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
              />
            </div>

            <div className="col-12 col-lg-3 col-md-4 mb-3">
                <p><b>Slots available for 
                {dateToday && (<p>{dateToday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>)}  
                </b></p>
                {matchedDates.length > 0 ? (
                  <div>
                    {matchedDates.map((slot, index) => (
                      <div key={index}>
                        <label>
                          <input type="radio" name="slotTime" value={slot.startTime} className='me-3'/>
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
      )}
    </div>
  
    {selectedServiceType === "Request Document" && (
        <div>
            {selectedService === "Baptismal Certificate" && (
              <BaptismalCertificate/>
            )}
            {selectedService === "Confirmation Certificate" && (
              <ConfirmationCertificate/>
            )}
            {selectedService === "Marriage Certificate" && (
              <MarriageCertificate/>
            )}
            {selectedService === "Burial Certificate" && (
              <BurialCertificate/>
            )}
        </div>
      )}
    </div>
  );
  
};

export default ChurchHomepageBook;


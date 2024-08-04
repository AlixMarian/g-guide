import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import BaptismalCertificate from './forms/BaptismalCertificate';
import ConfirmationCertificate from './forms/ConfirmationCertificate';
import MarriageCertificate from './forms/MarriageCertificate';
import BurialCertificate from './forms/BurialCertificate';

export const ChurchHomepageBook = () => {
  const [dateToday, setDateToday] = useState(new Date());

  const { churchId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [churchData, setChurchData] = useState(null);
  const [services, setServices] = useState({ activeSchedules: [], activeRequests: [] });
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedService, setSelectedService] = useState('');


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

    fetchChurchData();
    fetchServices();
  }, [churchId]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book an Appointment</h2>
  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Select from the services we offer</h5>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="servicesTypeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  {selectedServiceType || "Select Service Type"}
              </button>
              <ul className="dropdown-menu" aria-labelledby="servicesTypeDropdown">
                <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedServiceType("Event"); setSelectedService(''); }}>Event</a></li>
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

      {selectedServiceType === "Event" && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Select schedule</h5>
            <p>Mu appear rani if ang gi select sa user kay mu appointment siyag event like bunyag, etc..</p>
            <div className="row">
              <div className="col-lg-4 col-md-6 mb-3 me-5">
                <DatePicker
                  inline
                  selected={dateToday}
                  onChange={(date) => setDateToday(date)}
                  dateFormat="MMMM d, yyyy"
                />
              </div>
    
              <div className="col-lg-4 col-md-6 mb-3">
                <p>Slot available</p>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                  <label className="form-check-label" htmlFor="flexRadioDefault1">sampleTime</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                  <label className="form-check-label" htmlFor="flexRadioDefault2">sampleTime number 2</label>
                </div>
              </div>
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="reset" className="btn btn-danger">Clear</button>
            </div>
          </div>
        </div>
      )}

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
  
      {/* <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Submit Payment</h5>
            {churchData && churchData.churchQRDetail && churchData.churchInstruction &&(
               <div>
                <p>{churchData.churchInstruction}</p>
                <img src={churchData.churchQRDetail} alt="Church QR Code" className="qr-image mx-auto d-block" />
             </div>
            )}
            <br/>
            <label><strong>Submit your receipt here</strong></label>
            <div className="d-flex align-items-center mb-3">
              <input className="form-control me-2" type="file" id="formFile"/>
              <button type="reset" className="btn btn-danger">Clear</button>
            </div>

        </div>
      </div> */}

  
      {/* <div className="finalizeDetails card mb-4">
        <div className="card-body">
          <h5 className="card-title">Finalize details</h5>
          <p>mga input fields rani diri nga read only. diri mu reflect mga choices gi make sa user</p>
          
          <div className='userOverview d-flex align-items-center mb-3'>
          <label className="me-2">Selected Service</label>
          <input type="text" className="form-control w-50" id="selectedService" value={selectedService} readOnly placeholder="Selected Service" />
          </div>
          
          <br/>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="submit" className="btn btn-success me-md-2">Finalize</button>
            <button type="reset" className="btn btn-danger">Clear</button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ChurchHomepageBook;

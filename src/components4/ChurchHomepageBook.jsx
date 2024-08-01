import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

export const ChurchHomepageBook = () => {
  const [startDate, setStartDate] = useState(new Date());

  const { churchId } = useParams();
  const [churchData, setChurchData] = useState(null);
  const [services, setServices] = useState([]);
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
        setServices(servicesDoc.data().activeServices || []);
      }
    };

    fetchChurchData();
    fetchServices();
  }, [churchId]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book an Appointment</h2>
      <h2 className="mb-4">ako ra gi layout daan</h2>
  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">1. Select from the services we offer</h5>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="servicesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                Select Service
              </button>
              <ul className="dropdown-menu" aria-labelledby="servicesDropdown">
                {services.map((service, index) => (
                  <li key={index}>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedService(service); }}>
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <input type="text" className="form-control" id="selectedService" value={selectedService} readOnly placeholder="Selected Service" />
          </div>
          <br/>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="reset" className="btn btn-danger">Clear</button>
          </div>
        </div>
      </div>
  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">2. Select schedule</h5>
          <p>Mu appear rani if ang gi select sa user kay mu appointment siyag event like bunyag, etc..</p>
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-3 me-5">
              <DatePicker
                inline
                selected={startDate}
                onChange={(date) => setStartDate(date)}
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
  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">3. Submit requirements</h5>
          <p>himo-an pag files per service offered kay lahi lahi type requirement i pass</p>
        </div>
      </div>
  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">4. Submit Payment</h5>
            {churchData && churchData.churchQRDetail && churchData.churchInstruction &&(
               <div>
                <p>{churchData.churchInstruction}</p>
                <img src={churchData.churchQRDetail} alt="Church QR Code" className="qr-image mx-auto d-block" />
             </div>
            )}
            <br/>
            <div className="d-flex align-items-center mb-3">
              <input className="form-control me-2" type="file" id="formFile" />
              <button type="reset" className="btn btn-danger">Clear</button>
            </div>

        </div>
      </div>

  
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">5. Finalize details</h5>
          <p>mga input fields rani diri nga read only. diri mu reflect mga choices gi make sa user</p>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="submit" className="btn btn-success me-md-2">Finalize</button>
            <button type="reset" className="btn btn-danger">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default ChurchHomepageBook;


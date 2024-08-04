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
  const [services, setServices] = useState({ activeSchedules: [], activeRequests: [] });
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [requirements, setRequirements] = useState('');

  // State variables for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    fatherFirstName: '',
    fatherLastName: '',
    motherFirstName: '',
    motherLastName: '',
    confirmationDate: '',
    brideFirstName: '',
    brideLastName: '',
    groomFirstName: '',
    groomLastName: '',
    marriageDate: '',
    deathCertificate: null,
  });

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

  useEffect(() => {
    const fetchRequirements = async () => {
      if (selectedServiceType === "Request Document" && selectedService) {
        const requirementsDoc = await getDoc(doc(db, 'requirements', selectedService));
        if (requirementsDoc.exists()) {
          setRequirements(requirementsDoc.data().requirements);
        } else {
          setRequirements('No specific requirements.');
        }
      }
    };

    fetchRequirements();
  }, [selectedServiceType, selectedService]);

  // Handle form data change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book an Appointment</h2>
      <h2 className="mb-4">ako ra gi layout daan</h2>
  
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
      )}

      {selectedServiceType === "Request Document" && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Submit requirements</h5>
            {selectedService === "Baptismal Certificate" && (
              <div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="birthday" className="form-label">Birthday</label>
                  <input type="date" className="form-control" id="birthday" name="birthday" value={formData.birthday} onChange={handleInputChange} />
                </div>
                <div>Father</div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="fatherFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="fatherFirstName" name="fatherFirstName" value={formData.fatherFirstName} onChange={handleInputChange} />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="fatherLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="fatherLastName" name="fatherLastName" value={formData.fatherLastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div>Mother</div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="motherFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="motherFirstName" name="motherFirstName" value={formData.motherFirstName} onChange={handleInputChange} />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="motherLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="motherLastName" name="motherLastName" value={formData.motherLastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit</button>
                  <button type="reset" className="btn btn-danger">Clear</button>
                </div>
              </div>
            )}
            {selectedService === "Confirmation Certificate" && (
              <div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmationDate" className="form-label">Date of Confirmation</label>
                  <input type="date" className="form-control" id="confirmationDate" name="confirmationDate" value={formData.confirmationDate} onChange={handleInputChange} />
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit</button>
                  <button type="reset" className="btn btn-danger">Clear</button>
                </div>
              </div>
            )}
            {selectedService === "Marriage Certificate" && (
              <div>
                <div>Bride's</div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="brideFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="brideFirstName" name="brideFirstName" value={formData.brideFirstName} onChange={handleInputChange} />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="brideLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="brideLastName" name="brideLastName" value={formData.brideLastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div>Groom's</div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="groomFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="groomFirstName" name="groomFirstName" value={formData.groomFirstName} onChange={handleInputChange} />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="groomLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="groomLastName" name="groomLastName" value={formData.groomLastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="marriageDate" className="form-label">Date of Marriage</label>
                  <input type="date" className="form-control" id="marriageDate" name="marriageDate" value={formData.marriageDate} onChange={handleInputChange} />
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit</button>
                  <button type="reset" className="btn btn-danger">Clear</button>
                </div>
              </div>
            )}
            {selectedService === "Burial Certificate" && (
              <div>
                <div className="mb-3">
                  <label htmlFor="deathCertificate" className="form-label">Death Certificate</label>
                  <input className="form-control" type="file" id="deathCertificate" name="deathCertificate" onChange={handleFileChange} />
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit</button>
                  <button type="reset" className="btn btn-danger">Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
  
      <div className="card mb-4">
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
      </div>

  
      <div className="card mb-4">
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
      </div>
    </div>
  );
};

export default ChurchHomepageBook;

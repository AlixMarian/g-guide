import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import BaptismalCertificate from './forms/BaptismalCertificate';
import ConfirmationCertificate from './forms/ConfirmationCertificate';
import MarriageCertificate from './forms/MarriageCertificate';
import BurialCertificate from './forms/BurialCertificate';
import Marriage from './forms/Marriage';
import MassIntention from './forms/MassIntention';

export const ChurchHomepageBook = () => {
  const { churchId } = useParams();
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

  const handleServiceTypeChange = (serviceType) => {
    setSelectedServiceType(serviceType);
    setSelectedService(''); // Clear selected service when changing service type
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book Church Services</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Select from the services we offer</h5>
          <div className="row">
            <div className="col-12 col-md-auto mb-2 mb-md-0">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="servicesTypeDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {selectedServiceType || "Select Service Type"}
                </button>
                <ul className="dropdown-menu" aria-labelledby="servicesTypeDropdown">
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault();handleServiceTypeChange("Book an Appointment");}}>Book an Appointment</a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); handleServiceTypeChange("Request Document");}}>Request Document</a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#"onClick={(e) => {e.preventDefault();handleServiceTypeChange("Mass Intentions");}}>Mass Intentions</a>
                  </li>
                </ul>
              </div>
            </div>
            {selectedServiceType && selectedServiceType !== "Mass Intentions" && (
              <div className="col-12 col-md-auto">
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="servicesDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {selectedService || "Select Type"}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="servicesDropdown">
                    {selectedServiceType === "Book an Appointment" &&
                      services.activeSchedules.map((service, index) => (
                        <li key={index}>
                          <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault();setSelectedService(service);}}>{service}</a>
                        </li>
                      ))}
                    {selectedServiceType === "Request Document" &&
                      services.activeRequests.map((service, index) => (
                        <li key={index}>
                          <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault();setSelectedService(service);}}>{service}</a>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {selectedServiceType === "Mass Intentions" && <MassIntention />}
      {selectedServiceType === "Book an Appointment" && selectedService === "Marriages" && <Marriage />}
      {selectedServiceType === "Request Document" && (
        <div>
          {selectedService === "Baptismal Certificate" && <BaptismalCertificate />}
          {selectedService === "Confirmation Certificate" && <ConfirmationCertificate />}
          {selectedService === "Marriage Certificate" && <MarriageCertificate />}
          {selectedService === "Burial Certificate" && <BurialCertificate />}
        </div>
      )}
    </div>
  );
};

export default ChurchHomepageBook;

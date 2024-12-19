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
import Baptism from './forms/Baptism';
import Burial from './forms/Burial';
import Confirmation from './forms/Confirmation';




export const ChurchHomepageBook = () => {
  const { churchId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [churchData, setChurchData] = useState(null);
  const [services, setServices] = useState({
    appointments: [],
    documentRequests: [],
    massIntentions: false,
  });
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
        const appointments = Object.entries(data)
          .filter(([key, value]) => value.active && ["Marriage", "Baptism", "Confirmation", "Burials"].includes(key))
          .map(([key]) => key);
        const documentRequests = Object.entries(data)
          .filter(([key, value]) => value.active && ["Baptismal Certificate", "Confirmation Certificate", "Marriage Certificate", "Burial Certificate"].includes(key))
          .map(([key]) => key);
        const massIntentions = data["Mass Intentions"]?.active || false;




        setServices({
          appointments,
          documentRequests,
          massIntentions,
        });
      }
    };




    fetchChurchData();
    fetchServices();
  }, [churchId]);




  const handleServiceTypeChange = (serviceType) => {
    setSelectedServiceType(serviceType);
    setSelectedService('');
  };


  const appointmentTypeMapping = {
    Marriage: 'Wedding',
  };


  const mapServiceName = (serviceName) => appointmentTypeMapping[serviceName] || serviceName;




  if (!services) {
    return <div>Loading services...</div>;
  }




  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book Church Services</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Select from the services we offer</h5>
          <div className="row">
            <div className="col-12 col-md-auto mb-2 mb-md-0">
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="servicesTypeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  {selectedServiceType || "Select Service Type"}
                </button>
                <ul className="dropdown-menu" aria-labelledby="servicesTypeDropdown">
                  {services.appointments.length > 0 && (
                    <li>
                      <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); handleServiceTypeChange("Book an Appointment"); }}>
                        Book an Appointment
                      </a>
                    </li>
                  )}
                  {services.documentRequests.length > 0 && (
                    <li>
                      <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); handleServiceTypeChange("Request Document"); }}>
                        Request Document
                      </a>
                    </li>
                  )}
                  {services.massIntentions && (
                    <li>
                      <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); setSelectedServiceType("Mass Intentions"); setSelectedService("Mass Intentions"); }}>
                        Mass Intentions
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            {selectedServiceType && selectedServiceType !== "Mass Intentions" && (
              <div className="col-12 col-md-auto">
                <div className="dropdown">
                  <button className="btn btn-secondary dropdown-toggle" type="button" id="servicesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  {mapServiceName(selectedService) || 'Select Type'}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="servicesDropdown">
                    {selectedServiceType === "Book an Appointment" &&
                      services.appointments.map((service, index) => (
                        <li key={index}>
                          <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); setSelectedService(service); }}>
                          {mapServiceName(service)}
                          </a>
                        </li>
                      ))}
                    {selectedServiceType === "Request Document" &&
                      services.documentRequests.map((service, index) => (
                        <li key={index}>
                          <a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); setSelectedService(service); }}>
                            {service}
                          </a>
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




      {selectedServiceType === "Book an Appointment" && (
        <div>
          {selectedService === "Marriage" && <Marriage />}
          {selectedService === "Baptism" && <Baptism />}
          {selectedService === "Burials" && <Burial />}
          {selectedService === "Confirmation" && <Confirmation />}
        </div>
      )}
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










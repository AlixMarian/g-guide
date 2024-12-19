import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';


export const ChurchHomepageInfo = () => {
  const { churchId } = useParams();
  const [churchData, setChurchData] = useState(null);
  const [services, setServices] = useState({ activeSchedules: [], activeRequests: [] });

  useEffect(() => {
    const fetchChurchData = async () => {
      const docRef = doc(db, 'church', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChurchData(docSnap.data());
      }
    };

    const fetchServices = async () => {
      try {
        const servicesDoc = await getDoc(doc(db, 'services', churchId));
        if (servicesDoc.exists()) {
          const data = servicesDoc.data();
          const activeServices = Object.entries(data)
            // eslint-disable-next-line no-unused-vars
            .filter(([key, value]) => value.active) 
            .map(([key, value]) => ({
              name: key,
              fee: value.fee,
              instructions: value.instructions,
            }));
          setServices(activeServices);
        } else {
          console.error('Services data not found');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchChurchData();
    fetchServices();
  }, [churchId]);

  const appointmentTypeMapping = {
    Marriage: 'Wedding',
  };

  const mapServiceName = (serviceName) => appointmentTypeMapping[serviceName] || serviceName;

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  const renderServiceHours = (churchData) => {
    if (!churchData.churchStartTime || !churchData.churchEndTime || 
      churchData.churchStartTime === "none" || churchData.churchEndTime === "none") {
      return 'Information unavailable';
    }
    return `${convertTo12HourFormat(churchData.churchStartTime)} - ${convertTo12HourFormat(churchData.churchEndTime)}`;
  };

  if (!churchData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='churchInfo card'>
        <div className='card-body'>
          <h3 className='card-title'>Church Information</h3>
          <p><strong>Service Hours:</strong> {renderServiceHours(churchData)}</p>
          <p><strong>Email:</strong> {churchData.churchEmail}</p>
          <p><strong>Contact Number:</strong> {churchData.churchContactNum}</p>
          <p><strong>Address:</strong> {churchData.churchAddress}</p>
          <p><strong>Registration Date:</strong> {churchData.churchRegistrationDate}</p>
        </div>
      </div>
  
      <br/>
  
      <div className='churchHistory card'>
        <div className='card-body'>
          <h3 className='card-title'>Church History</h3>
          <p>{churchData.churchHistory}</p>
        </div>
      </div>
  
      <br/>
  
      <div className="churchServices card">
        <div className="card-body">
          <h3 className="card-title">Services We Offer</h3>
          {services.length > 0 ? (
            services.map((service, index) => (
              <div key={index} className="service-item">
                <h5>{mapServiceName(service.name)}</h5>
                <p><strong>Fee:</strong> {service.fee ? `₱${service.fee}` : 'Free'}</p>
                <p><strong>Instructions:</strong> {service.instructions || 'No instructions provided'}</p>
              </div>
            ))
          ) : (
            <p>No active services available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default ChurchHomepageInfo;

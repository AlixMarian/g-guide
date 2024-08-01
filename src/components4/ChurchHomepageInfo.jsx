import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';


export const ChurchHomepageInfo = () => {
  const { churchId } = useParams();
  const [churchData, setChurchData] = useState(null);
  const [services, setServices] = useState([]);

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
        <p><strong>Service Hours:</strong>  {renderServiceHours(churchData)}</p>
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
        <div className='card-body'>
          <h3 className='card-title'>Services we offer</h3>
          {services.length > 0 ? (
                services.map((service, index) => (
                  <div className="card mb-3" key={index}>
                    <div className="card-body">
                      <h5 className="card-title">{service}</h5>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">No Services Available</h5>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default ChurchHomepageInfo;

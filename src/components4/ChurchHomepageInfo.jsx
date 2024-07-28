import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';


export const ChurchHomepageInfo = () => {
  const { churchId } = useParams();
  const [churchData, setChurchData] = useState(null);

  useEffect(() => {
    const fetchChurchData = async () => {
      const churchDoc = await getDoc(doc(db, 'church', churchId));
      if (churchDoc.exists()) {
        setChurchData(churchDoc.data());
      } else {
        console.error('Church not found');
      }
    };

    fetchChurchData();
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
    </div>
  );
};

export default ChurchHomepageInfo;

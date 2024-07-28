import '../websiteUser.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc} from 'firebase/firestore';
import { db } from '/backend/firebase';

export const ChurchHomepageAnnouncements = () => {
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

  if (!churchData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>Announcement Page of {churchData.churchName}</h3>
    </div>
  )
}

export default ChurchHomepageAnnouncements;

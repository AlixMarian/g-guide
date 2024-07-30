import '../websiteUser.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where} from 'firebase/firestore';
import { db } from '/backend/firebase';


export const ChurchHomepageAnnouncements = () => {
  const { churchId } = useParams();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(collection(db, 'announcements'), where('creatorId', '==', churchId));
        const querySnapshot = await getDocs(q);
        const announcementsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(announcementsList);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, [churchId]);



  return (
    <div>
      {announcements.length === 0 ? (
        <div className="card mb-3 alert alert-info">
          <div className="card-body">
            <h5 className="card-title">No Announcements</h5>
          </div>
        </div>
      ) : (
        announcements.map((announcement) => (
          <div className="card mb-3" key={announcement.id}>
            <div className="card-body">
              <h5 className="card-title">{announcement.uploadDate.toDate().toLocaleDateString()}</h5>
              <p className="card-text">{announcement.announcement}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ChurchHomepageAnnouncements;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChurchHomepageInfo from './ChurchHomepageInfo';
import ChurchHomepageAnnouncements from './ChurchHomepageAnnouncements';
import ChurchHomepageMassSchedule from './ChurchHomepageMassSchedule';
import ChurchHomepageBook from './ChurchHomepageBook';
import ChurchHomepageReqVol from './ChurchHomepageReqVol';
import '../websiteUser.css';

const ChurchHomepage = () => {
  const { churchId } = useParams();
  const [church, setChurch] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activeComponent, setActiveComponent] = useState('info');

  useEffect(() => {
    const fetchChurch = async () => {
      if (churchId) {
        const churchDoc = await getDoc(doc(db, 'church', churchId));
        if (churchDoc.exists()) {
          setChurch(churchDoc.data());
        } else {
          console.error('No such document!');
        }
      }
    };

    const fetchPhotos = async () => {
      const photosCollection = collection(db, 'churchPhotos');
      const photosSnapshot = await getDocs(photosCollection);
      const photosList = photosSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(photo => photo.uploader === churchId);

      setPhotos(photosList);
    };

    fetchChurch();
    fetchPhotos();
  }, [churchId]);

  const renderCarouselItems = () => {
    if (photos.length === 0) {
      return (
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://firebasestorage.googleapis.com/v0/b/g-guide-1368b.appspot.com/o/default%2FchurchPhotoNoImage.png?alt=media&token=be0276ce-08a8-4560-9cd6-191c5a0e26a4"
            alt="No Images Available"
          />
        </Carousel.Item>
      );
    }

    return photos.map(photo => (
      <Carousel.Item key={photo.id}>
        <img
          className="d-block w-100"
          src={photo.photoLink}
          alt="Church Photo"
        />
      </Carousel.Item>
    ));
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'info':
        return <ChurchHomepageInfo />;
      case 'announcements':
        return <ChurchHomepageAnnouncements />;
      case 'massSchedule':
        return <ChurchHomepageMassSchedule />;
      case 'book':
        return <ChurchHomepageBook />;
      case 'reqVol':
        return <ChurchHomepageReqVol />;
      default:
        return <ChurchHomepageInfo />;
    }
  };

  if (!church) {
    return <div>Loading...</div>;
  }

  return (
    <div className="churchHomepageContainer">
      <Carousel>
        {renderCarouselItems()}
      </Carousel>
      <h1>{church.churchName}</h1>
      
        <div className='churchHomepageContents'>
            <div className='pageNavigation'>
            <p className="d-inline-flex gap-1">
                <button className="btn btn-primary" onClick={() => setActiveComponent('info')}>Information</button>
                <button className="btn btn-primary" onClick={() => setActiveComponent('announcements')}>Announcements</button>
                <button className="btn btn-primary" onClick={() => setActiveComponent('massSchedule')}>Mass Schedules</button>
                <button className="btn btn-primary" onClick={() => setActiveComponent('book')}>Book an Appointment</button>
                <button className="btn btn-primary" onClick={() => setActiveComponent('reqVol')}>Request for Volunteers</button>
            </p>
            </div>
        

        <div className='pageBody'>
            <div className="row">
                <div className="collapse show" id="multiCollapseExample1">
                    {renderActiveComponent()}
                </div>
            
            </div>
        </div>
        </div>
    </div>
  );
};

export default ChurchHomepage;

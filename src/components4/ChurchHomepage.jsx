import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc, query, where, getDocsFromServer } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Carousel } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChurchHomepageInfo from './ChurchHomepageInfo';
import ChurchHomepageAnnouncements from './ChurchHomepageAnnouncements';
import ChurchHomepageMassSchedule from './ChurchHomepageMassSchedule';
import ChurchHomepageBook from './ChurchHomepageBook';
import ChurchHomepageReqVol from './ChurchHomepageReqVol';
import '../websiteUser.css';
import { toast } from 'react-toastify';

const ChurchHomepage = () => {
  const { churchId } = useParams();
  const [church, setChurch] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activeComponent, setActiveComponent] = useState('info');
  const [bookmarkFilled, setBookmarkFilled] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

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

    const checkBookmark = async () => {
      if (user && churchId) {
        const q = query(collection(db, 'userBookmark'), where('webUserId', '==', user.uid), where('churchId', '==', churchId));
        const querySnapshot = await getDocsFromServer(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setBookmarkFilled(true);
          setBookmarkId(doc.id);
        } else {
          setBookmarkFilled(false);
          setBookmarkId(null);
        }
      }
    };

    fetchChurch();
    fetchPhotos();
    checkBookmark();
  }, [churchId, user]);

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
        return <ChurchHomepageBook selectedChurchId={churchId} />;
      case 'reqVol':
        return <ChurchHomepageReqVol />;
      default:
        return <ChurchHomepageInfo />;
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      console.error('User is not logged in.');
      return;
    }

    try {
      if (bookmarkFilled) {
        await deleteDoc(doc(db, 'userBookmark', bookmarkId));
        setBookmarkFilled(false);
        setBookmarkId(null);
        toast.success('Removed from bookmarks');
      } else {
        const docRef = await addDoc(collection(db, 'userBookmark'), {
          churchId: churchId,
          webUserId: user.uid
        });
        setBookmarkFilled(true);
        setBookmarkId(docRef.id);
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
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
  
      <div className="churchHomepageContents col-12 col-lg-12 d-flex flex-column align-items-center">

      <div className='churchTitle col-md-12 text-center mt-1'>
        <h1 className='mb-2'>{church.churchName}</h1>
      </div>
      
      <div className='bookmark d-flex align-items-center justify-content-center mb-3'>
          <i 
            className={`bi ${bookmarkFilled ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}`} 
            style={{ fontSize: '2rem', cursor: 'pointer' }} 
            onClick={toggleBookmark}
          ></i>
          <p 
            className='mb-0 ms-2'
            style={{ fontSize: '1rem', cursor: 'pointer' }} 
          ><b>{bookmarkFilled ? 'Remove from Bookmarks' : 'Add to Bookmarks'}</b></p>
      </div>

        <div className='pageNavigation col-md-12 d-flex justify-content-center'>
          <p className="d-inline-flex gap-1">
            <button className="btn btn-primary" onClick={() => setActiveComponent('info')}>Information</button>
            <button className="btn btn-primary" onClick={() => setActiveComponent('announcements')}>Announcements</button>
            <button className="btn btn-primary" onClick={() => setActiveComponent('massSchedule')}>Mass Schedules</button>
            <button className="btn btn-primary" onClick={() => setActiveComponent('book')}>Book an Appointment</button>
            <button className="btn btn-primary" onClick={() => setActiveComponent('reqVol')}>Request for Volunteers</button>
          </p>
        </div>
  
        <div className='pageBody col-md-12 d-flex justify-content-center'>
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

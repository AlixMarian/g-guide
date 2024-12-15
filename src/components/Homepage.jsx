import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import '../websiteUser.css';
import useChatbot from './Chatbot';
import Pagination from 'react-bootstrap/Pagination';
import OngoingAppointments from './OngoingAppointments';
import UpcomingAppointments from './UpcomingAppointments';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';

export const Homepage = () => {
  const navigate = useNavigate();
  const [bookmarkedChurches, setBookmarkedChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBookmarkPage, setCurrentBookmarkPage] = useState(1);
  const bookmarksPerPage = 2;
  useChatbot();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
        fetchBookmarkedChurches(user.uid);
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchBookmarkedChurches = async (userId) => {
    try {
      const bookmarksQuery = query(collection(db, 'userBookmark'), where('webUserId', '==', userId));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);

      const churchIds = bookmarksSnapshot.docs.map(doc => doc.data().churchId);
      const churchPromises = churchIds.map(churchId => getDoc(doc(db, 'church', churchId)));
      const churchSnapshots = await Promise.all(churchPromises);

      const churches = churchSnapshots.map(churchDoc => ({
        id: churchDoc.id,
        ...churchDoc.data()
      }));

      setBookmarkedChurches(churches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarked churches:', error);
      setLoading(false);
    }
  };


  const indexOfLastBookmark = currentBookmarkPage * bookmarksPerPage;
  const indexOfFirstBookmark = indexOfLastBookmark - bookmarksPerPage;
  const currentBookmark = bookmarkedChurches.slice(indexOfFirstBookmark, indexOfLastBookmark);

  const paginateBookmark = (pageNumberBookmark) => setCurrentBookmarkPage(pageNumberBookmark);

  const pageNumbersBookmarks = [];
  for (let i = 1; i <= Math.ceil(bookmarkedChurches.length / bookmarksPerPage); i++) {
    pageNumbersBookmarks.push(i);
  }

  if (loading) {
    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <img src={loadingGif} alt="Loading..." style={{ width: '100px', justifyContent: 'center' }} />
    </div>  
    )
  }

  return (
    <div className="homepage-container d-flex align-items-center">
      <div className="container">
          <div className="col-md-12 mb-5">
            <div className="card text-bg-dark shadow-lg" style={{ height: '300px' }}>
              <div className="position-relative" style={{ height: '100%' }}>
                <img src="src/assets/mapImg.png" className="card-img" alt="Map Background" style={{height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'center',}}/>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1,
                  }}
                />
              </div>
              <div className="card-img-overlay d-flex flex-column justify-content-center align-items-start" style={{ zIndex: 2 }}>
                <h2 className="card-title">In need of a local church?</h2>
                <p className="card-text">
                  We can help you find your nearest church, get up-to-date information,
                  and connect with them.
                </p>
                
                <div className="d-flex align-items-center">
                  <h2 className="m-0 me-3"><i>Open Church Finder Maps</i></h2>
                  <h1 className="m-0">
                    <i type="button" className="bi bi-arrow-right-circle-fill" onClick={() => navigate('/map')}></i>
                  </h1>
                </div>
              </div>
            </div>
          </div>
          
       
        <div className='row'>
        <div className="col-md-6" style={{ height: '500px' }}>
            <UpcomingAppointments/>
          </div>
        <div className="col-md-6">
        <div className="card">
          <div className="card-body d-flex align-items-center justify-content-between">
            <h5 className="card-title mb-0"><b>Bookmarked Churches</b></h5>
          </div>
          <div className="card-body" style={{ height: '438px' }}>
            <div className="d-flex flex-column h-100">
              <div className="flex-grow-1">
                <div className="row">
                  {bookmarkedChurches.length > 0 ? (
                    currentBookmark.map((church) => (
                      <div key={church.id} className="col-12 mb-3">
                        <div className="card">
                          <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                              <h5 className="card-title mb-0">{church.churchName}</h5>
                              <p className="card-text mb-0">{church.location}</p>
                            </div>
                            <button
                              className="btn btn-custom-primary"
                              onClick={() => navigate(`/church-homepage/${church.id}`)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-arrow-right-square-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1" />
                              </svg>{' '}
                              Visit Church Information Page
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <h4 className="text-muted text-center">No Bookmarks</h4>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  {pageNumbersBookmarks.map((number) => (
                    <Pagination.Item
                      key={number}
                      active={number === currentBookmarkPage}
                      onClick={() => paginateBookmark(number)}
                    >
                      {number}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
        <div className='mt-2'>
          <OngoingAppointments/>
        </div>
      </div>
    </div>
  );
} 

export default Homepage;

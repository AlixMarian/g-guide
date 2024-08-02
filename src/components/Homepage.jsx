import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import '../websiteUser.css';
import useChatbot from './Chatbot';

export const Homepage = () => {
  const navigate = useNavigate();
  const [bookmarkedChurches, setBookmarkedChurches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleViewAppnts = () => {
    navigate('/view-appointments');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="homepage-container d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">In need of a local church?</h5>
                <p className="card-text">We can help you find your nearest church, get up-to-date information, and connect with them</p>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/map')}>Open Maps</button>
              </div>
              <img src="src/assets/mapImg.png" className="card-img-bottom" alt="..."/>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title"><b>Bookmarked Churches</b></h5>
                {bookmarkedChurches.length > 0 ? (
                  bookmarkedChurches.map((church) => (
                    <div className="card w-100 mb-3" key={church.id}>
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                          <h5 className="card-title mb-0">{church.churchName}</h5>
                          <p className="card-text mb-0">{church.location}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => navigate(`/church-homepage/${church.id}`)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                            <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"/>
                          </svg> Visit Church Information Page
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No Bookmarks</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0"><b>Upcoming Appointments</b></h5>
                <button type="button" className="btn btn-primary ms-3" onClick={handleViewAppnts}>View Appointment History</button>
              </div>
              <div className="card-body">
                <div className="card w-100 mb-3">
                  <div className="card-body d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="card-title mb-0">Sample Church 1</h5>
                        <p className="card-text mb-0">Church Location</p>
                        <p className="card-text mb-0"><b>Status: Pending  </b></p>
                      </div>
                    <a href="#" className="btn btn-info">View Information</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;

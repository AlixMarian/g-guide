import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useParams } from 'react-router-dom';

export const ChurchHomepageReqVol = () => {
  const { churchId } = useParams();
  const [ongoingPosts, setOngoingPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerse, setShowVerse] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      try {
        if (!churchId) {
          console.error('Church ID is missing. Cannot fetch posts.');
          return;
        }

        // Query for ongoing posts
        const ongoingQuery = query(
          collection(db, 'requestVolunteers'),
          where('churchId', '==', churchId),
          where('status', '==', 'ongoing')
        );

        // Query for archived posts
        const archivedQuery = query(
          collection(db, 'requestVolunteers'),
          where('churchId', '==', churchId),
          where('status', '==', 'archived')
        );

        // Fetch both ongoing and archived posts
        const [ongoingSnapshot, archivedSnapshot] = await Promise.all([
          getDocs(ongoingQuery),
          getDocs(archivedQuery),
        ]);

        // Map snapshots to arrays of post data
        const ongoingList = ongoingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const archivedList = archivedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort posts by uploadDate in descending order
        ongoingList.sort((a, b) => b.uploadDate.toDate() - a.uploadDate.toDate());
        archivedList.sort((a, b) => b.uploadDate.toDate() - a.uploadDate.toDate());

        // Update state with sorted data
        setOngoingPosts(ongoingList);
        setArchivedPosts(archivedList);

        // Show Bible verse if there are archived posts
        setShowVerse(archivedList.length > 0);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [churchId]);

  return (
    <div className='container mt-5'>
      <h2>In Progress</h2>
      <div className='col-12 col-lg-12'>
      {loading ? (
          <div className="card mb-3 alert alert-info">
            <div className="card-body">
              <h5 className="card-title">Loading ongoing requests...</h5>
            </div>
          </div>
        ) : ongoingPosts.length === 0 ? (
          <div className="card mb-3 alert alert-info">
            <div className="card-body">
              <h5 className="card-title">No Ongoing Requests Available</h5>
            </div>
          </div>
        ) : (
          ongoingPosts.map((post) => (
            <div className="card mb-3" key={post.id}>
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <small className="text-muted">
                  {`Posted on ${post.uploadDate.toDate().toLocaleDateString()} at ${post.uploadDate
                    .toDate()
                    .toLocaleTimeString()}`}
                </small>
                <br />
                <small className="text-muted">
                  {`Duration: ${post.startDate.toDate().toLocaleDateString()} - ${post.endDate
                    .toDate()
                    .toLocaleDateString()}`}
                </small>
                <p>-----------------</p>
                <p className="card-text">
                  <strong>{`Event: ${post.event}`}</strong>
                </p>
                <p className="card-text">{post.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <br/>
      <h2>Completed</h2>
      
      <div className='col-12 col-lg-12'>
      {loading ? (
          <div className="card mb-3 alert alert-info">
            <div className="card-body">
              <h5 className="card-title">Loading completed requests...</h5>
            </div>
          </div>
        ) : showVerse && (
          <p>
            <em>
              God is not unjust; he will not forget your work and the love you
              have shown him as you have helped his people and continue to help
              them.
            </em>{' '}
            - Hebrews 6:10
          </p>
        )}
        {archivedPosts.length === 0 ? (
          <div className="card mb-3 alert alert-info">
            <div className="card-body">
              <h5 className="card-title">No Completed Requests Available</h5>
            </div>
          </div>
        ) : (
          archivedPosts.map((post) => (
            <div key={post.id}>
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <small className="text-muted">
                    {`Posted on ${post.uploadDate.toDate().toLocaleDateString()} at ${post.uploadDate
                      .toDate()
                      .toLocaleTimeString()}`}
                  </small>
                  <br />
                  <small className="text-muted">
                    {`Duration: ${post.startDate.toDate().toLocaleDateString()} - ${post.endDate
                      .toDate()
                      .toLocaleDateString()}`}
                  </small>
                  <p>-----------------</p>
                  <p className="card-text">
                    <strong>{`Event: ${post.event}`}</strong>
                  </p>
                  <p className="card-text">{post.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChurchHomepageReqVol;

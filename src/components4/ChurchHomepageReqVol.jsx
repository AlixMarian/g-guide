import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useParams } from 'react-router-dom';

export const ChurchHomepageReqVol = () => {
  const { churchId } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'requestVolunteers'), where('uploader', '==', churchId));
        const querySnapshot = await getDocs(q);
        const postsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsList);
      } catch (error) {
        console.error('Error fetching posts: ', error);
      }
    };

    fetchPosts();
  }, [churchId]);

  return (
    <div className='container mt-5'>
      <h2>Volunteer Requests</h2>
      {posts.map((post) => (
        <div className="card mb-3" key={post.id}>
          <div className="card-body">
            <h5 className="card-title">{post.title}</h5>
            <small className="text-muted">
              {`Posted on ${post.uploadDate.toDate().toLocaleDateString()} at ${post.uploadDate.toDate().toLocaleTimeString()}`}
            </small>
            <p className="card-text">{post.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChurchHomepageReqVol;

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, query, where, getDocs, Timestamp , deleteDoc} from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../churchCoordinator.css';


export const ReqVol = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [userData, setUserData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [churchData, setChurchData] = useState({});
  const [reqVolunteerTitleInput, setReqVolunteerTitleInput] = useState('');
  const [reqVolunteerBodyInput, setReqVolunteerBodyInput] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user);
        console.log("User id signed in:", user.uid);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);

            // Fetch church data
            const churchDoc = await getDoc(doc(db, "church", user.uid));
            if (churchDoc.exists()) {
              setChurchData(churchDoc.data());
            } else {
              toast.error("Church data not found");
            }
          } else {
            toast.error("User data not found");
          }
        } catch (error) {
          toast.error("Error fetching user data");
        }
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleTitleChange = (e) => {
    setReqVolunteerTitleInput(e.target.value);
  };

  const handleBodyChange = (e) => {
    setReqVolunteerBodyInput(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await addDoc(collection(db, 'requestVolunteers'), {
          title: reqVolunteerTitleInput,
          content: reqVolunteerBodyInput,
          uploader: user.uid,
          uploadDate: Timestamp.now(),
        });

        toast.success('Successfully posted');
        setReqVolunteerTitleInput('');
        setReqVolunteerBodyInput('');
        fetchPosts();
      } catch (error) {
        toast.error('Error in making post: ' + error.message);
      }
    } else {
      toast.error('User not authenticated');
    }
  };

  const fetchPosts = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const q = query(collection(db, 'requestVolunteers'), where('uploader', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(userPosts);
      } catch (error) {
        toast.error('Error fetching posts: ' + error.message);
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'requestVolunteers', postId));
      toast.success('Post deleted successfully');
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      toast.error('Error deleting post: ' + error.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);



  return (
    <div className='ReqAnnouncement'>
      <h1>Request for Volunteers</h1>

      <div className="createPost col-12 col-lg-12">
        <h3>Create Post</h3>
        <form onSubmit={handleFormSubmit}>
          <div className='titleArea col-md-12'>
            <label htmlFor="reqVolunteerTitle" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="reqVolunteerTitle"
              value={reqVolunteerTitleInput}
              onChange={handleTitleChange}
              required
            />
            <br/>
          </div>

          <div className='contentArea col-md-12'>
            <label htmlFor="reqVolunteerBody" className="form-label">Enter Content</label>
            <textarea
              className="form-control"
              id="reqVolunteerBody"
              rows="5"
              value={reqVolunteerBodyInput}
              onChange={handleBodyChange}
              required
            ></textarea>
          </div>

          <br/>

          <div className="buttonAreas col-md-12 d-grid gap-2 d-md-block">
                <button type="submit" className="btn btn-success me-2">Create Post</button>
                <button type="reset" className="btn btn-danger me-2">Clear</button>
          </div>

        </form>
      </div>

      <div className='displayPost col-12 col-lg-12'>
        <h2>Your Posts</h2>
        {posts.map((post) => (
          <div className="card mb-3" key={post.id}>
            <div className="card-body">
              <h5 className="card-title">{post.title}</h5>
              <small className="text-muted">
                  {`Posted on ${post.uploadDate.toDate().toLocaleDateString()} at ${post.uploadDate.toDate().toLocaleTimeString()}`}
                </small>
              <p className="card-text">{post.content}</p>
              <button
                className="btn btn-danger"
                onClick={() => handleDeletePost(post.id)}
              >Delete Post</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ReqVol;
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs,onSnapshot, updateDoc, Timestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
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
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [editing, setEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  const handleTitleChange = (e) => setReqVolunteerTitleInput(e.target.value);
  const handleBodyChange = (e) => setReqVolunteerBodyInput(e.target.value);
  const handleStartDateChange = (e) => setStartDateInput(e.target.value);
  const handleEndDateChange = (e) => setEndDateInput(e.target.value);
  const handleEventChange = (e) => setSelectedEvent(e.target.value);


  const auth = getAuth();
  const user = auth.currentUser;


  const fetchEvents = async (user) => {
    const q = query(collection(db, 'events'), where('creatorId', '==', user.uid));
    const eventsSnapshot = await getDocs(q);
    const eventsList = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEvents(eventsList);
  };

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

  

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    
    
    const startDateTimestamp = Timestamp.fromDate(startDate);
    const endDateTimestamp = Timestamp.fromDate(endDate);
  
    
    if (editing) {
      try {
        await updateDoc(doc(db, 'requestVolunteers', currentPostId), {
          title: reqVolunteerTitleInput,
          content: reqVolunteerBodyInput,
          event: selectedEvent,
          startDate: startDateTimestamp,
          endDate: endDateTimestamp,
          
        });
        toast.success('Post updated successfully');
      } catch (error) {
        toast.error('Error updating post: ' + error.message);
      }
    } else {
      
      if (user) {
        try {
          await addDoc(collection(db, 'requestVolunteers'), {
            title: reqVolunteerTitleInput,
            content: reqVolunteerBodyInput,
            uploader: user.uid,
            uploadDate: Timestamp.now(),
            startDate: Timestamp.fromDate(new Date(startDateInput)),
            endDate: Timestamp.fromDate(new Date(endDateInput)),
            event: selectedEvent,
            status: 'ongoing',
          });
          toast.success('Volunteer request posted successfully');
        } catch (error) {
          toast.error('Error posting volunteer request: ' + error.message);
        }
      } else {
        toast.error('No user signed in.');
      }
    }
  
    
    resetForm();
    fetchPosts();
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
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPosts(user);
        fetchEvents(user);
      } else {
        console.log("No user signed in.");
      }
    });
  }, []);
  

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'requestVolunteers'), where('uploader', '==', user.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const postsList = [];
      const today = new Date();

      for (const docSnap of querySnapshot.docs) {
        const post = { id: docSnap.id, ...docSnap.data() };

        // Check if the post's endDate has passed and update its status
        if (post.endDate.toDate() < today && post.status !== 'archived') {
          await updateDoc(doc(db, 'requestVolunteers', post.id), { status: 'archived' });
        }

        postsList.push(post);
      }

      setPosts(postsList);
    }, (error) => {
      console.error('Error fetching posts: ', error);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [user]);

  const handleArchivePost = async (postId) => {
    try {
      const postRef = doc(db, 'requestVolunteers', postId);
      await updateDoc(postRef, { status: 'archived' });
      toast.success('Post archived successfully');
    } catch (error) {
      toast.error('Error archiving post: ' + error.message);
    }
  };

  const handleUnarchivePost = async (postId) => {
    try {
      const postRef = doc(db, 'requestVolunteers', postId);
      await updateDoc(postRef, { status: 'ongoing' });
      toast.success('Post unarchived successfully');
    } catch (error) {
      toast.error('Error unarchiving post: ' + error.message);
    }
  };

  const handleEditPost = (post) => {
    setReqVolunteerTitleInput(post.title);
    setReqVolunteerBodyInput(post.content);
    setSelectedEvent(post.event);
  
    
    const startDate = post.startDate.toDate();
    const endDate = post.endDate.toDate();
    
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    setStartDateInput(startDateString);
    setEndDateInput(endDateString);
    
    setEditing(true);
    setCurrentPostId(post.id);
  };
  

  const handleCancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setReqVolunteerTitleInput('');
    setReqVolunteerBodyInput('');
    setSelectedEvent('');
    setStartDateInput('');
    setEndDateInput('');
    setEditing(false);
    setCurrentPostId(null);
  };


  return (
    <div className='ReqAnnouncement'>
      <h1>Request for Volunteers</h1>

      <div className="createPost col-12 col-lg-12">
        <h3>{editing ? 'Edit Post' : 'Create Post'}</h3>
        <form onSubmit={handlePostSubmit}>
          <div className='titleArea col-md-12'>
            <label htmlFor="reqVolunteerTitle" className="form-label">Title</label>
              <input type="text" className="form-control" id="title" value={reqVolunteerTitleInput} onChange={handleTitleChange} required/>
            <br/>
          </div>


          <div className="mb-3">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input type="date" className="form-control" id="startDate" value={startDateInput} onChange={handleStartDateChange} required />
          </div>

        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">End Date</label>
          <input type="date" className="form-control" id="endDate" value={endDateInput} onChange={handleEndDateChange} required />
        </div>

        <div className="mb-3">
          <label htmlFor="event" className="form-label">Associate with Event</label>
          <select className="form-select" id="event" value={selectedEvent} onChange={handleEventChange} required>
            <option value="" disabled>Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.eventName}>
                {event.eventName}
              </option>
            ))}
          </select>
        </div>

          <div className='contentArea col-md-12'>
            <label htmlFor="reqVolunteerBody" className="form-label">Enter Content</label>
              <textarea className="form-control" id="content" rows="3" value={reqVolunteerBodyInput} onChange={handleBodyChange} required></textarea>
            <br/>
          </div>

          

          <div className="d-flex justify-content-end gap-2">
          <button type="submit" className="btn btn-success me-2">{editing ? 'Update Post' : 'Create Post'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
          <button type="reset" className="btn btn-danger" onClick={resetForm}>Clear</button>
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
              </small><br/>
              <small className="text-muted">
                {`Duration: ${post.startDate.toDate().toLocaleDateString()} - ${post.endDate.toDate().toLocaleDateString()}`}
              </small><br/>
              <small className='text-muted'>
                Status: {post.status}
              </small><br/>
              <p>-----------------</p>
              <p className="card-text">
                {`Event: ${post.event}`}
              </p>
              <p className="card-text">{post.content}</p>
              <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Delete Post</button>
              <button className="btn btn-info ms-2" onClick={() => handleEditPost(post)}>Edit Post</button>
               {post.status === 'ongoing' && (
                <button className="btn btn-warning ms-2" onClick={() => handleArchivePost(post.id)}>Archive Post</button>
              )}
              {post.status === 'archived' && (
                <button className="btn btn-success ms-2" onClick={() => handleUnarchivePost(post.id)}>Unarchive Post</button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ReqVol;
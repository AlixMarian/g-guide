import  { useEffect, useState } from 'react';
import {getAnnouncementList,addAnnouncement, deleteAnnouncement,updateAnnouncement} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, Timestamp,} from 'firebase/firestore';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import '../../churchCoordinator.css';
import { Pagination } from 'react-bootstrap';

export const Announcements = () => {
  const [announcementList, setAnnouncementList] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [userId, setUserId] = useState('');
  const [churchId, setChurchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;


  const getChurchId = async (userId) => {
    try {
      const coordinatorQuery = query(
        collection(db, 'coordinator'),
        where('userId', '==', userId)
      );
      const coordinatorSnapshot = await getDocs(coordinatorQuery);


      if (!coordinatorSnapshot.empty) {
        const coordinatorDoc = coordinatorSnapshot.docs[0];
        const churchQuery = query(
          collection(db, 'church'),
          where('coordinatorID', '==', coordinatorDoc.id)
        );
        const churchSnapshot = await getDocs(churchQuery);


        if (!churchSnapshot.empty) {
          const fetchedChurchId = churchSnapshot.docs[0].id;
          return fetchedChurchId;
        } else {
          toast.error('No associated church found for this coordinator.');
        }
      } else {
        toast.error('No coordinator found for the logged-in user.');
      }
    } catch (error) {
      console.error('Error fetching churchId:', error);
      toast.error('Failed to fetch church details.');
    }
    return null;
  };


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedChurchId = await getChurchId(user.uid);
        if (fetchedChurchId) {
          setChurchId(fetchedChurchId);
          fetchData(fetchedChurchId);
        }
      } else {
        console.log('No user is logged in.');
      }
    });


    return () => unsubscribe();
  }, []);
 
  const fetchData = (churchId) => {
    getAnnouncementList(setAnnouncementList, churchId);
  };
 
  const handleSubmit = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
 
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      form.classList.add('was-validated');
    } else {
      callback();
    }
  };
 
  const onSubmitAnnouncement = () => {
    const announcementData = {
      title: announcementTitle,
      announcement: newAnnouncement,
      uploadDate: Timestamp.now(),
      churchId: churchId,
    };


    if (!churchId) {
      toast.error('Failed to add announcement: Church ID is missing.');
      return;
    }


    addAnnouncement(announcementData, churchId, () => getAnnouncementList(setAnnouncementList, churchId));
    setNewAnnouncement('');
    setAnnouncementTitle('');
  };


 
  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement(announcement.announcement);
    setAnnouncementTitle(announcement.title || '');
  };
 
  const handleDeleteAnnouncement = async (id) => {
    await deleteAnnouncement(id, () => getAnnouncementList(setAnnouncementList, userId));
  };
 
  const onUpdateAnnouncement = () => {
    const announcementData = {
      title: announcementTitle,
      announcement: newAnnouncement,
    };


    if (!churchId) {
      toast.error('Failed to update announcement: Church ID is missing.');
      return;
    }


    updateAnnouncement(editingAnnouncement.id, announcementData, () => {
      getAnnouncementList(setAnnouncementList, churchId);
      setEditingAnnouncement(null);
      clearForm();
    });
  };
 
  const clearForm = () => {
    setNewAnnouncement('');
    setAnnouncementTitle('');
  };


  const filteredAnnouncements = selectedDate
    ? announcementList.filter(
        (announcement) =>
          new Date(announcement.uploadDate.toDate()).toDateString() ===
          selectedDate.toDateString()
      )
    : announcementList;


 
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;


 
  const currentAnnouncements = [...filteredAnnouncements]
    .sort((a, b) => b.uploadDate.toMillis() - a.uploadDate.toMillis())
    .slice(firstItemIndex, lastItemIndex);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  return (
    <>
      <h1 className='me-3'>Announcements</h1>
      <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3>{editingAnnouncement ? "Edit Announcement" : "Add Announcement"}</h3>
              <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingAnnouncement ? onUpdateAnnouncement : onSubmitAnnouncement)}>
              <div className="mb-3">
                <label htmlFor="announcementTitle" className="form-label"><b>Title</b></label>
                <input
                  type="text"
                  className="form-control"
                  id="announcementTitle"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  required
                />
                <div className="invalid-feedback">Please provide a title for the announcement</div>
              </div>
                <div className="mb-3">
                  <label htmlFor="announcementTitle" className="form-label"><b>Content</b></label>
                  <textarea
                    className="form-control"
                    id="announcementTextarea"
                    rows="5"
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    required
                  ></textarea>
                  <div className="invalid-feedback">Please provide an announcement</div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="submit" className="btn btn-success">
                    {editingAnnouncement ? 'Confirm Changes' : 'Submit'}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
                  {editingAnnouncement && (
                      <button type="button" className="btn btn-dark" onClick={() => { setEditingAnnouncement(null); clearForm(); }}>
                        Cancel
                      </button>
                    )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className='col-md-6 mb-4'>
            <div className='card shadow-lg'>
              <div className='card-body'>
                <h3>Announcements</h3>
                <div className="form-group mb-3">
                  <label className="form-label"><b>Filter by date:</b></label>
                  <div className="input-group">
                    <DatePicker
                      className="form-control"
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      showYearDropdown
                    />
                    <button className="btn btn-danger" onClick={() => { setSelectedDate(null);}}>
                      Clear
                    </button>
                  </div>
                </div>
                {currentAnnouncements.length > 0 ? (
                  currentAnnouncements.map((announcement) => (
                    <div className="card mb-3" key={announcement.id}>
                     
                      <div className="card-body">
                        <h2 className='card-title'>{announcement.title}</h2>
                        <p className="card-text">
                          <small>Date Uploaded: {announcement.uploadDate.toDate().toLocaleDateString()}</small>
                        </p>
                        <h6 className='mb-5'>{announcement.announcement}</h6>
                        <div className="d-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-primary" onClick={() => handleEditAnnouncement(announcement)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-danger" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <h4 className="text-muted">No annoucements found</h4>
                  </div>
                )}
                  <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {[...Array(totalPages).keys()].map((number) => (
                      <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => handlePageChange(number + 1)}>
                        {number + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                  </div>
              </div>
            </div>
          </div>
      </div>
       
      </div>
    </>
  );
};


export default Announcements;
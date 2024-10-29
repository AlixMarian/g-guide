import  { useEffect, useState } from 'react';
import {getAnnouncementList,addAnnouncement,
    deleteAnnouncement,updateAnnouncement} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';
import { Pagination } from 'react-bootstrap';


export const Announcements = () => {
    const [announcementList, setAnnouncementList] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
            fetchData(user.uid);
          } else {
            setUserId('');
            toast.error('No user is logged in');
          }
        });
    
        return () => unsubscribe();
      }, []);

      const fetchData = (creatorId) => {
        getAnnouncementList(setAnnouncementList, creatorId);
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
          announcement: newAnnouncement,
          uploadDate: Timestamp.now(),
        };
        addAnnouncement(announcementData, userId, () => getAnnouncementList(setAnnouncementList, userId));
        setNewAnnouncement('');
      };

      const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement(announcement);
        setNewAnnouncement(announcement.announcement);
      };

      const handleDeleteAnnouncement = async (id) => {
        await deleteAnnouncement(id, () => getAnnouncementList(setAnnouncementList, userId));
      };

      const onUpdateAnnouncement = () => {
        const announcementData = {
          announcement: newAnnouncement
        };
        updateAnnouncement(editingAnnouncement.id, announcementData, () => {
          getAnnouncementList(setAnnouncementList, userId);
          setEditingAnnouncement(null);
          clearForm();
        });
      };

      const clearForm = () => {
        setNewAnnouncement('');
      };
  
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 3; // Set items per page to 3
  // Calculate pagination indices
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentAnnouncements = [...announcementList]
    .sort((a, b) => b.uploadDate.toMillis() - a.uploadDate.toMillis())
    .slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(announcementList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
      
  return (
    <>
      <h1 className='me-3'>Announcements</h1>
      <div className="container mt-5">
      <div className="row">
        {/* Left Card: Form */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h4>{editingAnnouncement ? "Edit Announcement" : "Add Announcement"}</h4>
              <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingAnnouncement ? onUpdateAnnouncement : onSubmitAnnouncement)}>
                <div className="mb-3">
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
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Card: Announcements List */}
        <div className='col-md-5 mb-4'>
            <div className='card shadow-lg'>
              <div className='card-body'>
                <h2>Announcements</h2>

                {/* Display current announcements based on pagination */}
                {currentAnnouncements.map((announcement) => (
                  <div className="card mb-3" key={announcement.id}>
                    <div className="card-body">
                      <h6>{announcement.announcement}</h6>
                      <p className="card-text"><small>Date Uploaded: {announcement.uploadDate.toDate().toLocaleDateString()}</small></p>
                      <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditAnnouncement(announcement)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeleteAnnouncement(announcement.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Component */}
<div className="d-flex justify-content-center mt-4">
  <Pagination>
    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
    {[...Array(totalPages).keys()].map((number) => (
      <Pagination.Item
        key={number + 1}
        active={number + 1 === currentPage}
        onClick={() => handlePageChange(number + 1)}
      >
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
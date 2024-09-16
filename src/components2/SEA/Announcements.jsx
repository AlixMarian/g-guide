import React, { useEffect, useState } from 'react';
import {getAnnouncementList,addAnnouncement,
    deleteAnnouncement,updateAnnouncement} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';
import DatePicker from 'react-datepicker';

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

      return (
    <>
      <div className="announcementsSEA">
        <h1>Announcements</h1>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Announcement</th>
              <th scope='col'>Date Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {announcementList.map((announcement) => (
              <tr key={announcement.id}>
                <td>{announcement.announcement}</td>
                <td>{announcement.uploadDate.toDate().toLocaleDateString()}</td>
                <td>
                  <form>
                    <div className="btn-group" role="group">
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditAnnouncement(announcement)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeleteAnnouncement(announcement.id)}>Delete</button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <hr />
        <br/>
        <h4>{editingAnnouncement ? "Edit Announcement" : "Add Announcement"}</h4>
        <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingAnnouncement ? onUpdateAnnouncement : onSubmitAnnouncement)}>
          <div className="mb-3">
            <label htmlFor="announcementTextarea" className="form-label">Announcements</label>
            <textarea className="form-control" id="announcementTextarea" rows="5" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} required></textarea>
            <div className="invalid-feedback">Please provide an announcement</div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {editingAnnouncement ? 'Confirm Changes' : 'Submit'}
            </button>
            <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Announcements;
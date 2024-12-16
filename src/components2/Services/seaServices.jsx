import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';

// Fetch all Mass Schedules for a given churchId
export const getMassList = async (setMassList, churchId) => {
  try {
    const data = await getDocs(collection(db, "massSchedules"));
    const filteredData = data.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
      .filter(doc => doc.churchId === churchId);
    setMassList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

// Add a new Mass Schedule
export const addMassSchedule = async (massData, churchId, getMassList) => {
  try {
    await addDoc(collection(db, "massSchedules"), { ...massData }); 
    toast.success('Mass schedule added successfully!');
    getMassList(churchId); 
  } catch (err) {
    toast.error('Error adding mass schedule!');
    console.error(err);
  }
};

// Delete a Mass Schedule by ID
export const deleteMassSchedule = async (id, getMassList, churchId) => {
  try {
    await deleteDoc(doc(db, "massSchedules", id));
    toast.success('Mass schedule deleted successfully!');
    getMassList(churchId); 
  } catch (err) {
    toast.error('Error deleting mass schedule!');
    console.error(err);
  }
};

// Update an existing Mass Schedule
export const updateMassSchedule = async (id, updatedData, callback) => {
  try {
    const massDoc = doc(db, 'massSchedules', id);
    await updateDoc(massDoc, updatedData);
    toast.success('Mass schedule updated successfully!');
    if (callback) callback();
  } catch (error) {
    toast.error('Error updating mass schedule!');
    console.error("Error updating mass schedule: ", error);
  }
};

// Fetch all Priests for a given churchId
export const getPriestList = async (setPriestList, churchId) => {
  try {
    const data = await getDocs(collection(db, "priest"));
    const filteredData = data.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
      .filter(doc => doc.churchId === churchId); 
    setPriestList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

// Additional utility methods (unchanged)
export const getEventList = async (setEventList, churchId) => {
  try {
    const data = await getDocs(collection(db, "events"));
    const filteredData = data.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
      .filter(doc => doc.churchId === churchId);
    setEventList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

export const addEventSchedule = async (eventData, churchId, getEventList) => {
  try {
    await addDoc(collection(db, "events"), { ...eventData }); 
    toast.success('Event schedule added successfully!');
    getEventList(churchId); 
  } catch (err) {
    toast.error('Error adding event schedule!');
    console.error(err);
  }
};

export const deleteEventSchedule = async (id, getEventList, churchId) => {
  try {
    await deleteDoc(doc(db, "events", id));
    toast.success('Event schedule deleted successfully!');
    getEventList(churchId); 
  } catch (err) {
    toast.error('Error deleting event schedule!');
    console.error(err);
  }
};

export const updateEventSchedule = async (id, updatedData, callback) => {
  try {
    const eventDoc = doc(db, 'events', id);
    await updateDoc(eventDoc, updatedData);
    toast.success('Event schedule updated successfully!');
    if (callback) callback();
  } catch (error) {
    toast.error('Error updating event schedule!');
    console.error("Error updating event schedule: ", error);
  }
};

export const getAnnouncementList = async (setAnnouncementList, churchId) => {
  try {
    const data = await getDocs(collection(db, "announcements"));
    const filteredData = data.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
      .filter(doc => doc.churchId === churchId); 
    setAnnouncementList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

export const addAnnouncement = async (announcementData, churchId, getAnnouncementList) => {
  try {
    await addDoc(collection(db, "announcements"), { ...announcementData }); 
    toast.success('Announcement added successfully!');
    getAnnouncementList(churchId); 
  } catch (err) {
    toast.error('Error adding announcement!');
    console.error(err);
  }
};

export const deleteAnnouncement = async (id, getAnnouncementList, churchId) => {
  try {
    await deleteDoc(doc(db, "announcements", id));
    toast.success('Announcement deleted successfully!');
    getAnnouncementList(churchId); 
  } catch (err) {
    toast.error('Error deleting Announcement!');
    console.error(err);
  }
};

export const updateAnnouncement = async (id, updatedData, callback) => {
  try {
    const announcementDoc = doc(db, 'announcements', id);
    await updateDoc(announcementDoc, updatedData);
    toast.success('Announcement updated successfully!');
    if (callback) callback();
  } catch (error) {
    toast.error('Error updating Announcement!');
    console.error("Error updating Announcement: ", error);
  }
};

// src/utils/firebaseUtils.js

import { getDocs, collection, addDoc, deleteDoc, doc,updateDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';

// Function to get mass list
export const getMassList = async (setMassList) => {
  try {
    const data = await getDocs(collection(db, "massSchedules"));
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));
    setMassList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

// Function to add new mass schedule
export const addMassSchedule = async (massData, getMassList) => {
  try {
    await addDoc(collection(db, "massSchedules"), massData);
    toast.success('Mass schedule added successfully!');
    getMassList();
  } catch (err) {
    toast.error('Error adding mass schedule!');
    console.error(err);
  }
};
// Function to delete mass schedule
export const deleteMassSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, "massSchedules", id));
    toast.success('Mass schedule deleted successfully!');
    getMassList();
  } catch (err) {
    toast.error('Error deleting mass schedule!');
    console.error(err);
  }
};

// Function to update a mass schedule
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

// Function to get event list
export const getEventList = async (setEventList) => {
  try {
    const data = await getDocs(collection(db, "events"));
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));
    setEventList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

// Function to add new event schedule
export const addEventSchedule = async (eventData, getEventList) => {
  try {
    await addDoc(collection(db, "events"), eventData);
    toast.success('Event schedule added successfully!');
    getEventList();
  } catch (err) {
    toast.error('Error adding event schedule!');
    console.error(err);
  }
};

// fuction to delete event schedule
export const deleteEventSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, "events", id));
    toast.success('Event schedule deleted successfully!');
    getEventList();
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

// Function to get announcement list
export const getAnnouncementList = async (setAnnouncementList) => {
  try {
    const data = await getDocs(collection(db, "announcements"));
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));
    setAnnouncementList(filteredData);
  } catch (err) {
    console.error(err);
  }
};

//add announcement 
export const addAnnouncement = async (announcementData, getAnnouncementList) => {
  try {
    await addDoc(collection(db, "announcements"), announcementDataData);
    toast.success('Announcement added successfully!');
    getAnnouncementList();
  } catch (err) {
    console.error(err);
  }
};


//Function to get priest list

export const getPriestList = async (setPriestList) => {
    try {
      const data = await getDocs(collection(db, "priest"));
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      setPriestList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  


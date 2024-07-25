// src/utils/firebaseUtils.js

import { getDocs, collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '/backend/firebase';

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
    getMassList();
  } catch (err) {
    console.error(err);
  }
};
// Function to delete mass schedule
export const deleteMassSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, "massSchedules", id));
    getMassList();
  } catch (err) {
    console.error(err);
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
    getEventList();
  } catch (err) {
    console.error(err);
  }
};

// fuction to delete event schedule
export const deleteEventSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, "events", id));
    getEventList();
  } catch (err) {
    console.error(err);
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


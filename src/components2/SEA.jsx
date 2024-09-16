import React, { useEffect, useState } from 'react';
import {getMassList,addMassSchedule,updateMassSchedule,
  deleteMassSchedule,getEventList,addEventSchedule,
  updateEventSchedule,deleteEventSchedule,getAnnouncementList,
  addAnnouncement,deleteAnnouncement,updateAnnouncement,
  getPriestList
} from '../components2/Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../churchCoordinator.css';
import DatePicker from 'react-datepicker';

export const SEA = () => {
  
  return (
    <>
        <h1>Hello</h1>
    </>
  );
};

export default SEA;

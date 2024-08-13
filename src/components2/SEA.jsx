import React, { useEffect, useState } from 'react';
import {
  getMassList,
  addMassSchedule,
  updateMassSchedule,
  deleteMassSchedule,
  getEventList,
  addEventSchedule,
  updateEventSchedule,
  deleteEventSchedule,
  getAnnouncementList,
  addAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  getPriestList
} from '../components2/Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../churchCoordinator.css';
import DatePicker from 'react-datepicker';

export const SEA = () => {
  const [massList, setMassList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [announcementList, setAnnouncementList] = useState([]);
  const [priestList, setPriestList] = useState([]);
  const [newMassDate, setNewMassDate] = useState("");
  const [newMassTime, setNewMassTime] = useState("");
  const [newMassPeriod, setNewMassPeriod] = useState("");
  const [newMassType, setNewMassType] = useState("");
  const [newMassLanguage, setNewMassLanguage] = useState("");
  const [newMassPriest, setNewMassPriest] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventPeriod, setNewEventPeriod] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [editingMass, setEditingMass] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');



  
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

  const handleStartDateChange = (date) => {
    setStartDate(formatDate(date));
  };

  const fetchData = (creatorId) => {
    getMassList(setMassList, creatorId);
    getPriestList(setPriestList, creatorId);
    getEventList(setEventList, creatorId);
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

  const onSubmitMass = () => {
    const massData = {
      massDate: newMassDate,
      massTime: newMassTime,
      massPeriod: newMassPeriod,
      massType: newMassType,
      massLanguage: newMassLanguage,
      presidingPriest: newMassPriest
    };
    addMassSchedule(massData, userId, () => getMassList(setMassList, userId));
  };

  const onUpdateMass = () => {
    const massData = {
      massDate: newMassDate,
      massTime: newMassTime,
      massPeriod: newMassPeriod,
      massType: newMassType,
      massLanguage: newMassLanguage,
      presidingPriest: newMassPriest
    };
    updateMassSchedule(editingMass.id, massData, () => {
      getMassList(setMassList, userId);
      setEditingMass(null);
      clearForm();
    });
  };

  const handleDeleteMassSchedule = async (id) => {
    await deleteMassSchedule(id, () => getMassList(setMassList, userId));
  };

  const onSubmitEvent = () => {
    const eventData = {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
      eventPeriod: newEventPeriod
    };
    addEventSchedule(eventData, userId, () => getEventList(setEventList, userId));
  };

  const onUpdateEvent = () => {
    const eventData = {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
      eventPeriod: newEventPeriod
    };
    updateEventSchedule(editingEvent.id, eventData, () => {
      getEventList(setEventList, userId);
      setEditingEvent(null);
      clearForm();
    });
  };

  const handleDeleteEventSchedule = async (id) => {
    await deleteEventSchedule(id, () => getEventList(setEventList, userId));
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

  const handleEditMassSchedule = (mass) => {
    setEditingMass(mass);
    setNewMassDate(mass.massDate);
    setNewMassTime(mass.massTime);
    setNewMassPeriod(mass.massPeriod);
    setNewMassType(mass.massType);
    setNewMassLanguage(mass.massLanguage);
    setNewMassPriest(mass.presidingPriest);
  };

  const handleEditEventSchedule = (event) => {
    setEditingEvent(event);
    setNewEventDate(event.eventDate);
    setNewEventName(event.eventName);
    setNewEventTime(event.eventTime);
    setNewEventPeriod(event.eventPeriod);
  };

  const clearForm = () => {
    setNewMassDate("");
    setNewMassTime("");
    setNewMassPeriod("");
    setNewMassType("");
    setNewMassLanguage("");
    setNewMassPriest("");
    setNewEventDate("");
    setNewEventName("");
    setNewEventTime("");
    setNewEventPeriod("");
    setNewAnnouncement('');
  };
  

  return (
    <>
      {/* Mass Schedule Section */}
      <div className="massInfo">
        <h1>Mass Schedule</h1>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Time</th>
              <th scope="col">AM/PM</th>
              <th scope="col">Type</th>
              <th scope="col">Language</th>
              <th scope="col">Presiding Priest</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {massList.map((massSchedules) => (
              <tr key={massSchedules.id}>
                <td>{massSchedules.massDate}</td>
                <td>{massSchedules.massTime}</td>
                <td>{massSchedules.massPeriod}</td>
                <td>{massSchedules.massType}</td>
                <td>{massSchedules.massLanguage}</td>
                <td>{massSchedules.presidingPriest}</td>
                <td>
                  <form>
                    <div className="btn-group" role="group">
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditMassSchedule(massSchedules)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeleteMassSchedule(massSchedules.id)}>Delete</button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br/>
        <hr/>
        <br/>
        <h4>{editingMass ? "Edit Mass Schedule" : "Add Mass Schedule"}</h4>
        <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingMass ? onUpdateMass : onSubmitMass)}>
          <div className="col-md-6">
            <label htmlFor="validationTooltip04" className="form-label">Date</label>
            <select className="form-select" required id="validationTooltip04" value={newMassDate} onChange={(e) => setNewMassDate(e.target.value)}>
              <option value="" disabled>Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
            <div className="invalid-feedback">Please select a day</div>
          </div>
          <div className="col-md-4">
            <label htmlFor="timeInput" className="form-label">Time</label>
            <input type="time" required className="form-control" id="timeInput" placeholder="00:00" value={newMassTime} onChange={(e) => setNewMassTime(e.target.value)} />
            <div className="invalid-feedback">Please input a time</div>
          </div>
          <div className="col-md-2">
            <label htmlFor="amPmSelect" className="form-label">AM/PM</label>
            <select className="form-select" required id="amPmSelect" value={newMassPeriod} onChange={(e) => setNewMassPeriod(e.target.value)}>
              <option value="" disabled>Select Period</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            <div className="invalid-feedback">Please select a time period</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="typeSelect" className="form-label">Type</label>
            <select className="form-select" required id="typeSelect" value={newMassType} onChange={(e) => setNewMassType(e.target.value)}>
              <option value="" disabled>Select a mass type</option>
              <option value="Concelebrated">Concelebrated</option>
              <option value="Ordinary Mass">Ordinary Mass</option>
            </select>
            <div className="invalid-feedback">Please select a mass type</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="languageSelect" className="form-label">Language</label>
            <select className="form-select" required id="languageSelect" value={newMassLanguage} onChange={(e) => setNewMassLanguage(e.target.value)}>
              <option value="" disabled>Select a language</option>
              <option value="Cebuano">Cebuano</option>
              <option value="English">English</option>
            </select>
            <div className="invalid-feedback">Please select a language</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="priestSelect" className="form-label">Presiding Priest</label>
            <select className="form-select" required id="priestSelect" value={newMassPriest} onChange={(e) => setNewMassPriest(e.target.value)}>
              <option value="" disabled>Select a priest</option>
              {priestList.map((priest) => (
                <option key={priest.id} value={priest.name}>{priest.priestType} {priest.firstName} {priest.lastName}</option>
              ))}
            </select>
            <div className="invalid-feedback">Please select a priest</div>
          </div>
          <div id='buttons' className="col-md-6">
            <div className="btn-group" role="group">
              <button type="submit" className="btn btn-success">
                {editingMass ? 'Confirm changes' : 'Submit'}
              </button>
              <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
            </div>
          </div>
        </form>
      </div>

      {/* Events Section */}
      <div className="events">
        <h1>Events</h1>
        <table className='table'>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Name</th>
              <th scope="col">Time</th>
              <th scope="col">AM/PM</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((events) => (
              <tr key={events.id}>
                <td>{events.eventDate}</td>
                <td>{events.eventName}</td>
                <td>{events.eventTime}</td>
                <td>{events.eventPeriod}</td>
                <td>
                  <form>
                    <div className="btn-group" role="group">
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditEventSchedule(events)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeleteEventSchedule(events.id)}>Delete</button>
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
        <h4>{editingEvent ? "Edit Event Schedule" : "Add Event Schedule"}</h4>
        <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingEvent ? onUpdateEvent : onSubmitEvent)}>
          <div className="col-6">
            <label htmlFor="eventDate" className="form-label">Date</label>
              <input 
                type="date"
                className="form-control w-100" 
                id="eventDate" 
                value={newEventDate} 
                onChange={(e) => setNewEventDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
                required 
              />
              <div className="invalid-feedback">Please provide a valid date</div>
            </div>
          <div className="col-md-6">
            <label htmlFor="eventType" className="form-label">Name</label>
            <input type="text" className="form-control" id="eventType" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} required/>
            <div className="invalid-feedback">Please provide a name</div>
          </div>
          <div className="col-4 ">
            <label htmlFor="eventTime" className="form-label">Time</label>
            <input type="time" className="form-control" id="eventTime" placeholder="00:00" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} required/>
            <div className="invalid-feedback">Please provide a valid time</div>
          </div>
          <div className="col-md-2">
            <label htmlFor="eventAmPm" className="form-label">AM/PM</label>
            <select className="form-select" id="eventAmPm" value={newEventPeriod} onChange={(e) => setNewEventPeriod(e.target.value)} required>
              <option value="" disabled>Select Period</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            <div className="invalid-feedback">Please select time period</div>
          </div>
          <div id='buttons' className="col-md-6">
            <div className="btn-group" role="group">
              <button type="submit" className="btn btn-success">
                {editingEvent ? 'Confirm Changes' : 'Submit'}
              </button>
              <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
            </div>
          </div>
        </form>
      </div>

      {/* Announcements Section */}
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

export default SEA;

import React, { useEffect, useState } from 'react';
import {getEventList,addEventSchedule,
    updateEventSchedule,deleteEventSchedule} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';

export const ChurchEvents = () => {
    const [eventList, setEventList] = useState([]);
    const [newEventDate, setNewEventDate] = useState("");
    const [newEventName, setNewEventName] = useState("");
    const [newEventTime, setNewEventTime] = useState("");
    const [editingEvent, setEditingEvent] = useState(null);
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

      const fetchData = (creatorId) => {
        getEventList(setEventList, creatorId);
      };

      const onSubmitEvent = () => {
        const eventData = {
          eventDate: newEventDate,
          eventName: newEventName,
          eventTime: newEventTime,
        };
        addEventSchedule(eventData, userId, () => getEventList(setEventList, userId));
      };

      const onUpdateEvent = () => {
        const eventData = {
          eventDate: newEventDate,
          eventName: newEventName,
          eventTime: newEventTime,
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

      const handleEditEventSchedule = (event) => {
        setEditingEvent(event);
        setNewEventDate(event.eventDate);
        setNewEventName(event.eventName);
        setNewEventTime(event.eventTime);
      };

      const clearForm = () => {
        setNewMassDate("");
        setNewMassTime("");
        setNewMassType("");
        setNewMassLanguage("");
        setNewMassPriest("");
        setNewEventDate("");
        setNewEventName("");
        setNewEventTime("");
        setNewAnnouncement('');
      };

      const convertTo12HourFormat = (time) => {
        if (!time || time === "none") return "none";
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
      };
      return (
        <>
        <div className="events">
        <h1>Events</h1>
        <table className='table'>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Name</th>
              <th scope="col">Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((events) => (
              <tr key={events.id}>
                <td>{events.eventDate}</td>
                <td>{events.eventName}</td>
                <td>{convertTo12HourFormat(events.eventTime)}</td>
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
                max={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]} 
                required 
              />
              <div className="invalid-feedback">Please provide a valid date</div>
            </div>
          <div className="col-md-6">
            <label htmlFor="eventType" className="form-label">Name</label>
            <input type="text" className="form-control" id="eventType" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} required/>
            <div className="invalid-feedback">Please provide a name</div>
          </div>
          <div className="col-6">
            <label htmlFor="eventTime" className="form-label">Time</label>
            <input type="time" className="form-control" id="eventTime" placeholder="00:00" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} required/>
            <div className="invalid-feedback">Please provide a valid time</div>
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
      </>
      );
};

export default ChurchEvents;
import { useEffect, useState } from 'react';
import '../churchCoordinator.css';
import {
  getMassList,
  addMassSchedule,
  updateMassSchedule, // You need to create this function in your seaServices
  deleteMassSchedule,
  getEventList,
  addEventSchedule,
  updateEventSchedule, // You need to create this function in your seaServices
  deleteEventSchedule,
  getAnnouncementList,
  getPriestList
} from '../components2/Services/seaServices';

export const SEA = () => {
  // display mass and event schedule
  const [massList, setMassList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [announcementList, setAnnouncementList] = useState([]);
  const [priestList, setPriestList] = useState([]);

  // new mass schedule
  const [newMassDate, setNewMassDate] = useState("");
  const [newMassTime, setNewMassTime] = useState("");
  const [newMassPeriod, setNewMassPeriod] = useState("");
  const [newMassType, setNewMassType] = useState("");
  const [newMassLanguage, setNewMassLanguage] = useState("");
  const [newMassPriest, setNewMassPriest] = useState("");

  // new event schedule
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventPeriod, setNewEventPeriod] = useState("");

  // editing state
  const [editingMass, setEditingMass] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // display mass schedule
  useEffect(() => {
    getMassList(setMassList);
    getPriestList(setPriestList);
  }, []);

  // add new mass schedule
  const onSubmitMass = () => {
    const massData = {
      massDate: newMassDate,
      massTime: newMassTime,
      massPeriod: newMassPeriod,
      massType: newMassType,
      massLanguage: newMassLanguage,
      presidingPriest: newMassPriest
    };
    addMassSchedule(massData, () => getMassList(setMassList));
  };

  // update mass schedule
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
      getMassList(setMassList);
      setEditingMass(null);
      clearForm();
    });
  };

  // delete mass schedule
  const handleDeleteMassSchedule = async (id) => {
    await deleteMassSchedule(id, () => getMassList(setMassList));
  };

  // display event schedule
  useEffect(() => {
    getEventList(setEventList);
  }, []);

  // add new event schedule
  const onSubmitEvent = () => {
    const eventData = {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
      eventPeriod: newEventPeriod
    };
    addEventSchedule(eventData, () => getEventList(setEventList));
  };

  // update event schedule
  const onUpdateEvent = () => {
    const eventData = {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
      eventPeriod: newEventPeriod
    };
    updateEventSchedule(editingEvent.id, eventData, () => {
      getEventList(setEventList);
      setEditingEvent(null);
      clearForm();
    });
  };

  // delete event schedule
  const handleDeleteEventSchedule = async (id) => {
    await deleteEventSchedule(id, () => getEventList(setEventList));
  };

  // display announcement list
  useEffect(() => {
    getAnnouncementList(setAnnouncementList);
  }, []);

  // handle edit mass schedule
  const handleEditMassSchedule = (mass) => {
    setEditingMass(mass);
    setNewMassDate(mass.massDate);
    setNewMassTime(mass.massTime);
    setNewMassPeriod(mass.massPeriod);
    setNewMassType(mass.massType);
    setNewMassLanguage(mass.massLanguage);
    setNewMassPriest(mass.presidingPriest);
  };

  // handle edit event schedule
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
                    <button type="button" className="btn btn-secondary" onClick={() => handleEditMassSchedule(massSchedules)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteMassSchedule(massSchedules.id)}>Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <hr />

        <form className="row g-3">
          <div className="col-md-6">
            <label htmlFor="dateSelect" className="form-label">Date</label>
            <select className="form-select" id="dateSelect" value={newMassDate} onChange={(e) => setNewMassDate(e.target.value)}>
              <option value="" disabled>Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div className="col-md-5">
            <label htmlFor="timeInput" className="form-label">Time</label>
            <input type="text" className="form-control" id="timeInput" value={newMassTime} onChange={(e) => setNewMassTime(e.target.value)} />
          </div>
          <div className="col-md-1">
            <label htmlFor="amPmSelect" className="form-label">AM/PM</label>
            <select className="form-select" id="amPmSelect" value={newMassPeriod} onChange={(e) => setNewMassPeriod(e.target.value)}>
              <option value="" disabled>Select</option>
              <option value="Am">AM</option>
              <option value="Pm">PM</option>
            </select>
          </div>
        </form>
        <form className="row g-3">
        <div className="col-md-6">
            <label htmlFor="typeSelect" className="form-label">Type</label>
            <select className="form-select" id="typeSelect" value={newMassType} onChange={(e) => setNewMassType(e.target.value)}>
              <option value="" disabled>Select a mass type</option>
              <option value="Concelebrated">Concelebrated</option>
              <option value="Normal Mass">Normal Mass</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="languageSelect" className="form-label">Language</label>
            <select className="form-select" id="languageSelect" value={newMassLanguage} onChange={(e) => setNewMassLanguage(e.target.value)}>
              <option value="" disabled>Select a language</option>
              <option value="Cebuano">Cebuano</option>
              <option value="English">English</option>
            </select>
          </div>
        </form>
        <form className="row g-3">
          <div className="col-md-6">
            <label htmlFor="priestSelect" className="form-label">Presiding Priest</label>
            <select className="form-select" id="priestSelect" value={newMassPriest} onChange={(e) => setNewMassPriest(e.target.value)}>
              <option value="" disabled>Select a priest</option>
              {priestList.map((priest) => (
                <option key={priest.id} value={priest.name}>{priest.priestType} {priest.firstName} {priest.lastName}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label d-block">Confirm</label>
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-success" onClick={editingMass ? onUpdateMass : onSubmitMass}>
                {editingMass ? 'Confirm Changes' : 'Confirm Change'}
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
                <tr>
                  <td>
                    {events.eventDate}
                  </td>
                  <td>
                    {events.eventName}
                  </td>
                  <td>
                    {events.eventTime}
                  </td>
                  <td>
                    {events.eventPeriod}
                  </td>
                  <td>
                    <form>
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditEventSchedule(events)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeleteEventSchedule(events.id)}>Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        <br />
        <hr />

        <form className="row g-3">
        <div className="col-6">
          <label htmlFor="eventDate" className="form-label">Date</label>
          <input 
            type="text" 
            className="form-control" 
            id="eventDate" 
            placeholder="MM/DD/YYYY" 
            pattern="\d{2}/\d{2}/\d{4}" 
            value={newEventDate} 
            onChange={(e) => setNewEventDate(e.target.value)} 
            required 
          />
        </div>
          <div className="col-md-6">
            <label htmlFor="eventType" className="form-label">Name</label>
            <input type="text" className="form-control" id="eventType" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
          </div>
        </form>
        <form className="row g-3">
          <div className="col-5">
            <label htmlFor="eventTime" className="form-label">Time</label>
            <input type="text" className="form-control" id="eventTime" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} />
          </div>
          <div className="col-md-1">
            <label htmlFor="eventAmPm" className="form-label">AM/PM</label>
            <select className="form-select" id="eventAmPm" value={newEventPeriod} onChange={(e) => setNewEventPeriod(e.target.value)}>
                <option value="" disabled>Select</option>
                <option value="Am">AM</option>
                <option value="Pm">PM</option>
            </select>
          </div>
          <div id='buttons' className="col-md-6">
            {/* <label className="form-label d-block">Confirm </label> */}
              <div className="btn-group" role="group">
                  <button type="button" className="btn btn-success" onClick={editingEvent ? onUpdateEvent : onSubmitEvent}>
                    {editingEvent ? 'Confirm Changes' : 'Confirm Change'}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
              </div>
           </div>
        </form>
      </div>

      {/* Announcements Section */}
      <div className="announcementsSEA">
        <h1>Announcements</h1>
        {announcementList.map((announcements) => (
          <p key={announcements.id}>{announcements.announcement}</p>
        ))}
        <br />
        <hr />
        <label htmlFor="announcementTextarea" className="form-label">Announcements</label>
        <div className="mb-3">
          <textarea className="form-control" id="announcementTextarea" rows="5"></textarea>
        </div>
        <div className="btn-group">
          <button type="button" className="btn btn-success">Confirm Change</button>
          <button type="button" className="btn btn-danger">Clear</button>
        </div>
      </div>
    </>
  );
};

export default SEA;

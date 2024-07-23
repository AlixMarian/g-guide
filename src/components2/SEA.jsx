import { useEffect, useState } from 'react';
import '../churchCoordinator.css';
import {db} from "/backend/firebase"
import { getDocs, collection, addDoc,deleteDoc,doc,updateDoc } from 'firebase/firestore';

export const SEA = () => {
  //display mass and event schedule
  const [massList, setMassList] = useState([]);
  const [eventList, setEventList] = useState([])
  const [announcementList, setAnnouncementList] = useState([])


  //new mass schedule
  const [newMassDate, setNewMassDate] = useState("");
  const [newMassTime, setNewMassTime] = useState("");
  const [newMassPeriod, setNewMassPeriod] = useState("");
  const [newMassType, setNewMassType] = useState("");
  const [newMassLanguage, setNewMassLanguage] = useState("");
  
  //new event schedule

  const [newEventDate, setNewEventDate] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventPeriod, setNewEventPeriod] = useState("");

  //new announcement



  const massCollectionRef = collection(db,"massSchedules",);
  const eventCollectionRef = collection(db,"events",);
  const announcementCollectionRef = collection(db,"announcements",);

  //display mass Schedule
    const  getMassList = async () =>{
      try{
      const data = await getDocs(massCollectionRef);
      const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
           id: doc.id
          }));
      console.log({filteredData});
          setMassList(filteredData);
      }catch(err){
          console.error(err);
      }
      
      };

  useEffect(() => {
      getMassList();
  },[])


  //add new mass Schedule
  const onSubmitMass = async () => {
    try{
    await addDoc(massCollectionRef, {
        massDate: newMassDate,
        massTime: newMassTime,
        massPeriod: newMassPeriod,
        massType: newMassType,
        massLanguage: newMassLanguage,
    });
      getMassList();
    }catch(err){
      console.error(err);
    }
  };

  //delete schedule
  const deleteMassSchedule = async (id) => {
    const massSchedulesDoc = doc(db, "massSchedules", id)
    try{
      await deleteDoc(massSchedulesDoc)
    }catch(err){
      console.error(err);
    }
  };


  //display event schedule
  const  getEventList = async () =>{
    try{
    const data = await getDocs(eventCollectionRef);
    const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
         id: doc.id
        }));
    console.log({filteredData});
        setEventList(filteredData);
    }catch(err){
        console.error(err);
    }
    
    };

useEffect(() => {
    getEventList();
},[])


//add new event schedule

const onSubmitEvent = async () => {
  try{
  await addDoc(eventCollectionRef, {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
      eventPeriod: newEventPeriod,
  });
    getEventList();
  }catch(err){
    console.error(err);
  }
};

//delete event schedule


//display announcement
const  getAnnouncementList = async () =>{
  try{
  const data = await getDocs(announcementCollectionRef);
  const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
       id: doc.id
      }));
  console.log({filteredData});
      setAnnouncementList(filteredData);
  }catch(err){
      console.error(err);
  }
  
  };

useEffect(() => {
  getAnnouncementList();
},[])

// add new announcement

//delete announcement




  //html
  return (
    <>
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
          <tr>
            <td>
              {massSchedules.massDate}
            </td>

            <td>
              {massSchedules.massTime}
            </td>
              
            <td>
             {massSchedules.massPeriod}
            </td>
              
            <td>
              {massSchedules.massType}
            </td>
            <td>
              {massSchedules.massLanguage}
            </td>
            <td>
            </td>
            <td>
                <form>
                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Edit
                </button>
                <div className="dropdown-menu">
                    <form className="px-4 py-3">
                    <div className="mb-3">
                        <label for="exampleDropdownFormEmail1" className="form-label">Day</label>
                        <select className="form-select" id="dateSelect">
                          <option value="" selected disabled>Select a day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormEmail1" className="form-label">Time</label>
                        <input placeholder="" className="form-control" id="exampleDropdownFormEmail1"
                        //onchange
                        />
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">AM/PM</label>
                          <select className="form-select" id="amPmSelect" >
                            <option value="" selected disabled>Select a mass period</option>
                            <option value="Am">Am</option>
                            <option value="Pm">Pm</option>
                          </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Type</label>
                          <select className="form-select" id="typeSelect" >
                            <option value="" selected disabled>Select a mass type</option>
                            <option value="Concelebrated">Concelebrated</option>
                            <option value="Normal Mass">Normal Mass</option>
                          </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Language</label>
                          <select className="form-select" id="languageSelect" >
                            <option value="" selected disabled>Select a mass language</option>
                            <option value="Cebuano">Cebuano</option>
                            <option value="English">English</option>
                          </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Presiding Priest</label>
                        <input type="text" className="form-control" id="exampleDropdownFormPassword1"
                        //onchange
                        />
                      </div>
                      <button type="submit" className="btn btn-primary"
                      onClick={() => updatePriest(priest.id)}>Confirm Changes</button>
                    </form>
                  </div>
                <button type="button" class="btn btn-danger" 
                onClick={() => deleteMassSchedule(massSchedules.id)}>delete</button>
                </form>
                </td>
          </tr>
        ))} 
        </tbody> 
      </table>

        <br/>
        <hr/>

        <form className="row g-3">
    <div className="col-md-6">
        <label htmlFor="dateSelect" className="form-label">Date</label>
        <select className="form-select" id="dateSelect" onChange={(e) => setNewMassDate(e.target.value)}>
            <option value="" selected disabled>Select a day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
        </select>
    </div>
    <div className="col-md-6">
        <label htmlFor="typeSelect" className="form-label">Type</label>
        <select className="form-select" id="typeSelect" onChange={(e) => setNewMassType(e.target.value)}>
            <option value="" selected disabled>Select a mass type</option>
            <option value="Concelebrated">Concelebrated</option>
            <option value="Normal Mass">Normal Mass</option>
        </select>
    </div>
</form>
<form className="row g-3">
    <div className="col-md-5">
        <label htmlFor="timeInput" className="form-label">Time</label>
        <input type="text" className="form-control" id="timeInput" onChange={(e) => setNewMassTime(e.target.value)} />
    </div>
    <div className="col-md-1">
        <label htmlFor="amPmSelect" className="form-label">AM/PM</label>
        <select className="form-select" id="amPmSelect" onChange={(e) => setNewMassPeriod(e.target.value)}>
            <option value="" selected disabled>Select</option>
            <option value="Am">AM</option>
            <option value="Pm">PM</option>
        </select>
    </div>
    <div className="col-md-6">
        <label htmlFor="languageSelect" className="form-label">Language</label>
        <select className="form-select" id="languageSelect" onChange={(e) => setNewMassLanguage(e.target.value)}>
            <option value="" selected disabled>Select a language</option>
            <option value="Cebuano">Cebuano</option>
            <option value="English">English</option>
        </select>
    </div>
</form>
<form className="row g-3">
    <div className="col-md-6">
        <label htmlFor="priestSelect" className="form-label">Presiding Priest</label>
        <select className="form-select" id="priestSelect" onChange={(e) => setPresidingPriest(e.target.value)}>
            <option value="" selected disabled>Select a priest</option>
            <option value="1">Fr. One</option>
            <option value="2">Fr. Two</option>
            <option value="3">Fr. Three</option>
        </select>
    </div>
    <div className="col-md-6">
        <label className="form-label d-block">Confirm</label>
        <div className="btn-group" role="group">
            <button type="button" className="btn btn-success" onClick={onSubmitMass}>Confirm Change</button>
            <button type="button" className="btn btn-danger" onClick={() => clearForm()}>Clear</button>
        </div>
    </div>
</form>

      </div>

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
                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Edit
                </button>
                <div className="dropdown-menu">
                    <form className="px-4 py-3">
                    <div className="mb-3">
                        <label for="exampleDropdownFormEmail1" className="form-label">Day</label>
                        <select className="form-select" id="dateSelect">
                          <option value="" selected disabled>Select a day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormEmail1" className="form-label">Time</label>
                        <input placeholder="" className="form-control" id="exampleDropdownFormEmail1"
                        //onchange
                        />
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">AM/PM</label>
                          <select className="form-select" id="amPmSelect" >
                            <option value="" selected disabled>Select a mass period</option>
                            <option value="Am">Am</option>
                            <option value="Pm">Pm</option>
                          </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Type</label>
                          <select className="form-select" id="typeSelect" >
                            <option value="" selected disabled>Select a mass type</option>
                            <option value="Concelebrated">Concelebrated</option>
                            <option value="Normal Mass">Normal Mass</option>
                          </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Language</label>
                          <select className="form-select" id="languageSelect" >
                            <option value="" selected disabled>Select a mass language</option>
                            <option value="Cebuano">Cebuano</option>
                            <option value="English">English</option>
                          </select>
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Presiding Priest</label>
                        <input type="text" className="form-control" id="exampleDropdownFormPassword1"
                        //onchange
                        />
                      </div>
                      <button type="submit" className="btn btn-primary"
                      onClick={() => updatePriest(priest.id)}>Confirm Changes</button>
                    </form>
                  </div>
                <button type="button" class="btn btn-danger" 
                onClick={() => deleteMassSchedule(massSchedules.id)}>delete</button>
                </form>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
      <br/>
      <hr/>
        <form className="row g-3">
          <div className="col-6">
            <label htmlFor="eventDate" className="form-label">Date</label>
            <input type="text" className="form-control" id="eventDate"
            onChange={(e) => setNewEventDate(e.target.value)}/>
          </div>
          <div className="col-md-6">
            <label htmlFor="eventType" className="form-label">Name</label>
            <input type="text" className="form-control" id="eventType"
            onChange={(e) => setNewEventName(e.target.value)}/>
          </div>
        </form>
        <form className="row g-3">
          <div className="col-5">
            <label htmlFor="eventTime" className="form-label">Time</label>
            <input type="text" className="form-control" id="eventTime"
            onChange={(e) => setNewEventTime(e.target.value)}/>
          </div>
          <div className="col-md-1">
            <label htmlFor="eventAmPm" className="form-label">AM/PM</label>
            <input type="text" className="form-control" id="eventAmPm"
            onChange={(e) => setNewEventPeriod(e.target.value)}/>
          </div>
          <div className="col-md-6">
            <label className="form-label d-block">Confirm </label>
              <div className="btn-group" role="group">
                  <button type="button" className="btn btn-success" onClick={onSubmitEvent}>Confirm Change</button>
                  <button type="button" className="btn btn-danger">Clear</button>
              </div>
           </div>
        </form>
      </div>


    <div className="announcementsSEA">
      <h1>Announcements</h1>

      {announcementList.map((announcements) => (
        <td>
          {announcements. announcement}
        </td>
      ))}
      <br/>
      <hr/>

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

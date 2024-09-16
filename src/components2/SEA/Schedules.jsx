import React, { useEffect, useState } from 'react';
import {
    getMassList,addMassSchedule,updateMassSchedule,
    deleteMassSchedule,getPriestList} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';

export const Schedules = () =>{
    const [massList, setMassList] = useState([]);
    const [priestList, setPriestList] = useState([]);
    const [newMassDate, setNewMassDate] = useState("");
    const [newMassTime, setNewMassTime] = useState("");
    const [newMassType, setNewMassType] = useState("");
    const [newMassLanguage, setNewMassLanguage] = useState("");
    const [newMassPriest, setNewMassPriest] = useState("");
    const [editingMass, setEditingMass] = useState(null);
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
        getMassList(setMassList, creatorId);
        getPriestList(setPriestList, creatorId);
      };

      const onSubmitMass = () => {
        const massData = {
          massDate: newMassDate,
          massTime: newMassTime,
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

      const handleEditMassSchedule = (mass) => {
        setEditingMass(mass);
        setNewMassDate(mass.massDate);
        setNewMassTime(mass.massTime);
        setNewMassType(mass.massType);
        setNewMassLanguage(mass.massLanguage);
        setNewMassPriest(mass.presidingPriest);
      };
      
      const handleDeleteMassSchedule = async (id) => {
        await deleteMassSchedule(id, () => getMassList(setMassList, userId));
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
      <div className="massInfo">
        <h1>Mass Schedule</h1>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Time</th>
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
                <td>{convertTo12HourFormat(massSchedules.massTime)}</td>
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
          <div className="col-md-6">
            <label htmlFor="timeInput" className="form-label">Time</label>
            <input 
            type="time" 
            className="form-control" 
            id="timeInput" 
            placeholder="00:00" 
            value={newMassTime} 
            onChange={(e) => setNewMassTime(e.target.value)} 
            required 
            />
            <div className="invalid-feedback">Please input a time</div>
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
      );
};

export default Schedules;
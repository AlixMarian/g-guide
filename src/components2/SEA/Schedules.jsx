

import { useEffect, useState } from 'react';
import {
    getMassList,addMassSchedule,updateMassSchedule,
    deleteMassSchedule,getPriestList} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Table } from 'react-bootstrap';
import '../../churchCoordinator.css';
import Pagination from 'react-bootstrap/Pagination';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '/backend/firebase';


export const Schedules = () =>{
  const [churchId, setChurchId] = useState('');
  const [massList, setMassList] = useState([]);
  const [priestList, setPriestList] = useState([]);
  const [newMassDate, setNewMassDate] = useState("");
  const [newMassTime, setNewMassTime] = useState("");
  const [newMassType, setNewMassType] = useState("");
  const [newMassLanguage, setNewMassLanguage] = useState("");
  const [newMassPriest, setNewMassPriest] = useState("");
  const [editingMass, setEditingMass] = useState(null);
  const [userId, setUserId] = useState('');
  const [filterDay, setFilterDay] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showScheduleName, setShowScheduleName] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState("");
  const itemsPerPage = 7;


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchChurchId(user.uid);
      } else {
        setUserId('');
        console.log('No user is logged in');
      }
    });


    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (churchId) {
      fetchData();
    }
  }, [churchId]);


  const fetchChurchId = async (userId) => {
    try {
      const coordinatorQuery = query(collection(db, 'coordinator'), where('userId', '==', userId));
      const coordinatorSnapshot = await getDocs(coordinatorQuery);


      if (!coordinatorSnapshot.empty) {
        const churchQuery = query(collection(db, 'church'), where('coordinatorID', '==', coordinatorSnapshot.docs[0].id));
        const churchSnapshot = await getDocs(churchQuery);


        if (!churchSnapshot.empty) {
          setChurchId(churchSnapshot.docs[0].id);
          console.log("Fetched churchId:", churchSnapshot.docs[0].id);
        } else {
          toast.error('No associated church found for this coordinator.');
        }
      } else {
        toast.error('No coordinator found for the logged-in user.');
      }
    } catch (error) {
      console.error("Error fetching churchId:", error);
      toast.error('Failed to fetch church details.');
    }
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


  const handleTypeChange = (value) => {
    setNewMassType(value);
    if (value === "Others") {
      setShowScheduleName(true);
      setNewMassLanguage("");
    } else {
      setShowScheduleName(false);
    }
  };


  const fetchData = () => {
    getMassList(setMassList, churchId);
    getPriestList(setPriestList, churchId);
  };
 


  const onSubmitMass = () => {
    const massData = {
      massDate: newMassDate,
      massTime: newMassTime,
      Type: newMassType,
      massLanguage: showScheduleName ? "" : newMassLanguage,
      scheduleName: showScheduleName ? newScheduleName : "",
      presidingPriest: newMassPriest,
      churchId: churchId,
    };
    addMassSchedule(massData, churchId, () => getMassList(setMassList, churchId));
    clearForm();
  };


  const onUpdateMass = () => {
    const massData = {
      massDate: newMassDate,
      massTime: newMassTime,
      massType: newMassType,
      massLanguage: newMassLanguage,
      presidingPriest: newMassPriest,
      churchId: churchId,
    };
    updateMassSchedule(editingMass.id, massData, () => {
      getMassList(setMassList, churchId);
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
    setNewScheduleName("");
    setShowScheduleName(false);
  };


  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };


     
  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];




  const sortedMassList = [...massList].sort((a, b) => {
  const dayComparison = dayOrder.indexOf(a.massDate) - dayOrder.indexOf(b.massDate);
  if (dayComparison !== 0) {
    return dayComparison;
  }
  return new Date(`1970-01-01T${a.massTime}:00`) - new Date(`1970-01-01T${b.massTime}:00`);
  });


  const filteredMassList = sortedMassList.filter((mass) => {
  const matchesDay = filterDay ? mass.massDate === filterDay : true;
  const matchesLanguage = filterLanguage ? mass.massLanguage === filterLanguage : true;
  const matchesType = filterType ? mass.massType === filterType : true;
  return matchesDay && matchesLanguage && matchesType;
  });


  const paginatedItems = filteredMassList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const totalPages = Math.ceil(filteredMassList.length / itemsPerPage);


  const handlePageChange = (number) => {
    setCurrentPage(number);
  };


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };






  return (
    <>
      <h1 className='me-3'>Church Schedules</h1>
      <div className='container mt-5'>
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3>{editingMass ? "Edit Church Schedule" : "Add Church Schedule"}</h3>
              <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingMass ? onUpdateMass : onSubmitMass)}>
                <div className="col-md-6">
                  <label htmlFor="validationTooltip04" className="form-label"><b>Date</b></label>
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
                  <label htmlFor="timeInput" className="form-label"><b>Time</b></label>
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
                  <label htmlFor="typeSelect" className="form-label"><b>Type</b></label>
                  <select className="form-select" required id="typeSelect" value={newMassType} onChange={(e) =>  handleTypeChange(e.target.value)}>
                    <option value="" disabled>Select a mass type</option>
                    <option value="Concelebrated">Concelebrated</option>
                    <option value="Ordinary Mass">Ordinary Mass</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="invalid-feedback">Please select a mass type</div>
                </div>
                {showScheduleName && (
                    <div className="col-md-6">
                      <label htmlFor="scheduleName" className="form-label"><b>Schedule Name</b></label>
                      <input
                        type="text"
                        className="form-control"
                        id="scheduleName"
                        value={newScheduleName}
                        onChange={(e) => setNewScheduleName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                {!showScheduleName && (
                    <div className="col-md-6">
                      <label htmlFor="languageSelect" className="form-label"><b>Language</b></label>
                      <select className="form-select" required id="languageSelect" value={newMassLanguage} onChange={(e) => setNewMassLanguage(e.target.value)}>
                        <option value="" disabled>Select a language</option>
                        <option value="Cebuano">Cebuano</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  )}
                <div className="col-md-12">
  <label htmlFor="priestSelect" className="form-label">
    <b>Presiding Priest</b>
  </label>
  <select
    className="form-select"
    required
    id="priestSelect"
    value={newMassPriest}
    onChange={(e) => setNewMassPriest(e.target.value)}
  >
    <option value="" disabled>
      Select a priest
    </option>
    {priestList.map((priest) => (
      <option key={priest.id} value={priest.id}>
        {priest.priestType} {priest.firstName} {priest.lastName}
      </option>
    ))}
  </select>
  <div className="invalid-feedback">Please select a priest</div>
</div>


                <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-success">{editingMass ? 'Confirm changes' : 'Submit'}</button>
                    <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
                    {editingMass && (<button type="button" className="btn btn-dark" onClick={() => { setEditingMass(null); clearForm(); }}>Cancel</button>)}
                </div>
              </form>
            </div>
          </div>
        </div>


 
          <div className="col-md-8 mb-4">
            <div className="card shadow-lg">
              <div className="card-body">
                <h3>List of Church Schedules</h3>
                  <div className="d-flex align-items-center mb-3 gap-3 flex-wrap">
                    <label className="form-label"><b>Filters:</b></label>
                    <div className="d-flex align-items-center">
                      <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          {filterDay || "Day"}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterDay(""); }}>
                              All Days
                            </a>
                          </li>
                          {dayOrder.map((day) => (
                            <li key={day}>
                              <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterDay(day); }}>
                                {day}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>


                 
                    <div className="d-flex align-items-center">
                      <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          {filterLanguage || "Language"}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterLanguage(""); }}>
                              All
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterLanguage("Cebuano"); }}>
                              Cebuano
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterLanguage("English"); }}>
                              English
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>


                   
                    <div className="d-flex align-items-center">
                      <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          {filterType || "Type"}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterType(""); }}>
                              All Mass Types
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterType("Others"); }}>
                              Others
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterType("Concelebrated"); }}>
                              Concelebrated
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterType("Ordinary Mass"); }}>
                              Ordinary Mass
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>


                 
                    <button className="btn btn-danger ms-auto align-self-start" onClick={() => { setFilterDay(""); setFilterLanguage(""); setFilterType("");}}>
                      Clear Filters
                    </button>
                  </div>


                       
                  <Table striped bordered hover responsive style={{ borderRadius: '12px', overflow: 'hidden', borderCollapse: 'hidden' }}>
                    <thead className="table-dark">
                      <tr>
                        <th className="massSched-th">Day</th>
                        <th className="massSched-th">Time</th>
                        <th className="massSched-th">Type</th>
                        <th className="massSched-th">Language</th>
                        <th className="massSched-th">Schedule Name</th>
                        <th className="massSched-th">Presiding Priest</th>
                        <th className="massSched-th">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.length > 0 ? (
                        paginatedItems.map((massSchedules) => (
                          <tr key={massSchedules.id}>
                            <td className="massSched-td">{massSchedules.massDate}</td>
                            <td className="massSched-td">{convertTo12HourFormat(massSchedules.massTime)}</td>
                            <td className="massSched-td">{massSchedules.Type}</td>
                            <td className="massSched-td">{massSchedules.massLanguage || "None"}</td>
                            <td className="massSched-td">{massSchedules.scheduleName || "None"}</td>
                            <td className="massSched-td">
                              {(() => {
                              const priest = priestList.find((p) => p.id === massSchedules.presidingPriest);
                              return priest ? `${priest.priestType} ${priest.firstName} ${priest.lastName}` : "Unknown";
                            })()}</td>
                            <td className="massSched-td">
                              <div className="btn-group" role="group">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => handleEditMassSchedule(massSchedules)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => handleDeleteMassSchedule(massSchedules.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <h4 className="text-muted">No events found</h4>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>


                <Pagination className="d-flex justify-content-center mt-3">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePreviousPage()}
                  />
                  {Array.from({ length: Math.ceil(filteredMassList.length / itemsPerPage) }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => handleNextPage()}
                  />
                </Pagination>


              </div>
            </div>
          </div>
      </div>
      </div>
    </>  
      );
};


export default Schedules;


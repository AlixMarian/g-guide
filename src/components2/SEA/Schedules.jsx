import { useEffect, useState } from 'react';
import {
    getMassList,addMassSchedule,updateMassSchedule,
    deleteMassSchedule,getPriestList} from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Table } from 'react-bootstrap';
import '../../churchCoordinator.css';
import Pagination from 'react-bootstrap/Pagination';

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
    const [filterDay, setFilterDay] = useState(""); // State for filtering by day
    const [filterLanguage, setFilterLanguage] = useState(""); // State for filtering by language
    const [filterType, setFilterType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;


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
        clearForm();
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
      };

      const convertTo12HourFormat = (time) => {
        if (!time || time === "none") return "none";
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
      };

     // Utility function to define custom day order
const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Sort the massList by massDate and massTime
const sortedMassList = [...massList].sort((a, b) => {
  // Compare by massDate based on custom day order
  const dayComparison = dayOrder.indexOf(a.massDate) - dayOrder.indexOf(b.massDate);
  if (dayComparison !== 0) {
    return dayComparison;
  }

  // If massDate is the same, compare by massTime
  return new Date(`1970-01-01T${a.massTime}:00`) - new Date(`1970-01-01T${b.massTime}:00`);
});

const filteredMassList = sortedMassList.filter((mass) => {
  const matchesDay = filterDay ? mass.massDate === filterDay : true; // Match selected day
  const matchesLanguage = filterLanguage ? mass.massLanguage === filterLanguage : true; // Match selected language
  const matchesType = filterType ? mass.massType === filterType : true; // Match selected type
  return matchesDay && matchesLanguage && matchesType; // Combine all filters
});


// Paginate the filtered mass list
const paginatedItems = filteredMassList.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


// Calculate the total pages
const totalPages = Math.ceil(filteredMassList.length / itemsPerPage);

const handlePageChange = (number) => {
  setCurrentPage(number); // This updates the current page state
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
      <h1 className='me-3'>Mass Schedules</h1>
      <div className='container mt-5'>
      <div className="row">

  <div className="col-md-6 mb-4">
    <div className="card shadow-lg">
      <div className="card-body">
        <h3>{editingMass ? "Edit Mass Schedule" : "Add Mass Schedule"}</h3>
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
            <select className="form-select" required id="typeSelect" value={newMassType} onChange={(e) => setNewMassType(e.target.value)}>
              <option value="" disabled>Select a mass type</option>
              <option value="Concelebrated">Normal Mass</option>
              <option value="Concelebrated">Concelebrated</option>
              <option value="Ordinary Mass">Ordinary Mass</option>
            </select>
            <div className="invalid-feedback">Please select a mass type</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="languageSelect" className="form-label"><b>Language</b></label>
            <select className="form-select" required id="languageSelect" value={newMassLanguage} onChange={(e) => setNewMassLanguage(e.target.value)}>
              <option value="" disabled>Select a language</option>
              <option value="Cebuano">Cebuano</option>
              <option value="English">English</option>
            </select>
            <div className="invalid-feedback">Please select a language</div>
          </div>
          <div className="col-md-12">
            <label htmlFor="priestSelect" className="form-label"><b>Presiding Priest</b></label>
            <select className="form-select" required id="priestSelect" value={newMassPriest} onChange={(e) => setNewMassPriest(e.target.value)}>
              <option value="" disabled>Select a priest</option>
              {priestList.map((priest) => (
                <option key={priest.id} value={priest.name}>{priest.priestType} {priest.firstName} {priest.lastName}</option>
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

  
  <div className="col-md-6 mb-4">
    <div className="card shadow-lg">
      <div className="card-body">
        <h3>List of Mass Schedules</h3>
          {/* Filters Section */}
          <div className="d-flex align-items-center mb-3 gap-3 flex-wrap">
            <label className="form-label"><b>Filters:</b></label>

            {/* Filter by Day Dropdown */}
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

            {/* Filter by Language Dropdown */}
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

              {/* Filter by Type Dropdown */}
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
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setFilterType("Normal Mass"); }}>
                      Normal Mass
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

            {/* Clear Filters Button */}
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
              <th className="massSched-th">Presiding Priest</th>
              <th className="massSched-th">Action</th>
            </tr>
          </thead>
          <tbody>
    {paginatedItems.map((massSchedules) => (
      <tr key={massSchedules.id}>
        <td className="">{massSchedules.massDate}</td>
        <td className="massSched-td">{convertTo12HourFormat(massSchedules.massTime)}</td>
        <td className="massSched-td">{massSchedules.massType}</td>
        <td className="massSched-td">{massSchedules.massLanguage}</td>
        <td className="massSched-td">{massSchedules.presidingPriest}</td>
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
    ))}
  </tbody>

        </Table>
        {/* Pagination */}
        <Pagination className="d-flex justify-content-center mt-3">
  <Pagination.Prev
    disabled={currentPage === 1}
    onClick={() => handlePreviousPage()} // Correctly calling the function
  />
  {Array.from({ length: Math.ceil(filteredMassList.length / itemsPerPage) }, (_, i) => (
    <Pagination.Item
      key={i + 1}
      active={i + 1 === currentPage}
      onClick={() => handlePageChange(i + 1)} // Correctly passing the page number
    >
      {i + 1}
    </Pagination.Item>
  ))}
  <Pagination.Next
    disabled={currentPage === totalPages}
    onClick={() => handleNextPage()} // Correctly calling the function
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
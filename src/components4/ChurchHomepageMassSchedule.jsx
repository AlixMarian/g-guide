import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useParams } from 'react-router-dom';


export const ChurchHomepageMassSchedule = () => {
  const { churchId } = useParams();
  const [massSchedules, setMassSchedules] = useState([]);
  const [filteredMassSchedules, setFilteredMassSchedules] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    const fetchMassSchedules = async () => {
      const q = query(collection(db, 'massSchedules'), where('creatorId', '==', churchId));
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMassSchedules(schedules);
      setFilteredMassSchedules(schedules);
    };

    fetchMassSchedules();
  }, [churchId]);

  const handleLanguageFilterChange = (event) => {
    const language = event.target.value;
    setSelectedLanguage(language);
    if (language === 'All') {
      setFilteredMassSchedules(massSchedules);
    } else {
      setFilteredMassSchedules(massSchedules.filter((schedule) => schedule.massLanguage === language));
    }
  };

  const getSortedSchedules = (schedules) => {
    const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekendOrder = ['Sunday', 'Saturday'];
    
    const weekdays = schedules.filter(schedule => weekdayOrder.includes(schedule.massDate));
    const weekends = schedules.filter(schedule => weekendOrder.includes(schedule.massDate));
    
    weekdays.sort((a, b) => weekdayOrder.indexOf(a.massDate) - weekdayOrder.indexOf(b.massDate));
    weekends.sort((a, b) => weekendOrder.indexOf(a.massDate) - weekendOrder.indexOf(b.massDate));

    return { weekdays, weekends };
  };

  const { weekdays, weekends } = getSortedSchedules(filteredMassSchedules);

  return (
    <div>
    <h2>Mass Schedules</h2>
    <div className="mb-3">
      <label htmlFor="massLanguageFilter" className="form-label">
        Filter by Language
      </label>
      <select
        id="massLanguageFilter"
        className="form-select"
        value={selectedLanguage}
        onChange={handleLanguageFilterChange}
      >
        <option value="All">All</option>
        {[...new Set(massSchedules.map((schedule) => schedule.massLanguage))].map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
    <h3>Weekdays</h3>
    {weekdays.length === 0 ? (
      <div className="card mb-3 alert alert-info">
      <div className="card-body ">
        <h5 className="card-title">No Weekday Mass Available</h5>
      </div>
    </div>
    ) : (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Language</th>
            <th>Presiding Priest</th>
            <th>Mass Type</th>
          </tr>
        </thead>
        <tbody>
          {weekdays.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.massDate}</td>
              <td>{schedule.massTime}</td>
              <td>{schedule.massLanguage}</td>
              <td>{schedule.presidingPriest}</td>
              <td>{schedule.massType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    <h3>Weekends</h3>
    {weekends.length === 0 ? (
      <div className="card mb-3 alert alert-info">
        <div className="card-body ">
          <h5 className="card-title">No Weekend Mass Available</h5>
        </div>
      </div>
    ) : (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Language</th>
            <th>Presiding Priest</th>
            <th>Mass Type</th>
          </tr>
        </thead>
        <tbody>
          {weekends.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.massDate}</td>
              <td>{schedule.massTime}</td>
              <td>{schedule.massLanguage}</td>
              <td>{schedule.presidingPriest}</td>
              <td>{schedule.massType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  )
 
};

export default ChurchHomepageMassSchedule;
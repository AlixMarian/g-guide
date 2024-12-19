import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useParams } from 'react-router-dom';




export const ChurchHomepageMassSchedule = () => {
  const { churchId } = useParams();
  const [massSchedules, setMassSchedules] = useState([]);
  const [filteredMassSchedules, setFilteredMassSchedules] = useState([]);
  const [priestList, setPriestList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('All');


  useEffect(() => {
    const fetchMassSchedules = async () => {
      try {
       
        const massQuery = query(
          collection(db, 'massSchedules'),
          where('churchId', '==', churchId)
        );
        const querySnapshot = await getDocs(massQuery);
        const schedules = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMassSchedules(schedules);
        setFilteredMassSchedules(schedules);
      } catch (error) {
        console.error('Error fetching mass schedules:', error);
      }
    };


    fetchMassSchedules();
  }, [churchId]);


  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const priestSnapshot = await getDocs(collection(db, 'priest')); // Corrected collection name
        const fetchedPriests = priestSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
       
        setPriestList(fetchedPriests);
 
       
        const massQuery = query(collection(db, 'massSchedules'), where('churchId', '==', churchId));
        const massSnapshot = await getDocs(massQuery);
        const schedules = massSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMassSchedules(schedules);
        setFilteredMassSchedules(schedules);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
 
    fetchData();
  }, [churchId]);
 
 


  const formatPriestDetails = (priestId) => {
    const priest = priestList.find((p) => p.id === priestId);
    if (priest) {
      return {
        name: `${priest.priestType} ${priest.firstName} ${priest.lastName}`,
        image: priest.profileImage || ''
      };
    }
    return { name: 'Unknown', image: '' };
  };
 
 


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


  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };


  const otherSchedules = massSchedules.filter((schedule) => schedule.Type === 'Others');


  return (
    <div>
    <h2>Church Schedules</h2>
    <div className="mb-3">
      <label htmlFor="massLanguageFilter" className="form-label">
        Filter Mass by Language
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
    <h3>Weekday Mass Schedule</h3>
    {weekdays.length === 0 ? (
      <div className="card mb-3 alert alert-info">
      <div className="card-body ">
        <h5 className="card-title">No Weekday Mass Available</h5>
      </div>
    </div>
    ) : (
      <table className="table table-striped text-center align-middle">
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
              <td>{convertTo12HourFormat(schedule.massTime)}</td>
              <td>{schedule.massLanguage || 'none'}</td>
              <td className="text-center align-middle">
                {(() => {
                  const { name, image } = formatPriestDetails(schedule.presidingPriest);
                  return (
                    <div className="d-flex justify-content-left align-items-left gap-2">
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px' }}
                        />
                      )}
                      <span>{name}</span>
                    </div>
                  );
                })()}
              </td>
              <td>{schedule.Type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    <h3>Weekend Mass Schedules</h3>
    {weekends.length === 0 ? (
      <div className="card mb-3 alert alert-info">
        <div className="card-body ">
          <h5 className="card-title">No Weekend Mass Available</h5>
        </div>
      </div>
    ) : (
      <table className="table table-striped text-center align-middle">
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
              <td>{convertTo12HourFormat(schedule.massTime)}</td>
              <td>{schedule.massLanguage}</td>
              <td className="text-center align-middle">
                {(() => {
                  const { name, image } = formatPriestDetails(schedule.presidingPriest);
                  return (
                    <div className="d-flex justify-content-left align-items-left gap-2">
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px' }}
                        />
                      )}
                      <span>{name}</span>
                    </div>
                  );
                })()}
              </td>
              <td>{schedule.Type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}


   <h3 className="mt-5">Other Church Schedules</h3>
      <table className="table table-striped text-center align-middle">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Schedule Name</th>
            <th>Presiding Priest</th>
          </tr>
        </thead>
        <tbody>
          {otherSchedules.length > 0 ? (
            otherSchedules.map((schedule) => (
              <tr key={schedule.id}>
                <td>{schedule.massDate}</td>
                <td>{convertTo12HourFormat(schedule.massTime)}</td>
                <td>{schedule.scheduleName || 'N/A'}</td>
                <td className="text-center align-middle">
                {(() => {
                  const { name, image } = formatPriestDetails(schedule.presidingPriest);
                  return (
                    <div className="d-flex justify-content-left align-items-left gap-2">
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px' }}
                        />
                      )}
                      <span>{name}</span>
                    </div>
                  );
                })()}
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No other schedules available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
   
  </div>
  )
 
};


export default ChurchHomepageMassSchedule;


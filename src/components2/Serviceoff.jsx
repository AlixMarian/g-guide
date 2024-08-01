import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../churchCoordinator.css';

export const Serviceoff = () => {
    const [activeSchedules, setActiveSchedules] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [servicesState, setServicesState] = useState({});
    const [userID, setUserID] = useState(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [slots, setSlots] = useState([]);
    const [isRecurring, setIsRecurring] = useState(false);

    const auth = getAuth();

    const handleRecurringChange = (e) => {
        setIsRecurring(e.target.checked);
        if (!e.target.checked) {
          setEndDate(''); // Clear end date if not recurring
        }
      };

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserID(user.uid);
            } else {
                setUserID(null);
            }
        });
    }, [auth]);

    useEffect(() => {
        if (userID) {
            const fetchData = async () => {
                const userDoc = await getDoc(doc(db, "services", userID));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const servicesStatus = {};
                    const schedules = userData.activeSchedules || [];
                    const requests = userData.activeRequests || [];
                    schedules.forEach(serviceName => {
                        servicesStatus[serviceName] = true;
                    });
                    requests.forEach(serviceName => {
                        servicesStatus[serviceName] = true;
                    });
                    setActiveSchedules(schedules);
                    setActiveRequests(requests);
                    setServicesState(servicesStatus);
                }
            };
            fetchData();
        }
    }, [userID]);

    useEffect(() => {
        fetchSlots();
    });

    const fetchSlots = async () => {
        const user = auth.currentUser;
        if (user) {
            const slotsCollection = collection(db, 'slot');
            const q = query(slotsCollection, where('churchId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const slotsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSlots(slotsList);
        }
    };

    const isSchedule = (serviceName) => {
        const schedules = ["Marriages", "Baptism", "Confirmation", "Burials"];
        return schedules.includes(serviceName);
    };

    const handleToggle = async (event) => {
        const serviceName = event.target.name;
        const isChecked = event.target.checked;

        let updatedServicesState = { ...servicesState, [serviceName]: isChecked };
        let activeSchedules = [];
        let activeRequests = [];

        Object.keys(updatedServicesState).forEach(service => {
            if (updatedServicesState[service]) {
                if (isSchedule(service)) {
                    activeSchedules.push(service);
                } else {
                    activeRequests.push(service);
                }
            }
        });

        await setDoc(doc(db, "services", userID), { activeSchedules, activeRequests }, { merge: true });

        setServicesState(updatedServicesState);
        setActiveSchedules(activeSchedules);
        setActiveRequests(activeRequests);
    };

    const convertTo12HourFormat = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
      };

      const handleCreateSlots = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user) {
          try {
            if (isRecurring) {
              const start = new Date(startDate);
              const end = new Date(endDate);
    
              const dates = [];
              let currentDate = start;
    
              while (currentDate <= end) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
              }
    
              const promises = dates.map(async (date) => {
                const formattedDate = date.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
                await addDoc(collection(db, 'slot'), {
                  startDate: formattedDate,
                  endDate: formattedDate,
                  startTime,
                  endTime,
                  slotStatus: 'active',
                  churchId: user.uid,
                });
              });
    
              await Promise.all(promises);
            } else {
              await addDoc(collection(db, 'slot'), {
                startDate,
                endDate: 'none', // No end date for non-recurring events
                startTime,
                endTime,
                slotStatus: 'active',
                churchId: user.uid,
              });
            }
    
            setStartDate('');
            setEndDate('');
            setStartTime('');
            setEndTime('');
            toast.success('Slots created successfully');
            fetchSlots(); // Fetch the updated slots list
          } catch (error) {
            toast.error('Error creating slots: ', error);
          }
        } else {
          alert('No user signed in.');
        }
      };
    

      const handleDeleteSlot = async (slotId) => {
        try {
          await deleteDoc(doc(db, 'slot', slotId));
          toast.success('Slot deleted successfully');
          fetchSlots();
        } catch (error) {
          toast.error('Error deleting slot: ', error);
        }
      };

    return (
        <>
            <h1>Services Offered</h1>

            <div className="Services">
                <div className="offer1">
                    <h4>Events</h4>
                    <div className="Schedtogs">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="marriages" name="Marriages" onChange={handleToggle} checked={!!servicesState['Marriages']} />
                            <label className="form-check-label" htmlFor="marriages">Marriages</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="baptism" name="Baptism" onChange={handleToggle} checked={!!servicesState['Baptism']} />
                            <label className="form-check-label" htmlFor="baptism">Baptism</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="confirmation" name="Confirmation" onChange={handleToggle} checked={!!servicesState['Confirmation']} />
                            <label className="form-check-label" htmlFor="confirmation">Confirmation</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="burials" name="Burials" onChange={handleToggle} checked={!!servicesState['Burials']} />
                            <label className="form-check-label" htmlFor="burials">Burials</label>
                        </div>
                    </div>
                </div>

                <div className="offer2">
                    <h4>Request Documents</h4>
                    <div className="Schedtogs">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="baptismalCert" name="Baptismal Certificate" onChange={handleToggle} checked={!!servicesState['Baptismal Certificate']} />
                            <label className="form-check-label" htmlFor="baptismalCert">Baptismal Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="confirmationCert" name="Confirmation Certificate" onChange={handleToggle} checked={!!servicesState['Confirmation Certificate']} />
                            <label className="form-check-label" htmlFor="confirmationCert">Confirmation Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="marriageCert" name="Marriage Certificate" onChange={handleToggle} checked={!!servicesState['Marriage Certificate']} />
                            <label className="form-check-label" htmlFor="marriageCert">Marriage Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="enumerationsCert" name="Enumerations Certificate" onChange={handleToggle} checked={!!servicesState['Enumerations Certificate']} />
                            <label className="form-check-label" htmlFor="enumerationsCert">Enumerations Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="burialCert" name="Burial Certificate" onChange={handleToggle} checked={!!servicesState['Burial Certificate']} />
                            <label className="form-check-label" htmlFor="burialCert">Burial Certificate</label><br />
                        </div>
                    </div>
                </div>
            </div>
            <div className="ServicesList">
                <h1>List of Services Offered</h1>
                <div className="serviceListActive">
                    <ul className="styled-list">
                        {activeSchedules.map(service => (
                            <li key={service} className="styled-list-item">
                                <span className="service-icon">♦</span> {service}
                            </li>
                        ))}
                    </ul>

                    <ul className="styled-list">
                        {activeRequests.map(service => (
                            <li key={service} className="styled-list-item">
                                <span className="service-icon">♦</span> {service}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className='displaySlots'>
                <div className='card'>
                    <div className='card-body'>
                        <h5 className='card-title'>Created Slots for Events</h5>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope='col'>Start Date</th>
                                    <th scope='col'>End Date</th>
                                    <th scope='col'>Start Time</th>
                                    <th scope='col'>End Time</th>
                                    
                                </tr>
                            </thead>

                            <tbody>
                            {slots.map((slot) => (
                                <tr key={slot.id}>
                                <td>{slot.startDate}</td>
                                <td>{slot.endDate}</td>
                                <td>{convertTo12HourFormat(slot.startTime)}</td>
                                <td>{convertTo12HourFormat(slot.endTime)}</td>
                                <td><button className="btn btn-info">Edit</button></td>
                                <td><button className="btn btn-danger" onClick={() => handleDeleteSlot(slot.id)}>Delete</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <br/>

                        
                        <h5>Create Slots</h5>
                        
                        <form onSubmit={handleCreateSlots}>
                        <div className='container'>
                            <div className='row g-3'>

                            <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={isRecurring}
                                id="recuringTimeSlot"
                                onChange={handleRecurringChange}
                                />
                                <label className="form-check-label" htmlFor="recuringTimeSlot">
                                    Recuring Time Slot?
                                </label>
                            </div>
                            <div className='col-md-6'>
                                <div className="mb-3">
                                <label htmlFor="startDate" className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                                </div>
                            </div>
                            

                            <div className='col-md-6'>
                                <div className="mb-3">
                                <label htmlFor="endDate" className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    readOnly={!isRecurring}
                                    required
                                />
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <div className="mb-3">
                                <label htmlFor="startTime" className="form-label">Start Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <div className="mb-3">
                                <label htmlFor="endTime" className="form-label">End Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                                </div>
                            </div>

                            <div className='col-12 mt-3'>
                                <div className="d-flex justify-content-end gap-2">
                                <button type="submit" className="btn btn-success">Confirm Change</button>
                                <button type="reset" className="btn btn-danger">Clear</button>
                                </div>
                            </div>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Serviceoff;

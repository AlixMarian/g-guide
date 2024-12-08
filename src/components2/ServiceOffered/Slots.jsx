import { useState, useEffect, useCallback } from 'react';
import { db } from '/backend/firebase';
import { doc, addDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';
import DatePicker from 'react-datepicker';
import { Table } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';


export const Slots = () => {
  // eslint-disable-next-line no-unused-vars
  const [userID, setUserID] = useState(null);
  const [churchId, setChurchId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentSlotId, setCurrentSlotId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const auth = getAuth();


  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

   const handleStartDateChange = (date) => {
    setStartDate(formatDate(date));
  };

  const handleEndDateChange = (date) => {
    setEndDate(formatDate(date));
  };

  const handleRecurringChange = (e) => {
    setIsRecurring(e.target.checked);
    if (!e.target.checked) {
      setEndDate('');
    }
  };

  // Fetch church ID associated with the logged-in user
  const fetchChurchId = async (userId) => {
    try {
      const coordinatorQuery = query(
        collection(db, 'coordinator'),
        where('userId', '==', userId)
      );
      const coordinatorSnapshot = await getDocs(coordinatorQuery);

      if (!coordinatorSnapshot.empty) {
        const coordinatorDoc = coordinatorSnapshot.docs[0];
        const churchQuery = query(
          collection(db, 'church'),
          where('coordinatorID', '==', coordinatorDoc.id)
        );
        const churchSnapshot = await getDocs(churchQuery);

        if (!churchSnapshot.empty) {
          const fetchedChurchId = churchSnapshot.docs[0].id;
          setChurchId(fetchedChurchId);
          console.log('Fetched churchId:', fetchedChurchId);
          return fetchedChurchId;
        } else {
          toast.error('No associated church found for this coordinator.');
        }
      } else {
        toast.error('No coordinator found for the logged-in user.');
      }
    } catch (error) {
      console.error('Error fetching churchId:', error);
      toast.error('Failed to fetch church details.');
    }
    return null;
  };

  // Fetch slots associated with the churchId
  const fetchSlots = async () => {
    if (!churchId) {
      console.error('Church ID is missing. Cannot fetch slots.');
      return;
    }
    setLoading(true); // Set loading state to true
    try {
      const slotsCollection = collection(db, 'slot');
      const q = query(slotsCollection, where('churchId', '==', churchId));
      const querySnapshot = await getDocs(q);

      const slotsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      slotsList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setSlots(slotsList);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Error fetching slots. Please try again.');
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserID(user.uid);
        const fetchedChurchId = await fetchChurchId(user.uid);
        if (fetchedChurchId) {
          fetchSlots(); // Fetch slots once churchId is fetched
        }
      } else {
        toast.error('No user is signed in.');
      }
    });
  }, [auth]);

  useEffect(() => {
    if (churchId) {
      fetchSlots();
    }
  }, [churchId]);


  
 

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };
  
  const renderTime = (slot) => {
    if (!slot.startTime || !slot.endTime || slot.startTime === "none" || slot.endTime === "none") {
      return 'Date disabled';
    }
    return `${convertTo12HourFormat(slot.startTime)} - ${convertTo12HourFormat(slot.endTime)}`;
  };

  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return '';

    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    if (timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleDateString();
    }
  
    return new Date(timestamp).toLocaleDateString();
  };
  
  
  
  const handleCreateSlots = async (e) => {
    e.preventDefault();
    if (!churchId) {
      toast.error('Church ID is missing. Cannot create slots.');
      return;
    }

    try {
      const slotsCollection = collection(db, 'slot');
      const start = new Date(startDate);
      const end = isRecurring && endDate ? new Date(endDate) : start;

      if (!startDate) {
        toast.error('Please select a valid start date.');
        return;
      }

      const dates = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const date of dates) {
        const formattedDate = date.toISOString().split('T')[0];

        const disabledQuery = query(
          slotsCollection,
          where('startDate', '==', formattedDate),
          where('slotStatus', '==', 'disabled'),
          where('churchId', '==', churchId)
        );

        const disabledSnapshot = await getDocs(disabledQuery);

        if (!disabledSnapshot.empty) {
          toast.error(
            `Selected date (${formattedDate}) is marked as disabled. Update the existing timeslot first.`
          );

          setSelectedDate(new Date(formattedDate));
          return;
        }
      }

      const creationPromises = dates.map(async (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        await addDoc(collection(db, 'slot'), {
          startDate: formattedDate,
          startTime,
          endTime,
          slotStatus: 'active',
          churchId,
        });
      });

      await Promise.all(creationPromises);
      resetForm();
      toast.success('Slots created successfully');
      fetchSlots();
    } catch (error) {
      console.error('Error creating slots:', error);
      toast.error('Error creating slots. Please try again.');
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

  const filterSlotsByDate = useCallback(() => {
    let filtered = slots;
    if (selectedDate) {
      filtered = filtered.filter(slot => new Date(slot.startDate).toDateString() === selectedDate.toDateString());
    }
    if (selectedStatus) {
      filtered = filtered.filter(slot => slot.slotStatus === selectedStatus);
    }
    setFilteredSlots(filtered);
  }, [selectedDate, slots, selectedStatus]);

  useEffect(() => {
    filterSlotsByDate();
  }, [selectedDate, slots, selectedStatus, filterSlotsByDate]);

  const handleEditSlot = (slot) => {
    setStartDate(slot.startDate);
    setEndDate(slot.endDate !== '' ? slot.endDate : '');
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setEditing(true);
    setCurrentSlotId(slot.id);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
  
    if (!churchId || !currentSlotId) {
      toast.error('Church ID or Slot ID is missing. Cannot update slot.');
      return;
    }
  
    try {
      await updateDoc(doc(db, 'slot', currentSlotId), {
        startDate,
        endDate: isRecurring ? endDate : '',
        startTime,
        endTime,
        slotStatus: 'active',
        churchId, // Use the correct churchId
      });
  
      resetForm();
      toast.success('Slot updated successfully');
      fetchSlots();
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error('Error updating slot. Please try again.');
    }
  };
  
  const handleDisableSlots = async (e) => {
    e.preventDefault();
  
    if (!churchId) {
      toast.error('Church ID is missing. Cannot disable slots.');
      return;
    }
  
    try {
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      const dates = [];
      let currentDate = start;
  
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      const slotsCollection = collection(db, 'slot');
  
      for (const date of dates) {
        const formattedDate = date.toISOString().split('T')[0];
  
        // Fetch and delete active slots for the date
        const activeSlotsQuery = query(
          slotsCollection,
          where('startDate', '==', formattedDate),
          where('slotStatus', '==', 'active'),
          where('churchId', '==', churchId) // Match churchId
        );
  
        const activeSlotsSnapshot = await getDocs(activeSlotsQuery);
        const deleteActivePromises = activeSlotsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deleteActivePromises);
  
        // Check if disabled slot already exists
        const disabledSlotsQuery = query(
          slotsCollection,
          where('startDate', '==', formattedDate),
          where('slotStatus', '==', 'disabled'),
          where('churchId', '==', churchId) // Match churchId
        );
  
        const disabledSlotsSnapshot = await getDocs(disabledSlotsQuery);
  
        if (disabledSlotsSnapshot.empty) {
          // Add disabled slot if it doesn't exist
          await addDoc(slotsCollection, {
            startDate: formattedDate,
            startTime: 'none',
            endTime: 'none',
            slotStatus: 'disabled',
            churchId, // Use the correct churchId
          });
        }
      }
  
      resetForm();
      toast.success('Date(s) have been disabled, and active slots have been removed.');
      fetchSlots();
    } catch (error) {
      console.error('Error disabling slots:', error);
      toast.error('Error disabling slots. Please try again.');
    }
  };
  
  const handleDisableSelectedSlot = async (e) => {
    e.preventDefault();
  
    if (!churchId) {
      toast.error('Church ID is missing. Cannot disable selected slots.');
      return;
    }
  
    try {
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      const dates = [];
      let currentDate = start;
  
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      const slotsCollection = collection(db, 'slot');
  
      for (const date of dates) {
        const formattedDate = date.toISOString().split('T')[0];
  
        // Fetch and delete active slots for the date
        const activeSlotsQuery = query(
          slotsCollection,
          where('startDate', '==', formattedDate),
          where('slotStatus', '==', 'active'),
          where('churchId', '==', churchId) // Match churchId
        );
  
        const activeSlotsSnapshot = await getDocs(activeSlotsQuery);
        const deleteActivePromises = activeSlotsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deleteActivePromises);
  
        // Check if disabled slot already exists
        const disabledSlotsQuery = query(
          slotsCollection,
          where('startDate', '==', formattedDate),
          where('slotStatus', '==', 'disabled'),
          where('churchId', '==', churchId) // Match churchId
        );
  
        const disabledSlotsSnapshot = await getDocs(disabledSlotsQuery);
  
        if (disabledSlotsSnapshot.empty) {
          // Add disabled slot if it doesn't exist
          await addDoc(slotsCollection, {
            startDate: formattedDate,
            startTime: 'none',
            endTime: 'none',
            slotStatus: 'disabled',
            churchId, // Use the correct churchId
          });
        }
      }
  
      resetForm();
      toast.success('Date(s) have been disabled, and active slots have been removed.');
      fetchSlots();
    } catch (error) {
      console.error('Error disabling slots:', error);
      toast.error('Error disabling slots. Please try again.');
    }
  };
  

  const handleStatusChange = (status) => {
    setSelectedStatus(status === 'all' ? '' : status);
  };

  const resetForm = () => {
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
    setIsRecurring(false);
    setSelectedDate(null);
    setSelectedStatus('');
    setEditing(false);
    setCurrentSlotId(null);
  };

  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage);

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
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }


  const currentItems = filteredSlots.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="TimeSlots">
      <h1 className="me-3">Time Slots</h1>
      <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3>{editing ? 'Modify Selected Time Slot' : 'Create or Disable Time Slots'}</h3>
              <form onSubmit={editing ? handleUpdateSlot : handleCreateSlots}>
                <div className="container">
                  <div className="row g-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="recurringTimeSlot"
                        onChange={handleRecurringChange}
                        checked={isRecurring}
                      />
                      <label className="form-check-label" htmlFor="recurringTimeSlot">
                        Recurring Time Slot?
                      </label>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="startDate" className="form-label"><b>Start Date</b></label>
                      <DatePicker
                        className="form-control"
                        id="startDate"
                        selected={startDate ? new Date(startDate) : null}
                        onChange={handleStartDateChange}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="endDate" className="form-label"><b>End Date</b> <i>(Only for recurring slots)</i></label>
                      <DatePicker
                        className="form-control"
                        id="endDate"
                        selected={endDate ? new Date(endDate) : null}
                        onChange={handleEndDateChange}
                        minDate={new Date()}
                        readOnly={!isRecurring}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="startTime" className="form-label"><b>Start Time</b></label>
                      <input
                        type="time"
                        className="form-control"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="endTime" className="form-label"><b>End Time</b></label>
                      <input
                        type="time"
                        className="form-control"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 mt-3">
                      <div className="d-flex justify-content-end gap-2">
                        <button type="submit" className="btn btn-success">{editing ? 'Update Time Slot' : 'Create Time Slot'}</button>
                        {editing && (
                          <>
                            <button type="button" className="btn btn-warning" onClick={handleDisableSelectedSlot}>Disable Selected Slot</button>
                          </>
                        )}
                        {!editing && (
                          <button type="button" className="btn btn-warning" onClick={handleDisableSlots}>Disable Date</button>
                        )}
                        <button type="button" className="btn btn-danger" onClick={resetForm}>Clear</button>
                        {editing && (
                          <>
                            <button type="button" className="btn btn-dark" onClick={handleCancelEdit}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-lg">
            <div className="card-body">
            <h3>Created Time Slots</h3>
            <div className="filtering">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="form-group">
                  <label className="form-label"><b>Filter by date:</b></label>
                  <div className="input-group">
                    <DatePicker
                      className="form-control"
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      showYearDropdown
                    />
                    <button className="btn btn-danger" onClick={() => setSelectedDate(null)}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label"><b>Filter by status:</b></label>
                  <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      {selectedStatus || 'Select Status'}
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('all'); }}>All</a></li>
                      <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('active'); }}>Active Dates</a></li>
                      <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('disabled'); }}>Disabled Dates</a></li>
                      <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('taken'); }}>Taken Dates</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <br />
              
                {loading?(
                  <div className='text-center my-4'>
                    <p>Loading time slots...</p>
                  </div>
                ):(
                  <div>
                      {currentItems.length > 0 ? (  
                      <Table striped bordered hover responsive style={{ borderRadius: '12px', overflow: 'hidden', borderCollapse: 'hidden' }}>
                        <thead className="table-dark">
                            <tr>
                              <th className='slots-th'>Date</th>
                              <th className='slots-th'>Time</th>
                              <th className='slots-th'>Status</th>
                              <th className='slots-th'>Action</th>
                            </tr>
                        </thead>
                          <tbody>
                            {currentItems.map(slot => (
                              <tr key={slot.id}>
                                <td className='slots-td'>{formatFirebaseTimestamp(slot.startDate)}</td>
                                <td className='slots-td'>{renderTime(slot)}</td>
                                <td
                                  className={`slots-td ${
                                    slot.slotStatus === 'active'
                                      ? 'text-success' 
                                      : slot.slotStatus === 'disabled'
                                      ? 'text-danger'
                                      : slot.slotStatus === 'taken'
                                      ? 'text-primary' 
                                      : ''
                                  }`}
                                >
                                ● {slot.slotStatus.charAt(0).toUpperCase() + slot.slotStatus.slice(1)}
                                </td>
                                <td className='slots-td'>
                                  <div className="btn-group" role="group" aria-label="Slot actions">
                                    <button type="button" className="btn btn-primary" onClick={() => handleEditSlot(slot)}>Edit</button>
                                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteSlot(slot.id)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="text-center py-5">
                          <h4 className="text-muted">No time slots found</h4>
                        </div>
                      )}
                        <Pagination className="d-flex justify-content-center">
                          <Pagination.Prev disabled={currentPage === 1} onClick={handlePreviousPage} />
                          {pageNumbers.map(number => (
                            <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                              {number}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next disabled={currentPage === totalPages} onClick={handleNextPage} />
                        </Pagination>
                  </div>
                )}
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Slots;

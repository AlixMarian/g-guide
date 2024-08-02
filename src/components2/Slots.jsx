import { useState, useEffect, useCallback } from 'react';
import { db } from '/backend/firebase';
import { doc, addDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../churchCoordinator.css';
import DatePicker from 'react-datepicker';

export const Slots = () => {
  // eslint-disable-next-line no-unused-vars
  const [userID, setUserID] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentSlotId, setCurrentSlotId] = useState(null);

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

  const convertTo12HourFormat = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  const handleCreateSlots = async (e) => {
    e.preventDefault();
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
            const formattedDate = date.toISOString().split('T')[0]; 
            await addDoc(collection(db, 'slot'), {
              startDate: formattedDate,
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
        setIsRecurring(false);
        toast.success('Slots created successfully');
        fetchSlots();
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

  const filterSlotsByDate = useCallback(() => {
    if (selectedDate) {
      const filtered = slots.filter(slot => 
        new Date(slot.startDate).toDateString() === selectedDate.toDateString()
      );
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots(slots);
    }
  }, [selectedDate, slots]);

  useEffect(() => {
    filterSlotsByDate();
  }, [selectedDate, slots, filterSlotsByDate]);


    const handleEditSlot = (slot) => {
        setStartDate(slot.startDate);
        setEndDate(slot.endDate !== '' ? slot.endDate : '');
        setStartTime(slot.startTime);
        setEndTime(slot.endTime);
        setEditing(true);
        setCurrentSlotId(slot.id);
      };
    
      const handleCancelEdit = () => {
        setStartDate('');
        setEndDate('');
        setStartTime('');
        setEndTime('');
        setIsRecurring(false);
        setEditing(false);
        setCurrentSlotId(null);
      };

      const handleUpdateSlot = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user && currentSlotId) {
          try {
            await updateDoc(doc(db, 'slot', currentSlotId), {
              startDate,
              endDate: isRecurring ? endDate : '', // Only update endDate if recurring
              startTime,
              endTime,
              slotStatus: 'active',
              churchId: user.uid,
            });
    
            setStartDate('');
            setEndDate('');
            setStartTime('');
            setEndTime('');
            setIsRecurring(false);
            setEditing(false);
            setCurrentSlotId(null);
            toast.success('Slot updated successfully');
            fetchSlots(); // Fetch the updated slots list
          } catch (error) {
            toast.error('Error updating slot: ', error);
          }
        } else {
          alert('No user signed in or no slot selected.');
        }
      };

      return (
        <div>
          <div className='card'>
            <div className='card-body'>
              <div className='filterDates'>
                <label className='me-2'>Filter by date:</label>
                <DatePicker
                  className='form-control'
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  showYearDropdown
                />
              </div>
              <br />
              <h5>Created Time Slots</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th scope='col'>Date</th>
                    <th scope='col'>Time</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map(slot => (
                    <tr key={slot.id}>
                      <td>{slot.startDate}</td>
                      <td>{convertTo12HourFormat(slot.startTime)} - {convertTo12HourFormat(slot.endTime)}</td>
                      <td>
                        <button className="btn btn-primary me-2" onClick={() => handleEditSlot(slot)}>
                          Edit
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-danger" onClick={() => handleDeleteSlot(slot.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <br />
              <h5>{editing ? 'Modify Selected Time Slot' : 'Create or Disable Time Slots'}</h5>
              <form onSubmit={editing ? handleUpdateSlot : handleCreateSlots}>
                <div className='container'>
                  <div className='row g-3'>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={isRecurring}
                        id="reccuringTimeSlot"
                        onChange={handleRecurringChange}
                        checked={isRecurring}
                      />
                      <label className="form-check-label" htmlFor="recuringTimeSlot">
                        Recurring Time Slot?
                      </label>
                    </div>
                    <div className='col-md-6'>
                      <div className="mb-3">
                        <label htmlFor="startDate" className="form-label"><b>Start Date</b></label>
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
                        <label htmlFor="endDate" className="form-label"><b>End Date</b> <i>(Only for recurring slots)</i></label>
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
                    </div>
                    <div className='col-md-6'>
                      <div className="mb-3">
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
                    </div>
                    <div className='col-12 mt-3'>
                      <div className="d-flex justify-content-end gap-2">
                        <button type="submit" className="btn btn-success">
                          {editing ? 'Update Slot' : 'Confirm Change'}
                        </button>
                        {editing && (
                          <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        )}
                        <button type="reset" className="btn btn-danger">Clear</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };
    
    export default Slots;

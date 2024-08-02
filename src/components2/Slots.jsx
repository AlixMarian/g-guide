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
const [selectedStatus, setSelectedStatus] = useState('');

const auth = getAuth();

const handleRecurringChange = (e) => {
  setIsRecurring(e.target.checked);
  if (!e.target.checked) {
    setEndDate('');
  }
};

useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    setUserID(user ? user.uid : null);
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
  if (!time || time === "none") return "none";
  const [hours, minutes] = time.split(':');
  let hours12 = (hours % 12) || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours12}:${minutes} ${ampm}`;
};

const renderTime = (slot) => {
  if (!slot.startTime || !slot.endTime || 
    slot.startTime === "none" || slot.endTime === "none") {
    return 'Information unavailable: Date disabled';
  }
  return `${convertTo12HourFormat(slot.startTime)} - ${convertTo12HourFormat(slot.endTime)}`;
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

      resetForm();
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
  const user = auth.currentUser;

  if (user && currentSlotId) {
    try {
      await updateDoc(doc(db, 'slot', currentSlotId), {
        startDate,
        endDate: isRecurring ? endDate : '', 
        startTime,
        endTime,
        slotStatus: 'active',
        churchId: user.uid,
      });

      resetForm();
      toast.success('Slot updated successfully');
      fetchSlots();
    } catch (error) {
      toast.error('Error updating slot: ', error);
    }
  } else {
    alert('No user signed in or no slot selected.');
  }
};

const handleDisableSlots = async (e) => {
  e.preventDefault();
  const user = auth.currentUser;

  if (user) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];
      let currentDate = start;

      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const slotsCollection = collection(db, 'slot');
      const existingDisabledSlotsPromises = dates.map(async (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        const q = query(
          slotsCollection,
          where('startDate', '==', formattedDate),
          where('slotStatus', '==', 'disabled'),
          where('churchId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.length > 0;
      });

      const existingDisabledSlots = await Promise.all(existingDisabledSlotsPromises);

      const datesToDisable = dates.filter((_, index) => !existingDisabledSlots[index]);

      if (datesToDisable.length > 0) {
        const promises = datesToDisable.map(async (date) => {
          const formattedDate = date.toISOString().split('T')[0];
          await addDoc(collection(db, 'slot'), {
            startDate: formattedDate,
            startTime: 'none',
            endTime: 'none',
            slotStatus: 'disabled',
            churchId: user.uid,
          });
        });

        await Promise.all(promises);
      } else {
        await addDoc(collection(db, 'slot'), {
          startDate,
          startTime: 'none',
          endTime: 'none',
          slotStatus: 'disabled',
          churchId: user.uid,
        });
      }

      resetForm();
      toast.success('Date(s) have been disabled');
      fetchSlots();
    } catch (error) {
      toast.error('Error disabling slots: ', error);
    }
  } else {
    toast.error('No user signed in.');
  }
};

const handleDisableSelectedSlot = async () => {
  const user = auth.currentUser;

  if (user && currentSlotId) {
    try {
      await updateDoc(doc(db, 'slot', currentSlotId), {
        slotStatus: 'disabled',
        startTime: 'none',
        endTime: 'none',
      });

      resetForm();
      toast.success('Slot disabled successfully');
      fetchSlots();
    } catch (error) {
      toast.error('Error disabling slot: ', error);
    }
  } else {
    toast.error('No user signed in or no slot selected.');
  }
};

const handleStatusChange = (status) => {
  setSelectedStatus(status === 'all' ? '' : status);
};

const resetForm = () => {
  setStartDate('');
  setEndDate('');
  setStartTime('');
  setEndTime('');
  setIsRecurring(false);
  setSelectedDate(null);
  setSelectedStatus('');
  setEditing(false);
  setCurrentSlotId(null);
};

      
      return (
        <div>
          <div className='card'>
            <div className='card-body'>
            <div className="filtering">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className='filterDates'>
                    <label className='me-2'><b>Filter by date:</b></label>
                    <DatePicker
                      className='form-control'
                      selected={selectedDate}
                      onChange={date => setSelectedDate(date)}
                      showYearDropdown
                    />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="filterStatus dropdown">
                    <label className='me-2'><b>Filter by status:</b></label>
                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {selectedStatus || 'Select Status'}
                    </button>
                    <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('all'); }}>All</a></li>
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('active'); }}>Active Dates</a></li>
                      <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleStatusChange('disabled'); }}>Disabled Dates</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
              <br />
              <h5>Created Time Slots</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th scope='col'>Date</th>
                    <th scope='col'>Time</th>
                    <th scope='col'>Status</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                {filteredSlots.map(slot => (
                <tr key={slot.id}>
                  <td>{slot.startDate}</td>
                  <td>{renderTime(slot)}</td>
                  <td>{slot.slotStatus}</td>
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
                      <div className="col-md-6">
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
                      <div className="col-md-6 ">
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
                        <button type="submit" className="btn btn-success">{editing ? 'Update Time Slot' : 'Create Time Slot'}</button>
                        {editing && (
                          <>
                          <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                          <button type="button" className="btn btn-warning" onClick={handleDisableSelectedSlot}>Disable Selected Slot</button>
                        </>
                        )}
                        {!editing && (
                          <button type="button" className="btn btn-danger" onClick={handleDisableSlots}>Disable Date</button>
                        )}
                          <button type="button" className="btn btn-danger" onClick={resetForm}>Clear</button>
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

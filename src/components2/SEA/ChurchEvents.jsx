import { useEffect, useState } from 'react';
import { getEventList, addEventSchedule, updateEventSchedule, deleteEventSchedule } from '../Services/seaServices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { Table } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import '../../churchCoordinator.css';

export const ChurchEvents = () => {
  const [eventList, setEventList] = useState([]);
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userId, setUserId] = useState('');
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
    getEventList(setEventList, creatorId);
  };

  const onSubmitEvent = () => {
    const eventData = {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
    };
    addEventSchedule(eventData, userId, () => getEventList(setEventList, userId));
  };

  const onUpdateEvent = () => {
    const eventData = {
      eventDate: newEventDate,
      eventName: newEventName,
      eventTime: newEventTime,
    };
    updateEventSchedule(editingEvent.id, eventData, () => {
      getEventList(setEventList, userId);
      setEditingEvent(null);
      clearForm();
    });
  };

  const handleDeleteEventSchedule = async (id) => {
    await deleteEventSchedule(id, () => getEventList(setEventList, userId));
  };

  const handleEditEventSchedule = (event) => {
    setEditingEvent(event);
    setNewEventDate(event.eventDate);
    setNewEventName(event.eventName);
    setNewEventTime(event.eventTime);
  };

  const clearForm = () => {
    setNewEventDate("");
    setNewEventName("");
    setNewEventTime("");
  };

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  
  const filteredEvents = selectedDate
    ? eventList.filter(
        (event) => new Date(event.eventDate).toDateString() === selectedDate.toDateString()
      )
    : eventList;

  
  const sortedEvents = filteredEvents.sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return dateA - dateB; 
  });

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEvents.slice(indexOfFirstItem, indexOfLastItem);

  
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <h1 className="me-3">Church Events</h1>
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-lg">
              <div className="card-body">
                <h3>{editingEvent ? "Edit Event Schedule" : "Add Event Schedule"}</h3>
                <form
                  className="row g-3 needs-validation"
                  noValidate
                  onSubmit={(e) => handleSubmit(e, editingEvent ? onUpdateEvent : onSubmitEvent)}
                >
                  <div className="col-6">
                    <label htmlFor="eventDate" className="form-label">
                      <b>Date</b>
                    </label>
                    <input
                      type="date"
                      className="form-control w-100"
                      id="eventDate"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                        .toISOString()
                        .split('T')[0]}
                      required
                    />
                    <div className="invalid-feedback">Please provide a valid date</div>
                  </div>
                  <div className="col-6">
                    <label htmlFor="eventTime" className="form-label">
                      <b>Time</b>
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="eventTime"
                      placeholder="00:00"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      required
                    />
                    <div className="invalid-feedback">Please provide a valid time</div>
                  </div>
                  <div className="col-md-12">
                    <label htmlFor="eventType" className="form-label">
                      <b>Name of Event</b>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="eventType"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      required
                    />
                    <div className="invalid-feedback">Please provide a name</div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-success">
                      {editingEvent ? "Confirm Changes" : "Submit"}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={clearForm}>
                      Clear
                    </button>
                    {editingEvent && (
                      <button type="button" className="btn btn-dark" onClick={() => { setEditingEvent(null); clearForm(); }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow-lg">
              <div className="card-body">
                <h3>List of Events</h3>
                <div className="form-group">
                  <label className="form-label">
                    <b>Filter by date:</b>
                  </label>
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

                {currentItems.length > 0 ? (
                  <Table striped bordered hover responsive style={{ borderRadius: "12px", overflow: "hidden", borderCollapse: "hidden" }}>
                    <thead className="table-dark">
                      <tr>
                        <th className="events-th">Date</th>
                        <th className="events-th">Name</th>
                        <th className="events-th">Time</th>
                        <th className="events-th">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((events) => (
                        <tr key={events.id}>
                          <td className="events-td">{formatDate(events.eventDate)}</td>
                          <td className="events-td">{events.eventName}</td>
                          <td className="events-td">
                            {convertTo12HourFormat(events.eventTime)}
                          </td>
                          <td className="events-td">
                            <div className="btn-group" role="group">
                              <button type="button" className="btn btn-primary" onClick={() => handleEditEventSchedule(events)}>Edit</button>
                              <button type="button" className="btn btn-danger" onClick={() => handleDeleteEventSchedule(events.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <h4 className="text-muted">No events found</h4>
                  </div>
                )}
                <Pagination className="d-flex justify-content-center mt-3">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
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

export default ChurchEvents;

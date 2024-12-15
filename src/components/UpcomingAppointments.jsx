import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import Pagination from 'react-bootstrap/Pagination';

const appointmentTypeMapping = {
  marriageCertificate: "Marriage Certificate",
  birthCertificate: "Birth Certificate",
  baptismalCertificate: "Baptismal Certificate",
  burialCertificate: "Burial Certificate",
  confirmationCertificate: "Confirmation Certificate",
  baptism: "Baptism",
  burial: "Burial",
  marriage: "Marriage",
  confirmation: "Confirmation",
};

const UpcomingAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState({});
  const [churches, setChurches] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user);
        await fetchUpcomingAppointments(user.uid);
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchUpcomingAppointments = async (userId) => {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userFields.requesterId', '==', userId),
        where('appointmentStatus', '==', 'Approved')
      );
      const appointmentDocs = await getDocs(appointmentsQuery);
      const appointmentData = appointmentDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const slotIds = appointmentData
        .filter(app => app.slotId)
        .map(app => app.slotId);

      const slotPromises = slotIds.map(slotId => getDoc(doc(db, 'slot', slotId)));
      const slotDocs = await Promise.all(slotPromises);

      const slotData = slotDocs.reduce((acc, slotDoc) => {
        if (slotDoc.exists()) {
          acc[slotDoc.id] = slotDoc.data();
        }
        return acc;
      }, {});

      const churchIds = [...new Set(appointmentData.map(app => app.churchId))];
      const churchPromises = churchIds.map(churchId => getDoc(doc(db, 'church', churchId)));
      const churchDocs = await Promise.all(churchPromises);

      const churchData = churchDocs.reduce((acc, churchDoc) => {
        if (churchDoc.exists()) {
          acc[churchDoc.id] = churchDoc.data().churchName;
        }
        return acc;
      }, {});

      const currentDate = new Date();
      console.log("Current Date and Time:", currentDate);

      const filteredAppointments = appointmentData
        .filter(app => {
          const slot = slotData[app.slotId];
          if (!slot) return false;
          const startDate = new Date(slot.startDate);
          return startDate >= currentDate;
        })
        .sort((a, b) => {
          const dateA = new Date(slotData[a.slotId]?.startDate || 0);
          const dateB = new Date(slotData[b.slotId]?.startDate || 0);
          return dateA - dateB;
        });

      setAppointments(filteredAppointments);
      setSlots(slotData);
      setChurches(churchData);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(appointments.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  return (
    <div className="col-12 mb-4">
      <div className="card">
        <div className="card-body d-flex align-items-center justify-content-between">
          <h5 className="card-title mb-0"><b>Upcoming Appointments</b></h5>
        </div>
        <div className="card-body" style={{ height: '438px' }}>
        <div className="d-flex flex-column h-100">
          <div className="flex-grow-1">
            <div className="row">
              {currentAppointments.length > 0 ? (
                currentAppointments.map(appointment => {
                  const slot = slots[appointment.slotId];
                  const startDate = new Date(slot?.startDate);
                  const formattedDate = startDate.toLocaleDateString();
                  const startTime = convertTo12HourFormat(slot.startTime)|| "N/A";
                  const endTime = convertTo12HourFormat(slot.endTime) || "N/A";
                  const appointmentType = appointmentTypeMapping[appointment.appointmentType] || "Unknown Appointment Type";
                  const churchName = churches[appointment.churchId] || "Unknown Church";

                  return (
                    <div key={appointment.id} className="col-12 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title mb-0">{appointmentType}</h5>
                          <p className="card-text mb-0"><b>Date:</b> {formattedDate}</p>
                          <p className="card-text mb-0"><b>Time:</b> {startTime} - {endTime}</p>
                          <p className="card-text mb-0"><b>Church:</b> {churchName}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <h4 className="text-muted text-center">You have no upcoming appointments</h4>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-center mt-auto">
            <Pagination>
              {pageNumbers.map(number => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => paginate(number)}
                >
                  {number}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointments;

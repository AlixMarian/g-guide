import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';

export const MassIntention = () => {
  const { churchId } = useParams();
  const [churchData, setChurchData] = useState(null);
  const [userData, setUserData] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    thanksgivingMass: '',
    petition: '',
    forTheSoulOf: ''
  });

  const [massSchedules, setMassSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  useEffect(() => {
    const fetchChurchData = async () => {
      const docRef = doc(db, 'church', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChurchData(docSnap.data());
      }
    };
    fetchChurchData();
  }, [churchId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Fetch mass schedules
  useEffect(() => {
    const fetchMassSchedules = async () => {
      const q = query(collection(db, 'massSchedules'), where('creatorId', '==', churchId));
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMassSchedules(schedules);
    };

    fetchMassSchedules();
  }, [churchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      if (!selectedScheduleId) {
        toast.error("Please select a mass schedule.");
        return;
      }

      const selectedSchedule = massSchedules.find(schedule => schedule.id === selectedScheduleId);

      try {
        const massIntentionData = {
          churchId: churchId,
          userId: user.uid,
          userName: `${userData?.firstName || ''} ${userData?.lastName || ''}`,
          userContact: userData?.contactNum || '',
          userEmail: userData?.email || '',
          dateOfRequest: Timestamp.fromDate(new Date()),
          thanksgivingMass: formData.thanksgivingMass,
          petition: formData.petition,
          forTheSoulOf: formData.forTheSoulOf,
          massSchedule: selectedSchedule, 
        };

        await addDoc(collection(db, 'massIntentions'), massIntentionData);
        toast.success("Mass intention request submitted successfully.");
        resetForm();
      } catch (error) {
        console.error("Error submitting mass intention request: ", error);
        toast.error(`Error submitting mass intention request: ${error.message}`);
      }
    } else {
      toast.error("Error: No user signed in.");
    }
  };

  const handleClear = () => {
    resetForm();
    toast.success('Form cleared');
  };

  const resetForm = () => {
    setFormData({
      thanksgivingMass: '',
      petition: '',
      forTheSoulOf: ''
    });
    setSelectedScheduleId(null); 
  };

  const handleScheduleSelect = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form className="massIntentionForm" onSubmit={handleSubmit}>
        <div className="userDetails card mb-4">
          <div className="card-body">
            <h5 className="card-title">User Details</h5>
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label">Selected Service</label>
                        <input type="text" className="form-control" id="selectedService" readOnly placeholder="Mass Intention" />
                    </div>
                </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">User Name</label>
                  <input type="text" className="form-control" id="userName" readOnly value={`${userData?.firstName || ""} ${userData?.lastName || ""}`} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">User Contact</label>
                  <input type="text" className="form-control" id="userContact" readOnly value={userData?.contactNum || ""} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">User Email</label>
                  <input type="text" className="form-control" id="userEmail" readOnly value={userData?.email || ""} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="massDetails card mb-4">
          <div className="card-body">
            <h5 className="card-title">Mass Intentions</h5><br/>
            <h6 className="card-title">Please select a mass schedule</h6>
            <table className='table'>
              <thead>
                <tr>
                  <th scope="col">Select</th>
                  <th scope="col">Day</th>
                  <th scope="col">Time</th>
                  <th scope="col">AM/PM</th>
                </tr>
              </thead>
              <tbody>
                {massSchedules.map(schedule => (
                  <tr key={schedule.id}>
                    <td>
                      <input
                        type="radio"
                        name="schedule"
                        value={schedule.id}
                        checked={selectedScheduleId === schedule.id}
                        onChange={() => handleScheduleSelect(schedule.id)}
                      />
                    </td>
                    <td>{schedule.massDate}</td>
                    <td>{schedule.massTime}</td>
                    <td>{schedule.massPeriod}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mb-3">
              <label htmlFor="thanksgiving" className="form-label">Thanksgiving</label>
              <textarea className="form-control" id="thanksgiving" name="thanksgivingMass" onChange={handleChange} value={formData.thanksgivingMass || ''}></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="petition" className="form-label">Petition</label>
              <textarea className="form-control" id="petition" name="petition" onChange={handleChange} value={formData.petition || ''} ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="forTheSoulOf" className="form-label">For the Soul of</label>
              <textarea className="form-control" id="forTheSoulOf" name="forTheSoulOf" onChange={handleChange} value={formData.forTheSoulOf || ''} ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="forTheSoulOf" className="form-label">Please scan the QR code for your offering:</label>
              
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button type="submit" className="btn btn-success me-md-2">Submit Request</button>
          <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
        </div>
      </form>
    </div>
  );
};

export default MassIntention;

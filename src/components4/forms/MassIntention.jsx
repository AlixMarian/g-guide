import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';

export const MassIntention = () => {
  const { churchId } = useParams();
  const [churchData, setChurchData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState(null);
  const fileInputRef = useRef(null);
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
  const [weekdays, setWeekdays] = useState([]);
  const [weekends, setWeekends] = useState([]);

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

  useEffect(() => {
    const fetchMassSchedules = async () => {
      try {
        const q = query(
          collection(db, 'massSchedules'),
          where('churchId', '==', churchId) 
        );

        const querySnapshot = await getDocs(q);
        const schedules = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        
        const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const weekendOrder = ['Saturday', 'Sunday'];

        const weekdaySchedules = schedules.filter((schedule) =>
          weekdayOrder.includes(schedule.massDate)
        );
        const weekendSchedules = schedules.filter((schedule) =>
          weekendOrder.includes(schedule.massDate)
        );

      
        weekdaySchedules.sort(
          (a, b) =>
            weekdayOrder.indexOf(a.massDate) - weekdayOrder.indexOf(b.massDate) ||
            new Date(`1970-01-01T${a.massTime}:00`) - new Date(`1970-01-01T${b.massTime}:00`)
        );

        weekendSchedules.sort(
          (a, b) =>
            weekendOrder.indexOf(a.massDate) - weekendOrder.indexOf(b.massDate) ||
            new Date(`1970-01-01T${a.massTime}:00`) - new Date(`1970-01-01T${b.massTime}:00`)
        );

        setMassSchedules(schedules);
        setWeekdays(weekdaySchedules);
        setWeekends(weekendSchedules);
      } catch (error) {
        console.error('Error fetching mass schedules:', error);
        toast.error('Failed to load mass schedules. Please try again.');
      }
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
          userFields: {
          requesterId: user.uid,
          requesterName: `${userData?.firstName || ''} ${userData?.lastName || ''}`,
          requesterContact: userData?.contactNum || '',
          requesterEmail: userData?.email || '',}
          ,
          dateOfRequest: Timestamp.fromDate(new Date()),
          thanksgivingMass: formData.thanksgivingMass,
          petition: formData.petition,
          forTheSoulOf: formData.forTheSoulOf,
          massSchedule: selectedSchedule, 
          receiptImage: receiptImageUrl || null,
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
    setSelectedFile(null);
    setReceiptImageUrl(null);
    fileInputRef.current.value = "";
  };

  const handleScheduleSelect = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
  };

  const handleChoosePayment = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (user && selectedFile) {
      try {
        const storageRef = ref(getStorage(), `userPaymentReceipt/${user.uid}/${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        const paymentImageUrl = await getDownloadURL(storageRef);

        setReceiptImageUrl(paymentImageUrl);
        toast.success("Payment receipt uploaded successfully");
      } catch (error) {
        toast.error("Error uploading payment receipt");
        console.error("Error uploading payment receipt:", error);
      }

      fileInputRef.current.value = "";
      setSelectedFile(null);
    } else {
      toast.error("Please select a file to upload");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

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
                      <td>
                        <input
                            type="radio"
                            name="massSchedule"
                            value={schedule.id}
                            checked={selectedScheduleId === schedule.id}
                            onChange={() => handleScheduleSelect(schedule.id)}
                          />
                        </td>
                      <td>{schedule.massDate}</td>
                      <td>{convertTo12HourFormat(schedule.massTime)}</td>
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
                        <td>
                        <input
                            type="radio"
                            name="massSchedule"
                            value={schedule.id}
                            checked={selectedScheduleId === schedule.id}
                            onChange={() => handleScheduleSelect(schedule.id)}
                          />
                        </td>
                        <td>{schedule.massDate}</td>
                        <td>{convertTo12HourFormat(schedule.massTime)}</td>
                        <td>{schedule.massLanguage}</td>
                        <td>{schedule.presidingPriest}</td>
                        <td>{schedule.massType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            <br/>
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
            {churchData?.churchQRDetail && (
              <div className="mb-3">
                <label htmlFor="churchQRCode" className="form-label">Please scan the QR code for your offering:</label>
                <div className="d-flex justify-content-center">
                  <img src={churchData.churchQRDetail} alt="Church QR Code" className="qr-image" />
                </div>
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="paymentReceiptImage" className="form-label">Submit Payment Receipt</label>
              <input type="file" className="form-control" id="paymentReceiptImage" accept="image/*" onChange={handleChoosePayment} ref={fileInputRef} />
              <button type="button" className="btn btn-primary mt-2" onClick={handleSubmitPayment}>Upload Receipt</button>
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-success me-md-2">Submit Request</button>
              <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MassIntention;

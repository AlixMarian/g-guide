import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
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
            {receiptImageUrl && (
              <div className="mb-3">
                <label htmlFor="receiptImagePreview" className="form-label">Receipt Preview:</label>
                <img src={receiptImageUrl} alt="Receipt" className="img-fluid" />
              </div>
            )}
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

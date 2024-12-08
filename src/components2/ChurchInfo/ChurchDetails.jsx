import { useState, useEffect } from 'react';
import { getAuth,  onAuthStateChanged} from 'firebase/auth';
import { doc, getDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db} from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal} from 'react-bootstrap';
import '../../churchCoordinator.css';


export const ChurchDetails = () => {
  // eslint-disable-next-line no-unused-vars
  const [userData, setUserData] = useState(null);
  const [churchId, setChurchId] = useState("");
  const [churchData, setChurchData] = useState({});
  const [newChurchInfo, setNewChurchInfo] = useState({});
  const [showBankModal, setShowBankModal] = useState(false);
  const navigate = useNavigate();

  const handleOpeningTimeChange = (e) => {handleChange(e, 'churchStartTime');};
  const handleClosingTimeChange = (e) => {handleChange(e, 'churchEndTime');};
  const handleViewBank = () => setShowBankModal(true);
  const handleCloseBankModal = () => setShowBankModal(false);
  const handleViewProof = () => {window.open(churchData.churchProof, '_blank', 'noopener,noreferrer');};
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user);
        await fetchChurchId(user.uid); // Fetch churchId
      } else {
        console.log("No user signed in.");
        navigate("/login");
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (churchId) {
      fetchChurchData(churchId);
    }
  }, [churchId]);

  const fetchChurchId = async (userId) => {
    try {
      const coordinatorQuery = query(
        collection(db, 'coordinator'),
        where('userId', '==', userId)
      );
      const coordinatorSnapshot = await getDocs(coordinatorQuery);
  
      if (!coordinatorSnapshot.empty) {
        const churchQuery = query(
          collection(db, 'church'),
          where('coordinatorID', '==', coordinatorSnapshot.docs[0].id)
        );
        const churchSnapshot = await getDocs(churchQuery);
  
        if (!churchSnapshot.empty) {
          const fetchedChurchId = churchSnapshot.docs[0].id;
          setChurchId(fetchedChurchId);
          console.log("Fetched churchId:", fetchedChurchId); // Debugging
        } else {
          toast.error("No associated church found for this coordinator.");
        }
      } else {
        toast.error("No coordinator found for the logged-in user.");
      }
    } catch (error) {
      console.error("Error fetching churchId:", error);
      toast.error("Failed to fetch church details.");
    }
  };

  const fetchChurchData = async (churchId) => {
    try {
      const churchDoc = await getDoc(doc(db, "church", churchId));
      if (churchDoc.exists()) {
        setChurchData(churchDoc.data());
      } else {
        toast.error("Church data not found");
      }
    } catch (error) {
      console.error("Error fetching church data:", error);
      toast.error("Failed to fetch church data.");
    }
  };

  const handleChange = (e, field) => {
    const { value } = e.target;
    setNewChurchInfo((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };
    
  const handleSubmitNewChurchInfo = async (e) => {
    e.preventDefault();
  
    if (!churchId) {
      toast.error("Church ID is missing");
      return;
    }
  
    try {
      const churchDocRef = doc(db, "church", churchId);
      const updatedChurchInfo = { ...newChurchInfo };
  
      
      if (Object.keys(updatedChurchInfo).length === 0) {
        toast.error("No changes detected to update");
        return;
      }
  
      await updateDoc(churchDocRef, updatedChurchInfo);
  
      toast.success("Church data updated successfully");
      fetchChurchData(churchId);
    } catch (error) {
      console.error("Error updating church data:", error);
      toast.error("Error updating church data");
    }
  };
  

  const convertTo12HourFormat = (time) => {
    if (!time || time === 'none') return 'none';
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  return (
      <>
      <h1 className="me-3">Church Details</h1>
      <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
        <div className="card shadow-lg" style={{ width: "89%", marginRight: "4%" }}>
          <div className="card-body">
            <div className="churchHistory">
              <form className="row g-3" onSubmit={handleSubmitNewChurchInfo}>
                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                  <b className="me-2">Church History</b>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                  </svg>
                </label>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    id="exampleFormControlTextarea1"
                    rows="5"
                    placeholder={churchData.churchHistory || ""}
                    onChange={(e) => handleChange(e, 'churchHistory')}
                  ></textarea>
                </div>
              </form>
            </div>

            <form className="row g-3" onSubmit={handleSubmitNewChurchInfo}>
              <div className="col-md-6 col-lg-3">
                <label htmlFor="opening-time" className="me-2"><b>Current Opening Time: </b></label>
                <label htmlFor="existingOpeningTime">{convertTo12HourFormat(churchData.churchStartTime) || ''}</label><br />
                <input
                  type="time"
                  id="opening-time"
                  name="opening-time"
                  placeholder={churchData.churchStartTime || ''}
                  onChange={handleOpeningTimeChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-6 col-lg-3">
                <label htmlFor="closing-time" className="me-2"><b>Closing Time:</b></label>
                <label htmlFor="existingOpeningTime">{convertTo12HourFormat(churchData.churchEndTime) || ''}</label><br />
                <input
                  type="time"
                  id="closing-time"
                  name="closing-time"
                  placeholder={churchData.churchEndTime || ''}
                  onChange={handleClosingTimeChange}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchName" className="form-label"><b>Church Name</b></label>
                <input
                  type="text"
                  id="churchName"
                  className="form-control"
                  name="churchName"
                  placeholder={churchData.churchName || ""}
                  onChange={(e) => handleChange(e, 'churchName')} readOnly
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchEmail" className="form-label"><b>Church Email</b></label>
                <input
                  type="text"
                  className="form-control"
                  id="churchEmail"
                  placeholder={churchData.churchEmail || ""}
                  onChange={(e) => handleChange(e, 'churchEmail')}
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchAddress" className="form-label"><b>Church Address</b></label>
                <input
                  type="text"
                  className="form-control"
                  id="churchAddress"
                  placeholder={churchData.churchAddress || ""}
                  onChange={(e) => handleChange(e, 'churchAddress')} readOnly
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchContactNum" className="form-label"><b>Contact Details</b></label>
                <input
                  type="text"
                  className="form-control"
                  id="churchContactNum"
                  placeholder={churchData.churchContactNum || ""}
                  onChange={(e) => handleChange(e, 'churchContactNum')}
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchRegistrationDate" className="form-label"><b>Registration Date</b></label>
                <input
                  type="text"
                  className="form-control"
                  id="churchRegistrationDate"
                  placeholder={churchData.churchRegistrationDate}
                  readOnly
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchProof" className="form-label"><b>Church Proof</b></label> <br />
                <button type="button" className="btn btn-info" onClick={handleViewProof}>
                  View Submitted Proof
                </button>
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchQRDetail" className="form-label"><b>Banking Details</b></label> <br />
                <button type="button" className="btn btn-info" onClick={handleViewBank}>
                  View Current Banking QR
                </button>
                <br />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-success">Confirm Change</button>
                <button type="reset" className="btn btn-danger">Clear</button>
              </div>
            </form>

            <Modal show={showBankModal} onHide={handleCloseBankModal}>
              <Modal.Header closeButton>
                <Modal.Title>Banking QR Code</Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-center">
                {churchData.churchQRDetail ? (
                  <img
                    src={churchData.churchQRDetail}
                    alt="Banking QR"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ) : (
                  <p>No QR code available</p>
                )}
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
      </>
  );
  };

export default ChurchDetails;

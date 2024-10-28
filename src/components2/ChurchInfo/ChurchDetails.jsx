import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db} from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';


export const ChurchDetails = () => {

    const [userData, setUserData] = useState(null);
    const [churchData, setChurchData] = useState({});
    const [newChurchInfo, setNewChurchInfo] = useState({});
   
    const navigate = useNavigate();

    const handleOpeningTimeChange = (e) => {
        
        handleChange(e, 'churchStartTime');
      };
    
      const handleClosingTimeChange = (e) => {
       
        handleChange(e, 'churchEndTime');
      };

    const handleViewProof = () => {
        window.open(churchData.churchProof, '_blank', 'noopener,noreferrer');
    };
    
    const handleViewBank = () => {
        window.open(churchData.churchQRDetail, '_blank', 'noopener,noreferrer');
    };
  
    useEffect(() => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("User signed in:", user);
          console.log("User id signed in:", user.uid);
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserData(userData);
  

              const churchDoc = await getDoc(doc(db, "church", user.uid));
              if (churchDoc.exists()) {
                setChurchData(churchDoc.data());
              } else {
                toast.error("Church data not found");
              }
            } else {
              toast.error("User data not found");
            }
          } catch (error) {
            toast.error("Error fetching user data");
          }
        } else {
          console.log("No user signed in.");
          navigate('/login');
        }
      });
    }, [navigate]);

    const handleChange = (e, field) => {
        const { value } = e.target;
        setNewChurchInfo((prevState) => ({
          ...prevState,
          [field]: value
        }));
      };
    
      const handleSubmitNewChurchInfo = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user) {
          try {
            const churchDocRef = doc(db, "church", user.uid);
            const updatedChurchInfo = { ...newChurchInfo };
    
            await updateDoc(churchDocRef, updatedChurchInfo);
    
            toast.success("Church data updated successfully");
          } catch (error) {
            toast.error("Error updating church data");
          }
        } else {
          toast.error("User data is missing");
          console.log(user.uid);
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
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg" style={{ width: "89%" }}>
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
                  onChange={(e) => handleChange(e, 'churchName')}
                />
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchAddress" className="form-label"><b>Church Address</b></label>
                <input
                  type="text"
                  className="form-control"
                  id="churchAddress"
                  placeholder={churchData.churchAddress || ""}
                  onChange={(e) => handleChange(e, 'churchAddress')}
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
                <button className="btn btn-success" onClick={handleViewProof}>
                  View Submitted Proof
                </button>
              </div>

              <div className="col-12 col-lg-6">
                <label htmlFor="churchQRDetail" className="form-label"><b>Banking Details</b></label> <br />
                <button className="btn btn-success" onClick={handleViewBank}>
                  View Current Banking QR
                </button>
                <br />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-success">Confirm Change</button>
                <button type="reset" className="btn btn-danger">Clear</button>
              </div>

            </form>
          </div>
        </div>
      </div>
      </>
    );
};

export default ChurchDetails;

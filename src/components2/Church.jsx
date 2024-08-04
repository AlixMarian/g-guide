import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db} from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../churchCoordinator.css';
import ChurchUploads from './ChurchUploads';

export const Church = () => {

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
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
      };

      

    return (
        <>
            <h1>Church Information</h1>

            <div className="churchDetails">
                <form className="row g-3" onSubmit={handleSubmitNewChurchInfo}>
                <h3>CHURCH DETAILS</h3>
                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                    Church History
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="black" d="M7.243 17.997H3v-4.243L14.435 2.319a1 1 0 0 1 1.414 0l2.829 2.828a1 1 0 0 1 0 1.415zm-4.243 2h18v2H3z"/>
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
                <br></br>
                
                <div className="col-md-3 time-input-container">
                    <label htmlFor="opening-time" className='me-2'><b>Current Opening Time: </b></label> 
                    <label htmlFor="existingOpeningTime"> {convertTo12HourFormat(churchData.churchStartTime) || ''}</label><br/>
                    <input
                        type="time"
                        id="opening-time"
                        name="opening-time"
                        placeholder={churchData.churchStartTime || ''}
                        onChange={handleOpeningTimeChange}
                        className="time-input"
                    />
                </div>

                <div className='col-md-3 time-input-container'>
                    <label htmlFor="closing-time" className='me-2'><b>Closing Time:</b></label>
                    <label htmlFor="existingOpeningTime"> {convertTo12HourFormat(churchData.churchEndTime) || ''}</label><br/>
                    <input
                        type="time"
                        id="closing-time"
                        name="closing-time"
                        placeholder={churchData.churchEndTime || ''}
                        onChange={handleClosingTimeChange}
                        className="time-input"
                    />
                </div>

                    <div className="col-md-6">
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
                    <div className="col-md-6">
                        <label htmlFor="churchAddress" className="form-label"><b>Church Address</b></label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchAddress"
                            placeholder={churchData.churchAddress || ""}
                            onChange={(e) => handleChange(e, 'churchAddress')}
                        />
                    </div>
                    <div className="col-6">
                        <label htmlFor="churchEmail" className="form-label"><b>Church Email</b></label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchEmail"
                            placeholder={churchData.churchEmail || ""}
                            onChange={(e) => handleChange(e, 'churchEmail')}
                        />
                    </div>
                    <div className="col-6">
                        <label htmlFor="churchContactNum" className="form-label"><b>Contact Details</b></label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchContactNum"
                            placeholder={churchData.churchContactNum || ""}
                            onChange={(e) => handleChange(e, 'churchContactNum')}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="churchRegistrationDate" className="form-label"><b>Registration Date</b></label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchRegistrationDate"
                            placeholder={churchData.churchRegistrationDate}
                            readOnly
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="churchProof" className="form-label"><b>Church Proof</b></label> <br/>
                        <button className="btn btn-success" onClick={handleViewProof}>
                        View Submitted Proof
                        </button>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="churchQRDetail" className="form-label"><b>Banking Details</b></label> <br/>
                        <button className="btn btn-success" onClick={handleViewBank}>
                        View Current Banking QR
                        </button>
                        <br/>
                        <label htmlFor="transactionMessage" className='form-label'><b><i>Instruction for service transactions:</i></b></label>
                        <input 
                          type="text" 
                          className='form-control' 
                          id="churchInstruction"
                          placeholder={churchData.churchInstruction || ""}
                          onChange={(e) => handleChange(e, 'churchInstruction')}
                          />
                    </div>
                    
                    <div className="announcement-bttn">
                    <br/>
                      <div className="btn-group" role="group">
                        <button type="submit" className="btn btn-success" onSubmit={handleSubmitNewChurchInfo}>Confirm Change</button>
                        <button type="reset" className="btn btn-danger">Clear</button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="churchUploads">
                <h3>CHURCH UPLOADS</h3>

                <ChurchUploads />

                
            </div>
        </>
    );
};

export default Church;

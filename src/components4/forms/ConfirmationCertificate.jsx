import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp, collection, addDoc, } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, storage } from '/backend/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

export const ConfirmationCertificate = () => {
    const { churchId } = useParams();
    const [churchData, setChurchData] = useState(null);
    const [userData, setUserData] = useState(null); 
    const auth = getAuth();
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [authorizationImageFile, setAuthorizationImageFile] = useState(null);
    const [authorizationImageUrl, setAuthorizationImageUrl] = useState('');
    const [showAuthorization, setShowAuthorization] = useState(false);
    const [appointmentPurpose, setAppointmentPurpose] = useState('personal');
    const [refundPolicy, setRefundPolicy] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthdayDate: ''
      });
    
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

      const fetchRefundPolicy = async () => {
        try {
            const churchDocRef = doc(db, 'church', churchId);
            const churchDocSnap = await getDoc(churchDocRef);
            if (churchDocSnap.exists()) {
                setRefundPolicy(churchDocSnap.data().refundPolicy || "No refund policy available.");
            } else {
                setRefundPolicy("No refund policy available.");
            }
        } catch (error) {
            console.error("Error fetching refund policy:", error);
            toast.error("Failed to fetch refund policy.");
        }
    };

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
        fetchRefundPolicy();
        fetchUserData();
    }, [user]);

    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

    const handleAuthorizationUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setAuthorizationImageFile(file);
      }else{
          toast.error("no image detected");
      }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value
        });
      };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
    if (user){
        try {
            
          let authorizationImageUrl = 'none';
              if (authorizationImageFile) {
                  const storageRef = ref(storage, `userAuthorizationLetter/${user.uid}/${authorizationImageFile.name}`);
                  await uploadBytes(storageRef, authorizationImageFile);
                  authorizationImageUrl = await getDownloadURL(storageRef);
              }
                
            const appointmentData = {
              appointmentType: 'confirmationCertificate',
              appointmentStatus: 'Pending',
              appointmentPurpose: appointmentPurpose,
              authorizationLetter: authorizationImageUrl,
              paymentImage: 'none',
              churchId: churchId,
              userFields: {
                requesterId: user.uid,
                requesterName: fullName,
                requesterContact: userData.contactNum,
                requesterEmail: userData.email,
                dateOfRequest: Timestamp.fromDate(new Date()),
              },
              confirmationCertificate: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthdayDate: formData.birthdayDate,
              }
            };
      
            await addDoc(collection(db, 'appointments'), appointmentData);
            toast.success("Request submitted to Church Coordinator. Please wait for approval");
            resetForm();
          } catch (error) {
            console.error("Error submitting request: ", error);
            toast.error(`Error submitting request: ${error.message}`);
          }
        }
    };

    const handleClear = () => {
        resetForm();
        toast.success('Form cleared');
    };

    const resetForm = () => {
        setFormData({
          firstName: '',
          lastName: '',
          birthdayDate: ''
        });
        setAuthorizationImageFile(null);
        setAuthorizationImageUrl('');
    };

    const handlePersonalClick = () => {
      setAppointmentPurpose('personal');
      setShowAuthorization(false);
      setFormData({
        ...formData,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
      });
    };
  
    const handleOthersClick = () => {
      setAppointmentPurpose('others');
      setShowAuthorization(true);
      setFormData({
        ...formData,
        firstName: '',
        lastName: '',
      });
    };


      if (loading) {
        return <div>Loading...</div>;
      }


      return (
        <div>
          <form id="confirmationCert" onSubmit={handleCreateAppointment}>
          <div className="purpose card mb-4">
            <div className="card-body">
              <h5 className="card-title">Who is the Appointment For?</h5>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button type="button" className={appointmentPurpose === 'personal' ? 'btn btn-primary' : 'btn btn-outline-primary'} onClick={handlePersonalClick}>
                    Personal
                  </button>
                  <button type="button" className={appointmentPurpose === 'others' ? 'btn btn-primary' : 'btn btn-outline-primary'} onClick={handleOthersClick}>
                    Others
                  </button>
                </div>
             </div>
          </div>

            {showAuthorization && (
            <div className='authorization card mb-4'>
              <div className='card-body'>
                <h5 className='card-title'>Submit Authorization Letter</h5>
                <p>Submit an authorization letter with a clear image of the signature and a valid ID from the person on whose behalf you are making the appointment. Ensure all details are visible and legible.</p>
                <div className="d-flex align-items-center mb-3">
                  <input type="file" className="form-control me-2" id="formFile" required onChange={handleAuthorizationUpload}/>
                </div>
              </div>
            </div>
            )}
      
           
            <div className="userDetails card mb-4">
              <div className="card-body">
                <h5 className="card-title">User Details</h5>
                <div className="userOverview d-flex align-items-center mb-3">
                  <div className="container">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Selected Service</label>
                          <input type="text" className="form-control" id="selectedService" readOnly placeholder="Confirmation Certificate" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">User Name</label>
                          <input type="text" className="form-control" id="userName" readOnly defaultValue={`${userData?.firstName || ""} ${userData?.lastName || ""}`} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">User Contact</label>
                          <input type="text" className="form-control" id="userContact" readOnly defaultValue={userData?.contactNum || ""} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">User Email</label>
                          <input type="text" className="form-control" id="userEmail" readOnly defaultValue={userData?.email || ""} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="userDetails card mb-4">
              <div className="card-body">
                <h5 className="card-title">Refund Policy</h5>
                <p>{refundPolicy}</p> 
              </div>
            </div>
      
            
            <div className="submitReq card mb-4">
              <div className="card-body">
                <h5 className="card-title">Submit Requirements</h5>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" onChange={handleChange} value={formData.firstName || ''} required/>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" onChange={handleChange} value={formData.lastName || ''} required/>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="birthdayDate" className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" id="birthdayDate" name="birthdayDate" max={new Date().toISOString().split('T')[0]} onChange={handleChange} required/>
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

export default ConfirmationCertificate;

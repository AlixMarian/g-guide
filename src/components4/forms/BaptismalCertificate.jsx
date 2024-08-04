import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp, collection, addDoc, } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, storage } from '/backend/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

export const BaptismalCertificate = () => {
    const { churchId } = useParams();
    const [churchData, setChurchData] = useState(null);
    const [userData, setUserData] = useState(null); 
    const auth = getAuth();
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [paymentImageFile, setPaymentImageFile] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [paymentImageUrl, setPaymentImageUrl] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthday: '',
        fatherFirstName:'',
        fatherLastName:'',
        motherFirstName:'',
        motherLastName:'',
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

    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

    const handleUploadPayment = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentImageFile(file);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
    if (user && paymentImageFile){
        try {
            
                const storageRef = ref(storage, `userPaymentReceipt/${user.uid}/${paymentImageFile.name}`);
                await uploadBytes(storageRef, paymentImageFile);
                const fileUrl = await getDownloadURL(storageRef);
                setPaymentImageUrl(fileUrl);

                
            const appointmentData = {
              appointmentType: 'baptismalCertificate',
              appointmentStatus: 'pending',
              commonFields: {
                requesterId: user.uid,
                requesterName: fullName,
                requesterContact: userData.contactNum,
                requesterEmail: userData.email,
                dateOfRequest: Timestamp.fromDate(new Date()),
                paymentImage: fileUrl
              },
              baptismalCertficate: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthday: formData.birthday,
                fatherFirstName: formData.fatherFirstName,
                fatherLastName: formData.fatherLastName,
                motherFirstName: formData.motherFirstName,
                motherLastName: formData.motherLastName,
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
        resetForm();
    };

    const handleClear = () => {
        resetForm();
        toast.success('Form cleared');
    };

    const resetForm = () => {
        setFormData({
            brideFirstName: '',
            brideLastName: '',
            groomFirstName: '',
            groomLastName: '',
            marriageDate: ''
        });
        setPaymentImageFile(null);
        setPaymentImageUrl('');
    };

      if (loading) {
        return <div>Loading...</div>;
      }


      return (
        <div>
          <form className="baptismalCert">
      
           
            <div className="userDetails card mb-4">
              <div className="card-body">
                <h5 className="card-title">User Details</h5>
                <div className="userOverview d-flex align-items-center mb-3">
                  <div className="container">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Selected Service</label>
                          <input type="text" className="form-control" id="selectedService" readOnly placeholder="Baptismal Certificate" />
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
      
            
            <div className="submitReq card mb-4">
              <div className="card-body">
                <h5 className="card-title">Submit Requirements</h5>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" onChange={handleChange} required/>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" onChange={handleChange} required/>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="birthday" className="form-label">Birthday</label>
                  <input type="date" className="form-control" id="birthday" name="birthday" onChange={handleChange} required/>
                </div>
                <div><b>Father</b></div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="fatherFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="fatherFirstName" name="fatherFirstName" onChange={handleChange} required/>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="fatherLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="fatherLastName" name="fatherLastName" onChange={handleChange} required/>
                  </div>
                </div>
                <div><b>Mother</b></div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="motherFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="motherFirstName" name="motherFirstName" onChange={handleChange} required/>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="motherLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="motherLastName" name="motherLastName" onChange={handleChange} required/>
                  </div>
                </div>
                
              </div>
            </div>
      
           
            <div className="submitPayment card mb-4">
              <div className="card-body">
                <h5 className="card-title">Submit Payment</h5>
                {churchData && churchData.churchQRDetail && churchData.churchInstruction && (
                  <div>
                    <p>{churchData.churchInstruction}</p>
                    <img src={churchData.churchQRDetail} alt="Church QR Code" className="qr-image mx-auto d-block" />
                  </div>
                )}
                <br />
                <label><strong>Submit your receipt here</strong></label>
                <div className="d-flex align-items-center mb-3">
                  <input type="file" className="form-control me-2" id="formFile" required onChange={handleUploadPayment}/>
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2" onClick={handleSubmit}>Submit</button>
                  <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
                </div>
              </div>
            </div>
      
          </form>
        </div>
      );
      
};

export default BaptismalCertificate;
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "/backend/firebase";
import '../websiteUser.css';

export const SignUpCoord = () => {
  const handleSEA = (event) => {
    event.preventDefault();
    navigate('/SEA');
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    contactNum: "",
    dataConsent: false,
    churchName: "",
    churchAddress: "",
    churchEmail: "",
    churchContactNum: "",
    churchProof: null,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: type === "checkbox" ? checked : type === "file" ? files[0] : value, // Handle file input
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.dataConsent) {
      toast.error('Agree to data consent to proceed');
      return;
    }
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      // Upload churchProof to Firebase Storage
      let churchProofURL = '';
      if (formData.churchProof) {
        const proofRef = ref(storage, `churchVerification/${user.uid}`);
        await uploadBytes(proofRef, formData.churchProof);
        churchProofURL = await getDownloadURL(proofRef);
      }

      let churchQRDetailURL = '';
      if (formData.churchQRDetail) {
        const qrRef = ref(storage, `churchQRs/${user.uid}`);
        await uploadBytes(qrRef, formData.churchQRDetail);
        churchQRDetailURL = await getDownloadURL(qrRef);
      }

      // Save user details to Firestore (user collection)
      await setDoc(doc(db, 'users', user.uid), {
        lastName: formData.lastName,
        firstName: formData.firstName,
        contactNum: formData.contactNum,
        email: formData.email,
        dataConsent: formData.dataConsent,
        role: 'churchCoor',
        profileImage: 'https://firebasestorage.googleapis.com/v0/b/g-guide-1368b.appspot.com/o/default%2FuserIcon.png?alt=media&token=11e94d91-bf29-4e3e-ab98-a723fead69bc',
      });

      // Save church details to Firestore (church collection)
      await setDoc(doc(db, 'church', user.uid), {
        churchName: formData.churchName,
        churchAddress: formData.churchAddress,
        churchEmail: formData.churchEmail,
        churchContactNum: formData.churchContactNum,
        churchProof: churchProofURL,
        churchRegistrationDate: user.metadata.creationTime,
        churchStartTime: 'none',
        churchEndTime: 'none',
        churchHistory: 'none',
        churchQRDetail: churchQRDetailURL,
        churchStatus: 'pending',
      });
    toast.success('Your registration is being processed by the admin');
    navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="coord-signup-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="siteBanner" className="text-center">
              <img src="../src/assets/signUpCoordBanner.png" className="img-fluid" alt="Site Banner" />
            </div>
          </div>

          <div className="col-lg-6">
          <form className=" churchInformation" onSubmit={handleSubmit}>
            <div className="row g-3 accountHandler">
              <h3>Account Handler</h3>
              
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="contactNum" className="form-label">Contact Number</label>
                  <input
                  type="text"
                  className="form-control"
                  id="contactNum"
                  value={formData.contactNum}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="emailAddress" className="form-label">Email Address</label>
                  <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                </div>
              
            </div>
            
            <br/>

            <div className="col-12">
              <div className="row g-3 churchInformation">
                <h3>Church Information</h3>
                
                  <div className="col-12">
                    <label htmlFor="inputChurchName" className="form-label">Church Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="churchName"
                      value={formData.churchName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputChurchAdd" className="form-label">Church Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="churchAddress"
                      value={formData.churchAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="inputChurchEmail" className="form-label">Church Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="churchEmail"
                      value={formData.churchEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="inputChurchContactNum" className="form-label">Church Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="churchContactNum"
                      value={formData.churchContactNum}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputVerification" className="form-label">Proof of Church Affiliation</label>
                    <input
                      type="file"
                      className="form-control"
                      id="churchProof"
                      accept="image, .doc, .docx, .pdf"
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputVerification" className="form-label">G-Gash or Bank QR</label>
                    <input
                      type="file"
                      className="form-control"
                      id="churchQRDetail"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>
                
              </div>
            </div>

          <br/>
            <div className="col-12">
              <div className="form-check">
              <input
                      type="checkbox"
                      className="form-check-input"
                      id="dataConsent"
                      checked={formData.dataConsent}
                      onChange={handleChange}
                    />
                <label className="form-check-label" htmlFor="dataConsent">
                  <b>Data Consent</b>
                </label>
              </div>
            </div>

            <div className="col-12 d-flex flex-column align-items-center">
              <div className="d-flex justify-content-center gap-2 mb-2">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary">Sign Up</button>
              </div>
              <div className="w-100 text-center">
                <button type="button" className="btn btn-primary" onClick={handleSEA}>Shortcut to churchCoordinator</button>
              </div>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpCoord;

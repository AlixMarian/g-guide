import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';
import { toast } from 'react-toastify';
import useChatbot from './Chatbot';


const SignUp = () => {
  useChatbot();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    contactNum: '',
    dataConsent: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: type === 'checkbox' ? checked : value,
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

      try {
        await sendEmailVerification(user);
        // Save user details to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          lastName: formData.lastName,
          firstName: formData.firstName,
          contactNum: formData.contactNum,
          email: formData.email,
          dataConsent: formData.dataConsent,
          role: 'websiteUser',
          profileImage: 'https://firebasestorage.googleapis.com/v0/b/g-guide-1368b.appspot.com/o/default%2FuserIcon.png?alt=media&token=11e94d91-bf29-4e3e-ab98-a723fead69bc',
        });

        toast.success('Please check your email for verification');
        navigate('/login');
      } catch {
        toast.error('Unable to send email');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User signed in:', user);
      } else {
        console.log('No user signed in.');
      }
    });
  }, []);

  const handleSignUpAsCoord = (event) => {
    event.preventDefault();
    navigate('/signup-coord');
  };

  return (
    <div className="signup-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="siteBanner" className="text-center">
              <img src="../src/assets/Left Side Designs.png" className="img-fluid" alt="Site Banner" />
            </div>
          </div>

          <div className="col-lg-6">
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
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
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
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
                <label htmlFor="contactNum" className="form-label">
                  Contact Number
                </label>
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
                <label htmlFor="emailAddress" className="form-label">
                  Email Address
                </label>
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
                <label htmlFor="password" className="form-label">
                  Password
                </label>
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
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

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

              <div className="col-12 d-flex justify-content-center gap-2">
                <button type="reset" className="btn btn-outline-primary">
                  Clear Form
                </button>
                <button type="submit" className="btn btn-primary">
                  Sign Up
                </button>
              </div>

              <div className="col-12 d-flex justify-content-center mt-3">
                <button type="button" className="btn btn-primary" onClick={handleSignUpAsCoord}>
                  Sign Up As Church Coordinator
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

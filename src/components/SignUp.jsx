import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';
import { toast } from 'react-toastify';
import useChatbot from './Chatbot';
import { Modal} from 'react-bootstrap';


export const SignUp = () => {
  useChatbot();
  const [showDataConsentModal, setShowDataConsentModal] = useState(false);

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

  const handleRegister = async (e) => {
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

      try {
        const webVisitorDocRef = doc(collection(db, 'websiteVisitor')); 
        console.log('Generated webVisitorDocRef ID:', webVisitorDocRef.id);

        await setDoc(webVisitorDocRef, {
          userId: user.uid,
        });
      } catch (visitorError) {
        console.error('Error storing website visitor data:', visitorError);
        toast.error('Unable to store visitor data: ' + visitorError.message);
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

  const handleShowDataConsentModal = () => setShowDataConsentModal(true);
  const handleCloseDataConsentModal = () => setShowDataConsentModal(false);

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
            <form className="row g-3" onSubmit={handleRegister}>
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
                  <label className="form-check-label" htmlFor="dataConsent" >
                    <b>I agree to the 
                      <label className='form-check-label ms-1'onClick={handleShowDataConsentModal} style={{ color: 'blue' }}> G! Guide Data Privacy Policy</label> 
                    </b>
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

      <Modal show={showDataConsentModal} onHide={handleCloseDataConsentModal}>
        <Modal.Header closeButton>
          <Modal.Title>G! Guide Data Privacy Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Welcome to G! Guide. Your privacy is of utmost importance to us. This policy outlines the types of personal information we collect and how we use and store it.</p>
          <h5>1. Information We Collect</h5>
          <p><strong>1.1 Personal Information:</strong> When you sign up for G! Guide, we collect the following:</p>
          <ul className='ms-5'>
            <li>First and Last Name</li>
            <li>Contact Number</li>
            <li>Email Address</li>
          </ul>
          <p><strong>1.2 Booking Information:</strong> If you book a church service or request church documents on behalf of another person, we collect:</p>
          <ul className='ms-5'>
            <li>Authorization letter containing a clear image of the signature and any valid ID of the person authorizing you</li>
          </ul>
          <h5>2. How We Use Your Information</h5>
          <p>The information we collect is used to:</p>
          <ul className='ms-5'>
            <li>Create and manage your account</li>
            <li>Facilitate church service bookings and document requests</li>
            <li>Communicate with you regarding your bookings and services</li>
            <li>Guarantee that you have the necessary authority to book a service using another person’s details</li>
          </ul>
          <h5>Changes to This Policy</h5>
          <p>We may update this privacy policy from time to time. Any changes will be posted on this page, and we will notify you via email or through our app.</p>
          <h5>Contact Us</h5>
          <p>If you have any questions or concerns about this privacy policy or our data practices, please contact us at <b>g!guide@gmail.com</b>.</p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SignUp;

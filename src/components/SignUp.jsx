import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../websiteUser.css';

export const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    contactNum: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    dataConsent: false,
  });
  const [message, setMessage] = useState('');
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Basic form validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    try {
      console.log('Submitting form data:', formData); // Log form data for debugging
      const response = await axios.post('http://localhost:3006/signup', {
        fullName: formData.fullName,
        contactNum: formData.contactNum,
        emailAddress: formData.emailAddress,
        password: formData.password,
        dataConsent: formData.dataConsent,
      });
  
      console.log('Response from server:', response); // Log server response
      if (response.status === 200) {
        navigate('/login');
        setMessage(response.data.message);
        toast.success('Check your gmail account for verification process');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      alert(`Sign-up failed. Please try again later. ${error.response ? error.response.data.details : error.message}`);
    }
  };

  
  

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
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input type="text" className="form-control" id="lastName" value={formData.lastName} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input type="text" className="form-control" id="firstName" value={formData.firstName} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label htmlFor="contactNum" className="form-label">Contact Number</label>
                <input type="text" className="form-control" id="contactNum" value={formData.contactNum} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label htmlFor="emailAddress" className="form-label">Email Address</label>
                <input type="email" className="form-control" id="emailAddress" value={formData.emailAddress} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" value={formData.password} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="dataConsent" checked={formData.dataConsent} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="dataConsent">
                    Data Consent
                  </label>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-center gap-2">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary">Sign Up</button>
              </div>

              <div className="col-12 d-flex justify-content-center mt-3">
                <button type="button" className="btn btn-primary" onClick={handleSignUpAsCoord}>Sign Up As Church Coordinator</button>
              </div>
            </form>
            {message && <p className="mt-3">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
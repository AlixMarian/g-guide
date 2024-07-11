import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../custom.css';

export const SignUpCoord = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    contactNum: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    dataConsent: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSEA = (event) => {
    event.preventDefault();
    navigate('/SEA');
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
        navigate('/homepage');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      alert(`Sign-up failed. Please try again later. ${error.response ? error.response.data.details : error.message}`);
    }
  };

  return (
    <div className="signup-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="siteBanner" className="text-center">
              <img src="../src/assets/signUpCoordBanner.png" className="img-fluid" alt="Site Banner" />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="accountHandler">
              <h3>Account Handler</h3>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                  <label htmlFor="inputFullName" className="form-label">Full Name</label>
                  <input type="text" className="form-control" id="fullName" value={formData.fullName} onChange={handleChange} />
                  </div>

                <div className="col-md-6">
                  <label htmlFor="inputContactNum" className="form-label">Contact Number</label>
                  <input type="text" className="form-control" id="contactNum" value={formData.contactNum} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <label htmlFor="inputEmailAddress" className="form-label">Email Address</label>
                  <input type="email" className="form-control" id="emailAddress" value={formData.emailAddress} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputPassword" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" value={formData.password} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputConfirmPass" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                </div>

                <div className="churchInformation">
                    <br></br>
                    <h3>Church Information</h3>

                <form className="row g-3">
                <div className="col-12">
                  <label htmlFor="inputChurchName" className="form-label">Church Name</label>
                  <input type="email" className="form-control" id="inputChurchName" />
                </div>

                <div className="col-12">
                  <label htmlFor="inputChurchAdd" className="form-label">Church Address</label>
                  <input type="email" className="form-control" id="inputChurchAdd" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputChurchEmail" className="form-label">Church Email Address</label>
                  <input type="text" className="form-control" id="inputChurchEmail" />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputChurchContactNum" className="form-label">Church Contact Number</label>
                  <input type="text" className="form-control" id="inputChurchContactNum" />
                </div>
                </form>
                
                </div>

            <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gridCheck" />
                    <label className="form-check-label" htmlFor="gridCheck">
                      Data Consent
                    </label>
                  </div>
                </div>
            
             <button type="reset" className="btn btn-primary">Upload Proof of Affiliation</button>

            <div className="col-12 d-flex justify-content-center gap-2">
              <button type="reset" className="btn btn-outline-primary">Clear Form</button>
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleSEA}>Sign Up As Church Coordinator</button>
              </form>
            </div>

            

          </div>
        </div>
      </div>
    </div>
  );
};

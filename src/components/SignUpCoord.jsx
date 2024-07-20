import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../custom.css';

export const SignUpCoord = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    contactNum: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    churchName: '',
    churchAddress: '',
    churchEmail: '',
    churchContactNum: '',
    dataConsent: false,
  });

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
      const response = await axios.post('http://localhost:3006/signup', formData);

      console.log('Response from server:', response); // Log server response
      if (response.status === 200) {
        navigate('/homepage');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      alert(`Sign-up failed. Please try again later. ${error.response ? error.response.data.details : error.message}`);
    }
  };

  const handleSEA = (event) => {
    event.preventDefault();
    navigate('/SEA');
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
                  <h3>Church Information</h3>
                </div>

                <div className="col-12">
                  <label htmlFor="inputChurchName" className="form-label">Church Name</label>
                  <input type="text" className="form-control" id="churchName" value={formData.churchName} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <label htmlFor="inputChurchAdd" className="form-label">Church Address</label>
                  <input type="text" className="form-control" id="churchAddress" value={formData.churchAddress} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputChurchEmail" className="form-label">Church Email Address</label>
                  <input type="email" className="form-control" id="churchEmail" value={formData.churchEmail} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label htmlFor="inputChurchContactNum" className="form-label">Church Contact Number</label>
                  <input type="text" className="form-control" id="churchContactNum" value={formData.churchContactNum} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="dataConsent" checked={formData.dataConsent} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="dataConsent">
                      Data Consent
                    </label>
                  </div>
                </div>

                <div className="col-12 d-flex flex-column align-items-center">
                  <div className="d-flex justify-content-center gap-2 mb-2">
                    <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                    <button type="submit" className="btn btn-primary">Sign Up</button>
                  </div>
                  <div className="w-100 text-center">
                    <button type="button" className="btn btn-primary" onClick={handleSEA}>Sign Up As Church Coordinator</button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpCoord;

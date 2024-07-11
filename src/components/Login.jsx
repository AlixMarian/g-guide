import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../custom.css';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailAddress: '',
    password: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3006/login', {
        emailAddress: formData.emailAddress,
        password: formData.password,
      });

      console.log('Response from server:', response); // Log server response
      if (response.status === 200) {
        navigate('/homepage');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(`Login failed. Please try again later. ${error.response ? error.response.data.details : error.message}`);
    }
  };

  return (
    <div className="loginContainer">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-4 col-md-6">
            <div className="text-center mb-4">
              <img src="../src/assets/gGuideLogo.svg" alt="G! Guide Logo" className="img-fluid" width="100" />
            </div>
            <div className="card shadow-sm p-4">
              <h2 className="text-center mb-4">Sign In</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="emailAddress" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
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
                <div className="d-grid">
                  <button type="submit" className="btn btn-custom-primary">Sign In</button>
                </div>
              </form>
              <div className="text-center mt-3">
                <a href="/forgot-password" className="text-decoration-none">Forgot Password?</a>
              </div>
              <div className="text-center mt-2">
                <span>No account? <a href="/signup" className="text-decoration-none">Sign Up</a></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
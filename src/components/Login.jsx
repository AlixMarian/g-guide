import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';
import { signInWithGoogle } from '../../backend/googleAuth'; // Updated import path

export const Login = () => {
  const navigate = useNavigate();
  
  const handleBackToHomepage = () => {
    navigate('/homepage');
  };

  const handleGoogleLogin = () => {
    signInWithGoogle()
      .then((result) => {
        // Successful login, navigate to homepage or wherever needed
        navigate('/homepage');
      })
      .catch((error) => {
        // Handle Errors here.
        console.error(error);
      });
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
              <form>
                <div className="mb-3">
                  <label htmlFor="emailAddress" className="form-label">Email</label>
                  <input type="email" className="form-control" id="emailAddress" />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-custom-primary" onClick={handleBackToHomepage}>Sign In</button>
                </div>
              </form>
              <div className="text-center mt-3">
                <a href="/forgot-password" className="text-decoration-none">Forgot Password?</a>
              </div>
              <div className="text-center mt-2">
                <span>No account? <a href="/signup" className="text-decoration-none">Sign Up</a></span>
              </div>
              <br />
              <div className="d-grid">
                <button id="google-login-btn" className="btn btn-custom-primary" onClick={handleGoogleLogin}>
                  Login with <i className="fab fa-google"></i> 
                </button>
              </div>
              <div className="text-center mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

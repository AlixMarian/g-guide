import { useNavigate } from 'react-router-dom';
import '../custom.css';

export const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/homepage');
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
                  <label htmlFor="inputEmail" className="form-label">Email</label>
                  <input type="email" className="form-control" id="inputEmail" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="inputPassword" className="form-label">Password</label>
                  <input type="password" className="form-control" id="inputPassword" required />
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
}

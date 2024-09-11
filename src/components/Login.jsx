import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import '../websiteUser.css';
import {signInWithGoogle} from '/backend/googleAuth';
import useChatbot from './Chatbot';


export const Login = () => {
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  useChatbot();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        const userId = user.uid;

        
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            toast.error('User details not found.');
            return;
        }

        
        const coordinatorQuery = query(collection(db, 'coordinator'), where('userId', '==', userId));
        const adminQuery = query(collection(db, 'admin'), where('userId', '==', userId));
        const websiteVisitorQuery = query(collection(db, 'websiteVisitor'), where('userId', '==', userId));

        const [coordinatorSnapshot, adminSnapshot, websiteVisitorSnapshot] = await Promise.all([
            getDocs(coordinatorQuery),
            getDocs(adminQuery),
            getDocs(websiteVisitorQuery),
        ]);

        
        const churchDoc = await getDoc(doc(db, 'church', userId));

        if (!websiteVisitorSnapshot.empty) {
          const visitorData = websiteVisitorSnapshot.docs[0].data();
          if (visitorData.status === 'active') {
              toast.success('Welcome to G! Guide');
              navigate('/homepage');
          } else {
              toast.error('Your account is not active. Please contact support.');
          }
          return;
        }

        if (!coordinatorSnapshot.empty) {
            if (churchDoc.exists()) {
                const churchData = churchDoc.data();
                if (churchData.churchStatus === 'approved') {
                    toast.success('Welcome to G! Guide');
                    navigate('/SEA');
                    return;
                } else if (churchData.churchStatus === 'pending') {
                    toast.error('Your church registration is not yet approved. Please wait for admin approval.');
                    return;
                } else {
                    toast.error('Your church registration has been denied');
                    return;
                }
            } else {
                toast.error('Church details not found.');
                return;
            }
        }

        if (!adminSnapshot.empty) {
            toast.success('Welcome to G! Guide');
            navigate('/systemAdminDashboard');
            return;
        }

        toast.error('Invalid user role.');
    } catch (error) {
        toast.error(error.message);
    }
};



  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in.");
      }
    });
  }, []);


  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
  
      if (user) {
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
  
        if (userDoc.exists()) {
          
          const userData = userDoc.data();
          const role = userData.role;
  
          switch (role) {
            case "websiteUser":
              navigate('/homepage');
              toast.success("Welcome to G! Guide");
              break;
            case "churchCoor":
              navigate('/SEA');
              toast.success("Welcome to G! Guide");
              break;
            case "sysAdmin":
              navigate('/systemAdminDashboard');
              toast.success("Welcome to G! Guide");
              break;
            default:
              navigate('/login');
              break;
          }
        } else {
          
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "websiteUser"
          });
          navigate('/homepage');
          toast.success("Welcome to G! Guide");
        }
      } else {
        throw new Error("User not authenticated.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google.");
    }
  };
  
  const handlePasswordReset = async () => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent!');
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to send password reset email: ' + error.message);
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
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="emailAddress" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" value={formData.password} onChange={handleChange} required/>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-custom-primary">Sign In</button>
                </div>
              </form>
              <br />
              <p style={{ textAlign: 'center' }}>
                <span style={{ borderBottom: '1px solid black', padding: '0 10px' }}>Or</span>
              </p>

              <div className="d-grid">
                <button id="google-login-btn" className="btn btn-custom-primary" onClick={handleGoogleLogin}>
                  Sign in with <i className="fab fa-google"></i> 
                </button>
              </div>
              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none" onClick={() => setShowModal(true)}>Forgot Password?</a>
              </div>
              <div className="text-center mt-2">
                <span>No account? <a href="/signup" className="text-decoration-none">Sign Up</a></span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="resetEmail" className="form-label">Enter your email address</label>
            <input 
              type="email" 
              className="form-control" 
              id="resetEmail" 
              value={resetEmail} 
              onChange={(e) => setResetEmail(e.target.value)} 
              required 
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handlePasswordReset}>
            Send Password Reset Link
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;

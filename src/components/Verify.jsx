import { useEffect } from 'react';
import { getAuth, applyActionCode } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const actionCode = urlParams.get('oobCode');
    const auth = getAuth();

    if (actionCode) {
      applyActionCode(auth, actionCode)
        .then(() => {
          toast.success("Email verified successfully!");
          navigate('/login'); // Redirect to login page after verification
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  }, [navigate]);

  return (
    <div>
      <ToastContainer />
      <h1>Verifying your email...</h1>
    </div>
  );
};

export default Verify;

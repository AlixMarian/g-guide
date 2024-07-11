import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Verify = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.get(`http://localhost:3006/verify/${token}`)
        .then(response => {
          if (response.data.success) {
            setMessage('Email verified successfully. Redirecting to login...');
            toast.success('Email verified. Welcome to G! Guide');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else {
            setMessage('Verification failed.');
          }
        })
        .catch(error => {
          setMessage('An error occurred. Please try again.');
          console.error('Error verifying email:', error);
        });
    }
  }, [token, navigate]);

  return (
    <div>
      <h2>{message}</h2>
    </div>
  );
};

export default Verify;

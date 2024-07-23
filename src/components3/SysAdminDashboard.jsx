import { useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from 'react-toastify';

const SysAdminDashboard = () => {
    const navigate = useNavigate();

    const handlePendingChurch = () =>{
        navigate('/pending-church');
    }

    const handleSysAdminAccSttngs = () => {
        navigate('/sys-account');
      };

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log("User signed in:", user);
          } else {
            console.log("No user signed in.");
            navigate('/login');
          }
        });
    }, [navigate]);

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
          .then(() => {
            toast.success("Sign Out Sucessfull");
            navigate('/login');
          })
          .catch((error) => {
            toast.error(error.message);
          });
    };


    return (
        <div>
            SysAdminDashboard

            <button type="button" className="btn btn-primary" onClick={handlePendingChurch}>Pending Churches</button>
            <button type="button" className="btn btn-success" onClick={handleSysAdminAccSttngs}>Pending Churches</button>
            <button type="button" className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>

    )
}

export default SysAdminDashboard;
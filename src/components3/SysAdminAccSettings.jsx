import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, updatePassword} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../websiteUser.css';

export const SysAdminAccSettings = () => {
  const [userData, setUserData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [newUserInfo, setNewUserInfo] = useState({});
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            toast.error("User data not found");
          }
        } catch (error) {
          toast.error("Error fetching user data");
        }
      } else {
        console.log("No user signed in.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleChangeProfilePic = (e) => {
    const { id, value, files } = e.target;
    if (id === "profileImage") {
      setImageFile(files[0]);
    } else {
      setUserData((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    }
  };

  const handleSubmitProfilePic = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && imageFile) {
      try {
        const storageRef = ref(storage, `profileImage/${user.uid}`);
        await uploadBytes(storageRef, imageFile);
        const profileImageUrl = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "users", user.uid), {
          profileImage: profileImageUrl,
        });

        toast.success("Profile picture updated successfully");
        setUserData((prevState) => ({
          ...prevState,
          profileImage: profileImageUrl,
        }));
        
      } catch (error) {
        toast.error("Error updating profile picture");
      }
      fileInputRef.current.value = "";
      setImageFile(null);
    }
    
    
  };

  const handleChangeUserInfo = (e) => {
    const { id, value } = e.target;
    setNewUserInfo((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmitNewInfo = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    
    if (newUserInfo.password && newUserInfo.password !== newUserInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (user) {
      try {
        const updatedUserInfo = { ...newUserInfo };
        delete updatedUserInfo.password;
        delete updatedUserInfo.confirmPassword;

        await updateDoc(doc(db, "users", user.uid), updatedUserInfo);

        if (newUserInfo.password) {
          await updatePassword(user, newUserInfo.password);
        }

        toast.success("User information updated successfully");
        setUserData((prevState) => ({
          ...prevState,
          ...updatedUserInfo,
        }));
      } catch (error) {
        toast.error("Error updating user information");
      }
    }
  };


  return (
    <div className="sysAdminAccsettings">
      <div className="sysAdminUserAccStngs-content">
        <div className="text-start">
          <h3>Modify Account Settings</h3>
        </div>
        
        
          <div className="row justify-content-center">

            <div className="col-lg-6 text-center mb-4">
            <form className="uploadProfilePic" onSubmit={handleSubmitProfilePic}>
              <img src={userData?.profileImage || "src/assets/userIcon.png"} className="img-thumbnail" alt="User Icon" />
              <div className="mb-3">
              <input
                  type="file"
                  className="form-control"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleChangeProfilePic}
                  ref={fileInputRef}
                  readOnly
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2">Upload Photo</button>
            </form>
            </div>
            

            <div className="col-12 col-lg-6">
              <form className="row g-3 changeUserInfo" onSubmit={handleSubmitNewInfo}>
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    defaultValue={userData?.lastName || ""}
                    onFocus={(e) => e.target.placeholder = ''}
                    onBlur={(e) => e.target.placeholder = userData?.lastName || "Loading..."}
                    onChange={handleChangeUserInfo}
                    placeholder={userData ? userData.lastName : "Loading..."}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    defaultValue={userData?.firstName || ""}
                    onFocus={(e) => e.target.placeholder = ''}
                    onBlur={(e) => e.target.placeholder = userData?.firstName || "Loading..."}
                    onChange={handleChangeUserInfo}
                    placeholder={userData ? userData.firstName : "Loading..."}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contactNum" className="form-label">Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contactNum"
                    defaultValue={userData?.contactNum || ""}
                    onFocus={(e) => e.target.placeholder = ''}
                    onBlur={(e) => e.target.placeholder = userData?.contactNum || "Loading..."}
                    onChange={handleChangeUserInfo}
                    placeholder={userData ? userData.contactNum : "Loading..."}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    defaultValue={userData?.email || ""}
                    onFocus={(e) => e.target.placeholder = ''}
                    onBlur={(e) => e.target.placeholder = userData?.email || "Loading..."}
                    onChange={handleChangeUserInfo}
                    placeholder={userData ? userData.email : "Loading..."}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">Change Password</label>
                  <input type="password" className="form-control" id="password" onChange={handleChangeUserInfo}/>
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmPassword" onChange={handleChangeUserInfo}/>
                </div>
                <div className="col-12 d-flex justify-content-between">
                  <button type="reset" className="btn btn-outline-primary">Reset</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>

          </div>
         
      </div>
    </div>
  );
}

export default SysAdminAccSettings;
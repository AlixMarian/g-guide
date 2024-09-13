import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "/backend/firebase";
import '../websiteUser.css';
import { Modal} from 'react-bootstrap';

export const SignUpCoord = () => {
  const [showDataConsentModal, setShowDataConsentModal] = useState(false);
  const [churchList, setChurchList] = useState([]);
  const [filteredChurchList, setFilteredChurchList] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false); // Dropdown visibility state
  const [searchInput, setSearchInput] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    contactNum: "",
    dataConsent: false,
    churchName: "",
    churchAddress: "",
    churchEmail: "",
    churchContactNum: "",
    churchProof: null,
  });
  const navigate = useNavigate();

    // Toggle dropdown visibility
    const toggleDropdown = () => {
      setDropdownVisible(!dropdownVisible);
    };
  
    // Fetch church names and locations from the churchLocation collection
    useEffect(() => {
      const fetchChurchData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'churchLocation'));
          const churches = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setChurchList(churches);
          setFilteredChurchList(churches); // Initialize filtered list
        } catch (error) {
          toast.error("Failed to fetch church data");
          console.error("Error fetching church locations:", error);
        }
      };

      fetchChurchData();
    }, []);

    const handleChange = (e) => {
      const { id, value, type, checked, files } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [id]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      }));
  
      // If the user selects a church from the dropdown, automatically set the church address
      if (id === "churchName") {
        const selectedChurch = churchList.find(church => church.churchName === value);
        if (selectedChurch) {
          setFormData((prevState) => ({
            ...prevState,
            churchAddress: selectedChurch.churchLocation,
          }));
        }
      }
    };

    // Filter churches based on input
    const filterFunction = (e) => {
      const searchValue = e.target.value.toLowerCase();
      setSearchInput(searchValue);

      const filteredChurches = churchList.filter((church) =>
        church.churchName.toLowerCase().includes(searchValue)
      );
      setFilteredChurchList(filteredChurches);
    };
    
  const handleRegister  = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.dataConsent) {
      toast.error('Agree to data consent to proceed');
      return;
    }
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      let churchProofURL = '';
      if (formData.churchProof) {
        const proofRef = ref(storage, `churchVerification/${user.uid}`);
        await uploadBytes(proofRef, formData.churchProof);
        churchProofURL = await getDownloadURL(proofRef);
      }

      let churchQRDetailURL = '';
      if (formData.churchQRDetail) {
        const qrRef = ref(storage, `churchQRs/${user.uid}`);
        await uploadBytes(qrRef, formData.churchQRDetail);
        churchQRDetailURL = await getDownloadURL(qrRef);
      }

      // Save user information in the users collection
      await setDoc(doc(db, 'users', user.uid), {
        lastName: formData.lastName,
        firstName: formData.firstName,
        contactNum: formData.contactNum,
        email: formData.email,
        dataConsent: formData.dataConsent,
        role: 'churchCoor',
        profileImage: 'https://firebasestorage.googleapis.com/v0/b/g-guide-1368b.appspot.com/o/default%2FuserIcon.png?alt=media&token=11e94d91-bf29-4e3e-ab98-a723fead69bc',
      });

      // Create a document in the 'coordinator' collection and get its ID
      const churchCoorDocRef = doc(collection(db, 'coordinator')); 
      const coordinatorID = churchCoorDocRef.id;

      await setDoc(churchCoorDocRef, {
        userId: user.uid,
        status: 'pending',
      });

      // Generate a unique document ID for the church collection
      const churchDocRef = doc(collection(db, 'church'));
      //const churchID = churchDocRef.id;

      // Save church details in the church collection with unique churchID and linked coordinatorID
      await setDoc(churchDocRef, {
        churchName: formData.churchName,
        churchAddress: formData.churchAddress,
        churchEmail: formData.churchEmail,
        churchContactNum: formData.churchContactNum,
        churchProof: churchProofURL,
        churchRegistrationDate: new Date().toISOString(),
        churchStartTime: 'none',
        churchEndTime: 'none',
        churchHistory: 'none',
        churchQRDetail: churchQRDetailURL,
        churchInstruction: formData.churchInstruction || 'none',
        churchStatus: 'pending',
        coordinatorID: coordinatorID,  // Linking the coordinator ID here
      });

      toast.success('Your registration is being processed by the admin');
      navigate('/login');

    }catch (error) {
      toast.error(error.message);
    }
  };

  const handleShowDataConsentModal = () => setShowDataConsentModal(true);
  const handleCloseDataConsentModal = () => setShowDataConsentModal(false);
  
  return (
    <div className="coord-signup-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="siteBanner" className="text-center">
              <img src="../src/assets/signUpCoordBanner.png" className="img-fluid" alt="Site Banner" />
            </div>
          </div>

          <div className="col-lg-6">
          <form className=" churchInformation" onSubmit={handleRegister}>
            <div className="row g-3 accountHandler">
              <h3>Account Handler</h3>
              
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="contactNum" className="form-label">Contact Number</label>
                  <input
                  type="text"
                  className="form-control"
                  id="contactNum"
                  value={formData.contactNum}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
                  <label htmlFor="emailAddress" className="form-label">Email Address</label>
                  <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                </div>

                <div className="col-md-6">
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

                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                </div>
              
            </div>
            
            <br/>

            <div className="col-12">
              <div className="row g-3 churchInformation">
                <h3>Church Information</h3>
                
                <div className="col-12">
                <label htmlFor="churchName" className="form-label">Church Name</label>
                <div className="dropdown">
                  <button onClick={toggleDropdown} className="dropbtn">
                    {searchInput || "Select Church"}
                  </button>

                  {dropdownVisible && (
                    <div id="myDropdown" className="dropdown-content show">
                      <input
                        type="text"
                        placeholder="Search..."
                        id="myInput"
                        value={searchInput}
                        onChange={filterFunction}
                      />

                      {filteredChurchList.map((church) => (
                        <a
                          key={church.id}
                          href="#!"
                          onClick={() => {
                            setFormData((prevState) => ({
                              ...prevState,
                              churchName: church.churchName, // Set selected church name
                              churchAddress: church.churchLocation, // Set the corresponding church address
                            }));
                            setSearchInput(church.churchName); // Display the selected church name in the input
                            setDropdownVisible(false); // Hide dropdown after selection
                          }}
                        >
                          {church.churchName}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                  </div>

                  <div className="col-12">
                    <label htmlFor="churchAddress" className="form-label">Church Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="churchAddress"
                      value={formData.churchAddress}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="inputChurchEmail" className="form-label">Church Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="churchEmail"
                      value={formData.churchEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="inputChurchContactNum" className="form-label">Church Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="churchContactNum"
                      value={formData.churchContactNum}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputVerification" className="form-label">Proof of Church Affiliation</label>
                    <input
                      type="file"
                      className="form-control"
                      id="churchProof"
                      accept="image, .doc, .docx, .pdf"
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputVerification" className="form-label">G-Gash or Bank QR</label>
                    <input
                      type="file"
                      className="form-control"
                      id="churchQRDetail"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputRefundPolicy" className="form-label">Refund Policy</label>
                    <input
                      type="text"
                      className="form-control"
                      id="refundPolicy"
                      value={formData.churchInstruction}
                      onChange={handleChange}
                      placeholder='Please enter refund policy here.'
                      required
                    />
                  </div>
                
              </div>
            </div>

          <br/>
            <div className="col-12">
              <div className="form-check">
              <input
                      type="checkbox"
                      className="form-check-input"
                      id="dataConsent"
                      checked={formData.dataConsent}
                      onChange={handleChange}
                    />
                <label className="form-check-label" htmlFor="dataConsent" >
                    <b>I agree to the 
                      <label className='form-check-label ms-1'onClick={handleShowDataConsentModal} style={{ color: 'blue' }}> G! Guide Data Privacy Policy</label> 
                    </b>
                </label>
              </div>
            </div>

            <div className="col-12 d-flex flex-column align-items-center mt-3">
            <div className="d-flex justify-content-center gap-2 mb-2">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary">Sign Up</button>
              </div>
            </div>
            </form>
          </div>
        </div>
      </div>
      <Modal show={showDataConsentModal} onHide={handleCloseDataConsentModal}>
        <Modal.Header closeButton>
          <Modal.Title>G! Guide Data Privacy Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Welcome to G! Guide. As a church coordinator, your role is vital in managing church services and overseeing bookings from our website users. This policy outlines the types of information we collect from you and how we use and store it.</p>
          <h5>1. Information We Collect</h5>
          <p>Upon registration, we collect:</p>
          <p><b>Account Handler Information</b></p>
          <ul className='ms-5'>
            <li>First Name</li>
            <li>Last Name</li>
            <li>Contact Number</li>
            <li>Email Address</li>
          </ul>
          <p><b>Church Information</b></p>
          <ul className='ms-5'>
            <li>Church Name</li>
            <li>Church Address</li>
            <li>Church Email Address</li>
            <li>Church Contact Number</li>
            <li>Proof of Affiliation</li>
            <li>G-Cash or Bank QR Image</li>
            <li>Instructions for Service Transactions</li>
          </ul>
          <h5>2. How We Use Your Information</h5>
          <p>The information we collect is used to:</p>
          <ul className='ms-5'>
            <li>Create and manage your coordinator account</li>
            <li>Facilitate the management of church services and bookings</li>
            <li>Verify your affiliation with the church</li>
            <li>Communicate with you regarding your responsibilities and our services</li>
            <li>Process transactions related to church services</li>
          </ul>
          <h5>Changes to This Policy</h5>
          <p>We may update this privacy policy from time to time. Any changes will be posted on this page, and we will notify you via email or through our app.</p>
          <h5>Contact Us</h5>
          <p>If you have any questions or concerns about this privacy policy or our data practices, please contact us at <b>g!guide@gmail.com</b>.</p>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default SignUpCoord;

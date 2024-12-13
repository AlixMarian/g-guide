import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "/backend/firebase";
import '../websiteUser.css';
import { Modal} from 'react-bootstrap';

export const SignUpCoord = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDataConsentModal, setShowDataConsentModal] = useState(false);
  const [churchList, setChurchList] = useState([]);
  const [filteredChurchList, setFilteredChurchList] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false); // Dropdown visibility state
  const [selectedChurchID, setSelectedChurchID] = useState(null); // Store the selected church ID
  const [searchInput, setSearchInput] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    contactNum: "",
    dataConsent: false,
    termsCondition: false,
    churchName: "",
    churchAddress: "",
    churchEmail: "",
    churchContactNum: "",
    churchProof: null,
  });
  const navigate = useNavigate();

  const handleRenewChurch = (event) => {
    event.preventDefault();
    navigate('/renew-church');
  };

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
    if (!formData.termsCondition) {
      toast.error('Agree to terms and condition to proceed');
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
        termsCondition:formData.termsCondition,
        role: 'churchCoor',
        profileImage: 'https://firebasestorage.googleapis.com/v0/b/g-guide-1368b.appspot.com/o/default%2FuserIcon.png?alt=media&token=11e94d91-bf29-4e3e-ab98-a723fead69bc',
        dateOfRegistration: Timestamp.now(),
      });

      // Create a document in the 'coordinator' collection and get its ID
      const churchCoorDocRef = doc(collection(db, 'coordinator')); 
      const coordinatorID = churchCoorDocRef.id;

      await setDoc(churchCoorDocRef, {
        userId: user.uid,
        status: 'Pending',
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
        refundPolicy:formData.churchRefundPolicy,
        churchStatus: 'Pending',
        coordinatorID: coordinatorID,  // Linking the coordinator ID here
        churchLocationID: selectedChurchID, // Save the selected churchLocation document ID
      });

      toast.success('Your registration is being processed by the admin');
      navigate('/login');

    }catch (error) {
      toast.error(error.message);
    }
  };

  const handleShowDataConsentModal = () => setShowDataConsentModal(true);
  const handleCloseDataConsentModal = () => setShowDataConsentModal(false);

  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleCloseTermsModal = () => setShowTermsModal(false);
  
  return (
    <div className="coord-signup-container">
      <div className="container">
        <div className="row align-items-center">
        <div className="col-lg-6 d-none d-lg-block">
          <div id="siteBanner" className="text-center d-flex flex-column justify-content-center align-items-center">
            <img src="../src/assets/signUpCoordBanner.png" className="img-fluid mb-3" alt="Site Banner" />
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
                    <div className="dropdownAddress">
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
                                setSelectedChurchID(church.id); // Set the selected church document ID
                                setDropdownVisible(false); // Hide dropdown after selection
                                console.log(`Selected Church ID: ${church.id}`); // Log the document ID
                              }}
                            >
                              {church.churchName}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <p>Cant find your church? Contact us at: <a href="mailto:g!guide@gmail.com">g!guide@gmail.com</a></p>
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
                    <label htmlFor="refundPolicy" className="form-label">Refund Policy</label>
                    <textarea
                      className="form-control"
                      id="churchRefundPolicy"
                      rows="6" // Adjust the number of rows as needed to provide a large enough space
                      value={formData.churchRefundPolicy}
                      onChange={handleChange}
                      placeholder="Please enter refund policy here."
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

            <div className="col-12">
              <div className="form-check">
              <input
                      type="checkbox"
                      className="form-check-input"
                      id="termsCondition"
                      checked={formData.termsCondition}
                      onChange={handleChange}
                    />
                <label className="form-check-label" htmlFor="termsCondition" >
                    <b>I agree to the 
                      <label className='form-check-label ms-1'onClick={handleShowTermsModal} style={{ color: 'blue' }}> G! Guide Terms and Conditions</label> 
                    </b>
                </label>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-center gap-5 mt-3">
              <button type="reset" className="btn btn-outline-primary">Clear Form</button>
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>
            
            <p style={{ textAlign: 'center' }}>
              <span style={{ borderBottom: '1px solid black', padding: '0 10px' }}><b>Or</b></span>
            </p>

            <div className="col-12 d-flex justify-content-center mt-3">
              <button type='button' className="btn btn-primary" style={{ width: '40%' }} onClick={handleRenewChurch}>Renew Church</button>
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
          <p>If you have any questions or concerns about this privacy policy or our data practices, please contact us at <a href="mailto:g!guide@gmail.com">g!guide@gmail.com</a></p>
        </Modal.Body>
      </Modal>

      <Modal show={showTermsModal} onHide={handleCloseTermsModal}>
        <Modal.Header closeButton>
          <Modal.Title>G! Guide Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Welcome to G! Guide! By signing up as a church coordinator, you agree to the terms and conditions outlined below. These terms define your responsibilities and the grounds upon which your account may be made inactive.</p>
          <h5>1. Acceptance of Terms</h5>
          <p>By registering as a church coordinator, you confirm that:</p>
          <ul className='ms-5'>
            <li>You are authorized by the church you represent to manage its activities on the G! Guide platform.</li>
            <li>You agree to provide accurate and up-to-date information.</li>
            <li>You will comply with these terms and any applicable laws.</li>
          </ul>
          <h5>2. Responsibilities of Church Coordinators</h5>
          <p>As a church coordinator, your responsibilities include:</p>
          <ul className='ms-5'>
            <li>Ensuring the accurate and timely management of church services and bookings.</li>
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>Adhering to ethical and professional standards in all interactions with users and the G! Guide system.</li>
            <li>Updating your church&apos;s information promptly in case of changes.</li>
          </ul>
          <h5>3. Grounds for Account Inactivation</h5>
          <p>G! Guide reserves the right to make a church coordinator’s account inactive under the following circumstances:</p>
          <ul className='ms-5'>
            <li><b>Inappropriate Behavior:</b> If the coordinator engages in harassment, fraudulent activities, unethical conduct, or any behavior deemed inappropriate by the system admin.</li>
            <li><b>Church-Initiated Requests:</b> If the church formally requests the inactivation of its coordinator&apos;s account for any reason.</li>
            <li><b>Violation of Terms:</b> Failure to comply with these terms, including the provision of inaccurate information or misuse of the platform.</li>
            <li><b>Non-Compliance with Guidelines:</b> Persistent failure to respond to user inquiries, manage bookings, or follow platform procedures.</li>
          </ul>
          <p>When an account is made inactive, the coordinator will be notified via email with the reason for inactivation. Appeals or inquiries can be directed to <a href="mailto:g!guide@gmail.com">g!guide@gmail.com</a>.</p>
          <h5>4. Contact Us</h5>
          <p>If you have any questions, concerns, or require support, please contact us at: <a href="mailto:g!guide@gmail.com">g!guide@gmail.com</a></p>
          

          <h5>5. Acknowledgment and Agreement</h5>
          <p>By proceeding with the sign-up, you acknowledge that you have read, understood, and agree to the terms and conditions outlined above.</p>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default SignUpCoord;

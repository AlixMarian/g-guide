import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc, Timestamp, setDoc} from "firebase/firestore";
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "/backend/firebase";
import '../websiteUser.css';
import { Modal} from 'react-bootstrap';


export const RenewChurch = () => {
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
      churchName: "",
      churchAddress: "",
      churchEmail: "",
      churchContactNum: "",
      churchProof: null,
    });
    
    // Toggle dropdown visibility
    const toggleDropdown = () => {
      setDropdownVisible(!dropdownVisible);
    };
    
    // Fetch church names and locations from the church collection where churchStatus is 'Archived'
    useEffect(() => {
      const fetchChurchData = async () => {
          try {
              const churchQuery = query(
                  collection(db, 'church'),
                  where('churchStatus', '==', 'Archived')
              );
              const churchSnapshot = await getDocs(churchQuery);

              // Fetch data for each church document found
              const churches = await Promise.all(
                  churchSnapshot.docs.map(async (churchDoc) => {
                      const churchData = churchDoc.data();
                      const churchLocationID = churchData.churchLocationID;

                      // Fetch the corresponding church location document
                      const churchLocationDoc = await getDoc(doc(db, 'churchLocation', churchLocationID));

                      if (churchLocationDoc.exists()) {
                          const churchLocationData = churchLocationDoc.data();
                          
                          // Combine church and churchLocation data
                          return {
                              id: churchDoc.id,
                              ...churchData,
                              churchLocation: churchLocationData.churchLocation, // Location details from churchLocation collection
                              churchName: churchLocationData.churchName // Name details from churchLocation collection
                          };
                      } else {
                          console.warn(`No church location found for ID: ${churchLocationID}`);
                          return null;
                      }
                  })
              );

              // Filter out any null entries (in case some church locations were not found)
              const filteredChurches = churches.filter(church => church !== null);
              setChurchList(filteredChurches);
              setFilteredChurchList(filteredChurches); // Initialize filtered list

          } catch (error) {
              toast.error("Failed to fetch church data");
              console.error("Error fetching church data:", error);
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
    try{
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      let churchProofURL = '';
      if (formData.churchProof) {
        const proofRef = ref(storage, `churchVerification/${user.uid}`);
        await uploadBytes(proofRef, formData.churchProof);
        churchProofURL = await getDownloadURL(proofRef);
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
        dateOfRegistration: Timestamp.now(),
      });

      // Create a document in the 'coordinator' collection and get its ID
      const churchCoorDocRef = doc(collection(db, 'coordinator')); 
      const coordinatorID = churchCoorDocRef.id;

      await setDoc(churchCoorDocRef, {
        userId: user.uid,
        status: 'Pending',
      });

      // Update the existing church document in the 'church' collection
      if (selectedChurchID) {
        const churchDocRef = doc(db, 'church', selectedChurchID);
        await setDoc(churchDocRef, {
          churchEmail: formData.churchEmail,
          churchContactNum: formData.churchContactNum,
          churchProof: churchProofURL,
          churchRegistrationDate: new Date().toISOString(),
          churchStatus: 'For Renewal',
          coordinatorID: coordinatorID,
        }, { merge: true }); // Merge to avoid overwriting other fields
      }

    toast.success('Church renewal request submitted successfully');

    }catch (error) {
      toast.error(error.message);
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

    const handleShowDataConsentModal = () => setShowDataConsentModal(true);
    const handleCloseDataConsentModal = () => setShowDataConsentModal(false);
    
  return (
    <div className="renew-container">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div id="renewalBanner" className="renewalBanner text-center">
              <img src="../src/assets/renewalBanner.png" className="img-fluid" alt="Renewal Form Banner" />
            </div>
          </div>

          <div className="col-lg-6">
            <form className='archivedChurch' onSubmit={handleRegister}>
              <div className='row g-3 selectChurch'>
                <h3>Renew Your Church</h3>
                <div className='col-12'>
                    <label htmlFor="churchName" className="form-label">Church Name from our Archive List</label>
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
                    <label htmlFor="inputVerification" className="form-label">Re-upload Proof of Church Affiliation</label>
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
              </div>

              <br/>

              <div className='col-12'>
                <div className='row g-3 newHandlerInfo'>
                  <h3>New Account Handler Information</h3>
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

              <div className="col-12 d-flex justify-content-center gap-5 mt-3">
                <button type="reset" className="btn btn-outline-primary">Clear Form</button>
                <button type="submit" className="btn btn-primary">Sign Up</button>
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
  )
}

export default RenewChurch
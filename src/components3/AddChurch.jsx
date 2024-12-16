import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';



const AddChurch = () => {
  const [formData, setFormData] = useState({
    churchLocation: '',
    churchName: '',
    latitude: '',
    longitude: ''
  });
  const [showInstructions, setShowInstructions] = useState(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    
    if (name === 'latitude' || name === 'longitude') {
      
      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.churchLocation || !formData.churchName || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all fields');
      return;
    }
    const numLatitude = parseFloat(formData.latitude);
    const numLongitude = parseFloat(formData.longitude);


    if (numLatitude < -90 || numLatitude > 90) {
      toast.error('Latitude must be between -90 and 90 degrees');
      return;
    }
    if (numLongitude < -180 || numLongitude > 180) {
      toast.error('Longitude must be between -180 and 180 degrees');
      return;
    }

    try {
      
      await addDoc(collection(db, 'churchLocation'), {
        churchLocation: formData.churchLocation,
        churchName: formData.churchName,
        latitude: numLatitude,
        longitude: numLongitude
      });

      toast.success('Church location added successfully!');
      
     
      setFormData({
        churchLocation: '',
        churchName: '',
        latitude: '',
        longitude: ''
      });
    } catch (error) {
      console.error('Error adding church location:', error);
      toast.error('Error adding church location');
    }
  };

  return (
    <>
    <h2 className= 'mt-2' style={{marginLeft: '4.5rem'}}>Add New Church Location</h2>
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', paddingLeft: '25px' }}>
      <div className="shadow-lg bg-white rounded-5 p-4" style={{ width: '800px' }}>
        <div className="d-flex justify-content-center align-items-center">
        
        <form onSubmit={handleSubmit} className='m-4' style={{width: '90%'}}>
          <div className="mb-3">
            <label htmlFor="churchName" className="form-label">Church Name</label>
            <input
              type="text"
              className="form-control"
              id="churchName"
              name="churchName"
              value={formData.churchName}
              onChange={handleInputChange}
              placeholder="Enter church name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="churchLocation" className="form-label">Church Address</label>
            <input
              type="text"
              className="form-control"
              id="churchLocation"
              name="churchLocation"
              value={formData.churchLocation}
              onChange={handleInputChange}
              placeholder="Enter church address"
            />
          </div>
          <div className="d-flex align-items-start text-muted small ms-1 mb-2" style={{marginTop: '1rem'}}>
            <i 
              className="bi bi-info-circle me-1 text-danger" 
              style={{fontSize: '16px', cursor: 'pointer'}}
              onClick={() => setShowInstructions(true)}
            ></i>
            <span className='fst-italic' style={{fontSize: '12px', marginTop: '3px'}}>
              How to Get Latitude and Longitude?
            </span>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="latitude" className="form-label">Latitude</label>
              <input
                type="text"
                className="form-control"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="Enter latitude (e.g., 9.6512)"
              />
            </div>
            <Modal
              show={showInstructions}
              onHide={() => setShowInstructions(false)}
              centered
              dialogClassName="modal-dialog-centered"
              className="d-flex align-items-center justify-content-center" style={{marginTop: '-9.5rem', marginLeft: '-7.5rem'}}
            >
              <Modal.Header closeButton>
                <Modal.Title className="fs-6">How to Use Visita Iglesia?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ol className="small mb-0 ps-3">
                  <li>Select your starting church location</li>
                  <li>Add more church destinations as needed</li>
                  <li>Select churches from the dropdown list</li>
                  <li>Remove destinations using X button</li>
                  <li>Click "Get Route" to generate path</li>
                  <li>Use "Reset" to start over</li>
                </ol>
              </Modal.Body>
            </Modal>

            <div className="col-md-6 mb-3">
              <label htmlFor="longitude" className="form-label">Longitude</label>
              <input
                type="text"
                className="form-control"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Enter longitude (e.g., 123.3244)"
              />
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary mt-4">Add Church Location</button>
          </div>      
        </form>
        </div>
      </div>
    </div>
  </>
  );
};

export default AddChurch;
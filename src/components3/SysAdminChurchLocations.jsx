import { useEffect, useState } from 'react';
import { getDocs, collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import { Pagination, Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

export const SysAdminChurchLocations = () => {
  const [churchLocations, setChurchLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddChurchModal, setShowAddChurchModal] = useState(false);
  const [showEditChurchModal, setShowEditChurchModal] = useState(false);
  const [churchToEdit, setChurchToEdit] = useState(null); // Church being edited
  const [formData, setFormData] = useState({
    churchLocation: '',
    churchName: '',
    latitude: '',
    longitude: ''
  });

  const itemsPerPage = 10;

  // Fetch church locations from Firestore
  useEffect(() => {
    const fetchChurchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'churchLocation'));
        const locationList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        locationList.sort((a, b) => a.churchName.localeCompare(b.churchName));
        setChurchLocations(locationList);
      } catch (error) {
        console.error('Error fetching church locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChurchLocations();
  }, []);

  // Handle input changes for the modal form
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

  // Handle adding a new church to Firestore
  const handleAddChurch = async (e) => {
    e.preventDefault();

    if (!formData.churchLocation || !formData.churchName || !formData.latitude || !formData.longitude) {
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
      const querySnapshot = await getDocs(collection(db, 'churchLocation'));
      const existingChurch = querySnapshot.docs.find(doc => {
        const data = doc.data();
        return (
          data.churchName.toLowerCase() === formData.churchName.toLowerCase() &&
          data.churchLocation.toLowerCase() === formData.churchLocation.toLowerCase() &&
          parseFloat(data.latitude) === numLatitude &&
          parseFloat(data.longitude) === numLongitude
        );
      });

      if (existingChurch) {
        toast.error('Church with the same details already exists.');
        return;
      }

      await addDoc(collection(db, 'churchLocation'), {
        churchLocation: formData.churchLocation,
        churchName: formData.churchName,
        latitude: numLatitude,
        longitude: numLongitude,
      });

      toast.success('Church location added successfully!');
      setChurchLocations([...churchLocations, { ...formData, latitude: numLatitude, longitude: numLongitude }]);
      setFormData({ churchLocation: '', churchName: '', latitude: '', longitude: '' });
      setShowAddChurchModal(false);
    } catch (error) {
      console.error('Error adding church location:', error);
      toast.error('Error adding church location');
    }
  };

  // Handle editing a church
  const handleEditChurch = async (e) => {
    e.preventDefault();

    if (!formData.churchLocation || !formData.churchName || !formData.latitude || !formData.longitude) {
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
      const churchRef = doc(db, 'churchLocation', churchToEdit.id);
      await updateDoc(churchRef, {
        churchLocation: formData.churchLocation,
        churchName: formData.churchName,
        latitude: numLatitude,
        longitude: numLongitude,
      });

      toast.success('Church location updated successfully!');
      setChurchLocations(churchLocations.map(church =>
        church.id === churchToEdit.id
          ? { id: church.id, ...formData, latitude: numLatitude, longitude: numLongitude }
          : church
      ));
      setShowEditChurchModal(false);
    } catch (error) {
      console.error('Error updating church location:', error);
      toast.error('Error updating church location');
    }
  };

  // Handle deleting a church
  const handleDeleteChurch = async (churchId) => {
    if (window.confirm('Are you sure you want to delete this church?')) {
      try {
        const churchRef = doc(db, 'churchLocation', churchId);
        await deleteDoc(churchRef);

        toast.success('Church location deleted successfully!');
        setChurchLocations(churchLocations.filter(church => church.id !== churchId));
      } catch (error) {
        console.error('Error deleting church location:', error);
        toast.error('Error deleting church location');
      }
    }
  };

  const totalPages = Math.ceil(churchLocations.length / itemsPerPage);
  const paginatedLocations = churchLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="church-location-page">
      <h1 className="me-3">Cebu Church List</h1>
      <br />
      <div className="d-grid gap-2 d-md-flex justify-content-md-start">
        <Button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddChurchModal(true)}
        >
          Add Church
        </Button>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px' }} />
        </div>
      ) : (
        <table className="admin-table table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th className="custom-th">Church ID</th>
              <th className="custom-th">Church Name</th>
              <th className="custom-th">Church Location</th>
              <th className="custom-th">Latitude</th>
              <th className="custom-th">Longitude</th>
              <th className="custom-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLocations.length > 0 ? (
              paginatedLocations.map((church) => (
                <tr key={church.id}>
                  <td>{church.id}</td>
                  <td>{church.churchName || 'N/A'}</td>
                  <td>{church.churchLocation || 'N/A'}</td>
                  <td>{church.latitude || 'N/A'}</td>
                  <td>{church.longitude || 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => {
                        setChurchToEdit(church);
                        setFormData(church);
                        setShowEditChurchModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteChurch(church.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => setCurrentPage(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>

      {/* Modal for Adding Church */}
      <Modal show={showAddChurchModal} onHide={() => setShowAddChurchModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add a Church</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddChurch}>
            <Form.Group className="mb-3" controlId="formChurchName">
              <Form.Label>Church Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter church name"
                name="churchName"
                value={formData.churchName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formChurchLocation">
              <Form.Label>Church Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter church address"
                name="churchLocation"
                value={formData.churchLocation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLatitude">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter latitude (e.g., 9.6512)"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLongitude">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter longitude (e.g., 123.3244)"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Church
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Editing Church */}
      <Modal show={showEditChurchModal} onHide={() => setShowEditChurchModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Church</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditChurch}>
            <Form.Group className="mb-3" controlId="formEditChurchName">
              <Form.Label>Church Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter church name"
                name="churchName"
                value={formData.churchName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEditChurchLocation">
              <Form.Label>Church Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter church address"
                name="churchLocation"
                value={formData.churchLocation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEditLatitude">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter latitude (e.g., 9.6512)"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEditLongitude">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter longitude (e.g., 123.3244)"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SysAdminChurchLocations;

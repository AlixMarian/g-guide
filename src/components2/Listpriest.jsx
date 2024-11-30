import { useEffect, useState } from 'react';
import '../churchCoordinator.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '/backend/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Pagination from 'react-bootstrap/Pagination';

export const Listpriest = () => {
  const [priestList, setPriestList] = useState([]);
  const [newPriestType, setNewPriestType] = useState("");
  const [newPriestFirstName, setNewPriestFirstName] = useState("");
  const [newPriestLastName, setNewPriestLastName] = useState("");
  const [updatedPriestType, setUpdatedPriestType] = useState("");
  const [updatedPriestFirstName, setUpdatedPriestFirstName] = useState("");
  const [updatedPriestLastName, setUpdatedPriestLastName] = useState("");
  const [editingPriest, setEditingPriest] = useState(null); 
  const [userId, setUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const priestCollectionRef = collection(db, "priest");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        getPriestList(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const getPriestList = async (creatorId) => {
    try {
      const data = await getDocs(priestCollectionRef);
      const filteredData = data.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id
        }))
        .filter((doc) => doc.creatorId === creatorId); 
      console.log({ filteredData });
      setPriestList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      form.classList.add('was-validated');
    } else {
      callback();
    }
  };

  const onSubmitPriest = () => {
    const priestData = {
      priestType: newPriestType,
      firstName: newPriestFirstName,
      lastName: newPriestLastName,
      creatorId: userId 
    };
    addPriest(priestData);
  };

  const onUpdatePriest = () => {
    const priestData = {
      priestType: updatedPriestType,
      firstName: updatedPriestFirstName,
      lastName: updatedPriestLastName
    };
    updatePriestData(editingPriest.id, priestData);
  };

  const addPriest = async (priestData) => {
    try {
      await addDoc(priestCollectionRef, priestData);
      toast.success('Priest added successfully!');
      getPriestList(userId);
      clearForm();
    } catch (err) {
      toast.error('Error adding priest!');
      console.error(err);
    }
  };

  const updatePriestData = async (id, priestData) => {
    const priestDoc = doc(db, "priest", id);
    try {
      await updateDoc(priestDoc, priestData);
      toast.success('Priest updated successfully!');
      getPriestList(userId); 
      clearForm();
    } catch (err) {
      toast.error('Error updating priest!');
      console.error(err);
    }
  };

  const deletePriest = async (id) => {
    const priestDoc = doc(db, "priest", id);
    try {
      await deleteDoc(priestDoc);
      toast.success('Priest deleted successfully!');
      getPriestList(userId); 
    } catch (err) {
      toast.error('Error deleting priest!');
      console.error(err);
    }
  };

  const handleEditPriest = (priest) => {
    setEditingPriest(priest);
    setUpdatedPriestType(priest.priestType);
    setUpdatedPriestFirstName(priest.firstName);
    setUpdatedPriestLastName(priest.lastName);
  };

  const clearForm = () => {
    setNewPriestType("");
    setNewPriestFirstName("");
    setNewPriestLastName("");
    setUpdatedPriestType("");
    setUpdatedPriestFirstName("");
    setUpdatedPriestLastName("");
    setEditingPriest(null);
  };

  const totalPages = Math.ceil(priestList.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentPriests = priestList.slice(firstItemIndex, lastItemIndex);

  return (
    <>
      <h1>List of Priest</h1>
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingPriest ? onUpdatePriest : onSubmitPriest)}>
                  <h3>{editingPriest ? "Edit Priest" : "Add a Priest"}</h3>
                  <div className="col-md-12 mb-3">
                    <label className="form-label" htmlFor="priestType">Position</label>
                    <input type="text" className="form-control" id="priestType"
                      value={editingPriest ? updatedPriestType : newPriestType}
                      onChange={(e) => editingPriest ? setUpdatedPriestType(e.target.value) : setNewPriestType(e.target.value)}
                      required/>
                    <div className="invalid-feedback">Please provide a position.</div>
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label" htmlFor="priestFirstName">First Name</label>
                    <input type="text" className="form-control" id="priestFirstName"
                      value={editingPriest ? updatedPriestFirstName : newPriestFirstName}
                      onChange={(e) => editingPriest ? setUpdatedPriestFirstName(e.target.value) : setNewPriestFirstName(e.target.value)}
                      required/>
                    <div className="invalid-feedback">Please provide a first name.</div>
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label" htmlFor="priestLastName">Last Name</label>
                    <input type="text" className="form-control" id="priestLastName"
                      value={editingPriest ? updatedPriestLastName : newPriestLastName}
                      onChange={(e) => editingPriest ? setUpdatedPriestLastName(e.target.value) : setNewPriestLastName(e.target.value)}
                      required/>
                    <div className="invalid-feedback">Please provide a last name.</div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-success">
                      {editingPriest ? "Confirm Changes" : "Submit"}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={clearForm}>Clear</button>
                    {editingPriest && (
                      <button type="button" className="btn btn-dark" onClick={() => setEditingPriest(null)}>Cancel</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body">
                <h3>List of Priests</h3>
                <Table striped bordered hover responsive style={{ borderRadius: '12px', overflow: 'hidden', borderCollapse: 'hidden' }}>
                <thead className="table-dark">
                    <tr>
                      <th className="listPriest-th">Position</th>
                      <th className="listPriest-th">First Name</th>
                      <th className="listPriest-th">Last Name</th>
                      <th className="listPriest-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {priestList.length > 0 ? (
                    currentPriests.map((priest) => (
                      <tr key={priest.id}>
                        <td className='listPriest-td'>{priest.priestType}</td>
                        <td className='listPriest-td'>{priest.firstName}</td>
                        <td className='listPriest-td'>{priest.lastName}</td>
                        <td className='listPriest-td'>
                          <div className="btn-group">
                            <button type="button" className="btn btn-primary" onClick={() => handleEditPriest(priest)}>Edit</button>
                            <button type="button" className="btn btn-danger" onClick={() => deletePriest(priest.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <h4 className="text-muted">No priests found</h4>
                      </td>
                    </tr>
                  )}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                    {[...Array(totalPages).keys()].map((number) => (
                      <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => setCurrentPage(number + 1)}>
                        {number + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Listpriest;

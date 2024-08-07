import { useEffect, useState } from 'react';
import '../churchCoordinator.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '/backend/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

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

  return (
    <>
      <h1>List of Priest</h1>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Position</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Fix</th>
          </tr>
        </thead>
        <tbody>
          {priestList.map((priest) => (
            <tr key={priest.id}>
              <td>{priest.priestType}</td>
              <td>{priest.firstName}</td>
              <td>{priest.lastName}</td>
              <td>
                <div className="btn-group">
                  <button type="button" className="btn btn-secondary" onClick={() => handleEditPriest(priest)}>Edit</button>
                  <button type="button" className="btn btn-danger" onClick={() => deletePriest(priest.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="events">
        <form className="row g-3 needs-validation" noValidate onSubmit={(e) => handleSubmit(e, editingPriest ? onUpdatePriest : onSubmitPriest)}>
          <h3>{editingPriest ? "Edit Priest" : "Add a Priest"}</h3>
          <div className="col-md-4">
            <label className="form-label" htmlFor="priestType">Position</label>
            <input type="text" className="form-control" id="priestType"
              value={editingPriest ? updatedPriestType : newPriestType}
              onChange={(e) => editingPriest ? setUpdatedPriestType(e.target.value) : setNewPriestType(e.target.value)}
              required/>
            <div className="invalid-feedback">Please provide a position.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="priestFirstName">First Name</label>
            <input type="text" className="form-control" id="priestFirstName"
              value={editingPriest ? updatedPriestFirstName : newPriestFirstName}
              onChange={(e) => editingPriest ? setUpdatedPriestFirstName(e.target.value) : setNewPriestFirstName(e.target.value)}
              required/>
            <div className="invalid-feedback">Please provide a first name.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="priestLastName">Last Name</label>
            <input type="text" className="form-control" id="priestLastName"
              value={editingPriest ? updatedPriestLastName : newPriestLastName}
              onChange={(e) => editingPriest ? setUpdatedPriestLastName(e.target.value) : setNewPriestLastName(e.target.value)}
              required/>
            <div className="invalid-feedback">Please provide a last name.</div>
          </div>
          <div className="col-12" >
            <div className="btn-group" role="group" >
              <button type="submit" className="btn btn-success">
                {editingPriest ? "Confirm Changes" : "Submit"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={clearForm}>Clear</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Listpriest;

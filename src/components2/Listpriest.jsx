import { useEffect, useState } from 'react';
import '../churchCoordinator.css';
import {db} from '/backend/firebase'
import {collection, getDocs, addDoc, deleteDoc, doc, updateDoc} from 'firebase/firestore';

export const Listpriest = () => {
    const [priestList, setPriestList] = useState([]);

    //new priest
    const [newPriestType, setNewPriestType] = useState("");
    const [newPriestFirstName, setNewPriestFirstName] = useState("");
    const [newPriestLastName, setNewPriestLastName] = useState("");

    //update priest
    const [updatedPriestType, setUpdatedPriestType] = useState("");
    const [updatedPriestFirstName, setUpdatedPriestFirstName] = useState("");
    const [updatedPriestLastName, setUpdatedPriestLastName] = useState("");

    const priestCollectionRef = collection(db,"priest");

  //get priestlist
    const  getPriestList = async () =>{
      try{
      const data = await getDocs(priestCollectionRef);
      const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
           id: doc.id
          }));
      console.log({filteredData});
          setPriestList(filteredData);
      }catch(err){
          console.error(err);
      }
      
      };

    useEffect(() => {
        getPriestList();
    },[])
//add new priest
    const onSubmitPriest = async () => {
        try{
        await addDoc(priestCollectionRef, {
            priestType: newPriestType,
            firstName: newPriestFirstName,
            lastName: newPriestLastName,
        });
          getPriestList();
        }catch(err){
          console.error(err);
        }
      };

    //delete priest
    const deletePriest = async (id) => {
      const priestDoc = doc(db, "priest", id)
      try{
        await deleteDoc(priestDoc)
      }catch(err){
        console.error(err);
      }
    };

    //update priest
    const updatePriest = async (id) => {
      const priestDoc = doc(db, "priest", id);
      try {
        await updateDoc(priestDoc, {
          priestType: updatedPriestType, 
          firstName: updatedPriestFirstName, 
          lastName: updatedPriestLastName
        });
      } catch (err) {
        console.error(err);
      }
    };
    

  //html
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
            <tr>
                <td>
                    {priest.priestType}
                </td>
                <td>
                    {priest.firstName}
                </td>
                <td>
                    {priest.lastName}  
                </td>
                <td>
                <form>
                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Edit
                </button>
                <div className="dropdown-menu">
                    <form className="px-4 py-3">
                    <div className="mb-3">
                        <label for="exampleDropdownFormEmail1" className="form-label">Position</label>
                        <input placeholder="" className="form-control" id="exampleDropdownFormEmail1" 
                        onChange={(e) => setUpdatedPriestType(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormEmail1" className="form-label">First Name</label>
                        <input placeholder="" className="form-control" id="exampleDropdownFormEmail1"
                        onChange={(e) => setUpdatedPriestFirstName(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label for="exampleDropdownFormPassword1" className="form-label">Last Name</label>
                        <input type="text" className="form-control" id="exampleDropdownFormPassword1"
                        onChange={(e) => setUpdatedPriestLastName(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary"
                      onClick={() => updatePriest(priest.id)}>Confirm Changes</button>
                    </form>
                  </div>
                <button type="button" class="btn btn-danger" 
                onClick={() => deletePriest(priest.id)}>delete</button>
                </form>
                </td>
            </tr>
            ))}  
        </tbody>
        </table>

        <div className="events">
        <form className="row g-3">
            <h3>Add a Priest</h3>
          <div className="col-6">
            <label htmlFor="eventDate" className="form-label">First Name</label>

            <input type="text" className="form-control" id="eventDate" 
            onChange={(e) =>setNewPriestFirstName(e.target.value)}
            />

          </div>
          <div className="col-md-6">
            <label htmlFor="eventType" className="form-label">Last Name</label>
            <input type="text" className="form-control" id="eventType"
            onChange={(e) =>setNewPriestLastName(e.target.value)}
            />
          </div>

          <div className="col-6">
            <label htmlFor="eventDate" className="form-label">Position</label>

            <input type="text" className="form-control" id="eventDate" 
            onChange={(e) =>setNewPriestType(e.target.value)}
            />

          </div>
          <div className="col-md-6">
            <label className="form-label d-block">Confirm</label>
              <div className="btn-group" role="group">
                  <button type="button" className="btn btn-success"onClick={onSubmitPriest} >Confirm Change</button>
                  <button type="button" className="btn btn-danger" >Clear</button>
              </div>
          </div>
        </form>
      </div>
        </>
    );
  };
  
  export default Listpriest;
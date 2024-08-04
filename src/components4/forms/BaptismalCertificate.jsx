import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';

export const BaptismalCertificate = () => {
    const { churchId } = useParams();
    const [churchData, setChurchData] = useState(null);
    
    useEffect(() => {
        const fetchChurchData = async () => {
          const docRef = doc(db, 'church', churchId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setChurchData(docSnap.data());
          }
        };
        fetchChurchData();
      }, [churchId]);

    return (
    <div>
        <div className="submitReq card mb-4">
            <div className="card-body">
                <h5 className="card-title">Submit Requirements</h5>

                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="birthday" className="form-label">Birthday</label>
                  <input type="date" className="form-control" id="birthday" name="birthday" />
                </div>
                <div>Father</div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="fatherFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="fatherFirstName" name="fatherFirstName" />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="fatherLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="fatherLastName" name="fatherLastName"  />
                  </div>
                </div>
                <div>Mother</div>
                <div className="row mb-3">
                  <div className="col mb-3">
                    <label htmlFor="motherFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="motherFirstName" name="motherFirstName"  />
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="motherLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="motherLastName" name="motherLastName"  />
                  </div>
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-success me-md-2">Submit</button>
                  <button type="reset" className="btn btn-danger">Clear</button>
                </div>

                
            </div>
        </div>

        <div className="submitPayment card mb-4">
        <div className="card-body">
          <h5 className="card-title">Submit Payment</h5>
            {churchData && churchData.churchQRDetail && churchData.churchInstruction &&(
               <div>
                <p>{churchData.churchInstruction}</p>
                <img src={churchData.churchQRDetail} alt="Church QR Code" className="qr-image mx-auto d-block" />
             </div>
            )}
            <br/>
            <label><strong>Submit your receipt here</strong></label>
            <div className="d-flex align-items-center mb-3">
              <input className="form-control me-2" type="file" id="formFile"/>
              <button type="reset" className="btn btn-danger">Clear</button>
            </div>

        </div>
      </div>

    </div>
  )
};

export default BaptismalCertificate;

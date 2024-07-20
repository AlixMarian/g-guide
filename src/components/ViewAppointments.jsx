import '../custom.css';
import { useNavigate } from 'react-router-dom';

const ViewAppointments = () => {
  const navigate = useNavigate();

  const handleBackToHomepage = () => {
    navigate('/homepage');
  };

  return (
    <div className="viewApp">
      <div className="container">
        <div className="row">
        <div className="col-12 mb-4">
            <button type="button" className="btn btn-primary" onClick={handleBackToHomepage}>Back to Homepage</button>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Pending Appointments</h5>
                <div className="card w-100 mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Sample - Request Document</h5>
                    <p className="card-text"><b>Status: Pending</b></p>
                  </div>
                </div>
                <div className="card w-100 mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Sample - Baptismal Ceremony</h5>
                    <p className="card-text"><b>Status: Pending</b></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Appointment History</h5>
                <div className="card w-100 mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Sample - Birth Certificate Document</h5>
                    <p className="card-text"><b>Status: Approved</b></p>
                  </div>
                </div>
                <div className="card w-100 mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Sample - Burial Services</h5>
                    <p className="card-text"><b>Status: Denied</b></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ViewAppointments;

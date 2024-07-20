import { useNavigate } from 'react-router-dom';
import '../custom.css';

export const Homepage = () => {
  const navigate = useNavigate();
  const handleViewAppnts = () => {
    navigate('/view-appointments');
  };
    return (
    <div className="homepage-container">
      <div className="container mt-4">
        <div className="row">
          <div className="col-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">In need of a local church?</h5>
              <p className="card-text">We can help you find your nearest church, get up-to-date information, and connect with them</p>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/map')}>Open Maps</button>
            </div>
            <img src="src\assets\mapImg.png" className="card-img-bottom" alt="..."/>
          </div>
          </div>

          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Bookmarked Churches</h5>
                <p className="card-text">text only</p>
              </div>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">View Appointments</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">First</th>
                      <th scope="col">Last</th>
                      <th scope="col">Handle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                  </tbody>
                </table>
                <button type="button" className="btn btn-primary" onClick={handleViewAppnts}>View Appointment History</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
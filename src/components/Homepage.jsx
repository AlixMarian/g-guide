import '../custom.css';

export const Homepage = () => {
  return (
    <div>
      <nav className="homePageNavbar navbar navbar-expand-lg sticky-top bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="../src/assets/gGuideLogo.svg" alt="Logo" width="40" height="34" className="d-inline-block align-text-top" />
            G!Guide
          </a>
          
          <button type="button" className="btn btn-primary">Logout</button>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body hmpgContainer1 d-flex align-items-center">
                <div className="card mb-3 flex-grow-1">
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img src="../src/assets/mapImg.png" className="img-fluid rounded-start" alt="Example" />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body">
                        <h5 className="card-title">In need of a local church?</h5>
                        <p className="card-text">We can help you find your nearest church, get up-to-date information, and connect with them</p>
                        <button type="button" className="btn btn-primary">Open Maps</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body hmpgContainer2 d-flex align-items-center">
                <div className="row flex-grow-1">
                  <div className="col-md-6 appointments">.col-md-6</div>
                  <div className="col-md-6">.col-md-6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

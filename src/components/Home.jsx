import '../websiteUser.css';

export const Home = () => {
    return (
    <>
      
      <div id="siteBanner" className="text-center">
        <img src="../src/assets/siteBanner.png" className="d-block w-100" alt="Site Banner" />
      </div>
        
        <div className="container-xxl partneredChurch mt-4">
        <h3 className="text-center">Our Partnered Churches</h3>
        <div id="partneredChurchCarousel" className="carousel carousel-dark slide" data-bs-ride="true">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="row text-center">
                <div className="col-6 col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      Sample Church Number 1
                      <br />
                      Location
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      Sample Church Number 2
                      <br />
                      Location
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      Sample Church Number 3
                      <br />
                      Location
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="carousel-item">
              <div className="row text-center">
                <div className="col-6 col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      Sample Church Number 4
                      <br />
                      Location
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      Sample Church Number 5
                      <br />
                      Location
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      Sample Church Number 6
                      <br />
                      Location
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#partneredChurchCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#partneredChurchCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      <div id="featureBanner" className="text-center">
        <img src="../src/assets/featureBanner.png" className="d-block w-100"  />
      </div>

    <div className="featureBanner">
        <h1 className="text-center">Features</h1>

        <div className="card-group">
            <div className="card">
                <img src="../src/assets/findAChurch.png" className="card-img-top" alt="..."/>
                <div className="card-body">
                    <h5 className="card-title">Find a Church</h5>
                    <p className="card-text">Easily locate a church based on your device’s location.</p>
                </div>
            </div>

            <div className="card">
                <img src="../src/assets/visitaIglesia.png" className="card-img-top" alt="..."/>
                <div className="card-body">
                    <h5 className="card-title">Visita Iglesia Route Maker</h5>
                    <p className="card-text">Based on your starting point, we can generate a route consisting of nearby churches.</p>
                </div>
            </div>

            <div className="card">
                <img src="../src/assets/viewChurchInfo.png" className="card-img-top" alt="..."/>
                <div className="card-body">
                    <h5 className="card-title">View Church Information</h5>
                    <p className="card-text">Know the church’s mass schedules, language and services they offer.</p>
                </div>
            </div>

            <div className="card">
                <img src="../src/assets/setUp.png" className="card-img-top" alt="..."/>
                <div className="card-body">
                    <h5 className="card-title">Set Up Appointments</h5>
                    <p className="card-text">View available slots and set up an appointment based on the service you want to avail.</p>
                </div>
            </div>

            <div className="card">
                <img src="../src/assets/reqVolunteer.png" className="card-img-top" alt="..."/>
                <div className="card-body">
                    <h5 className="card-title">Request for Help</h5>
                    <p className="card-text">Churches can create a call for help which brings community closer together.</p>
                </div>

            </div>
        </div>
    </div>

    <div id="contactUs" className="text-center">
        <img src="../src/assets/contactUs.png" className="d-block w-100"  />
      </div>

    </>
    )
  }

  export default Home;
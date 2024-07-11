export const ViewAppointments = () => {
  return (
    <div className="viewApp">
        <div className="container mt-4">
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Pending Appointments</h5>
                            <div className="card-body card text-bg-light mb-3">
                                <h5 className="card-title">Sample - Request Document</h5>
                                <p className="card-text">Enter details</p>
                            </div>
                            <div className="card-body card text-bg-light mb-3">
                                <h5 className="card-title">Sample - Baptismal Ceremony</h5>
                                <p className="card-text">Enter Details</p>
                            </div>
                    </div>
                    </div>
                </div>

                <div className="col-12 mb-4">
                    <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Appointment History</h5>
                            <div className="card-body card border-danger mb-3">
                                <h5 className="card-title">Sample - Birth Certificate Document</h5>
                                <p className="card-text">Enter Details here</p>
                            </div>
                            <div className="card-body card border-success mb-3">
                                <h5 className="card-title">Sample - Burial Serivices</h5>
                                <p className="card-text">Enter Details here</p>
                            </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default ViewAppointments;
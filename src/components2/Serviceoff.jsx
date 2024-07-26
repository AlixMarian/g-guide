import '../churchCoordinator.css';

export const Serviceoff = () => {
    return (
        <>
        <h1>Services Offered</h1>

        <div className="Services">
            <div className="offer1">
                <h4>Schedules</h4>
                    <div className="Schedtogs">
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Marriages</label><br/>
                        </div>
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Baptism</label><br/>
                        </div>
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Confirmation</label>
                        </div>
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Burials</label>
                        </div>
                        <br/>
                        <button type="button" className="btn btn-success">Confirm Change</button>
                    </div>
            </div>

            <div className="offer2">
                <h4>Request Documents</h4>
                    <div className="Schedtogs">
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Baptismal Certificate</label><br/>
                        </div>
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Confirmation Certificate</label><br/>
                        </div>
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Marriages Certificate</label><br/>
                        </div> 
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Enumerations Certificate</label><br/>
                        </div>
                        <div className="form-check ">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">Burial Certificate</label><br/>
                        </div>
                     </div>
                     <br/>
                     <button type="button" className="btn btn-success">Confirm Change</button>
             </div>
        </div>
        </>
    );
};

export default Serviceoff;

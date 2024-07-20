import '../churchCoordinator.css';

export const Listpriest = () => {
    return (
        <>
        <h1>List of Priest</h1>

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
            <td>
                <button type="button" className="btn btn-info">Edit</button>
                <button type="button" className="btn btn-danger">Delete</button> 
            </td>
            </tr>
            <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
            <td>
                <button type="button" className="btn btn-info">Edit</button>
                <button type="button" className="btn btn-danger">Delete</button> 
            </td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the bird</td>
            <td>@twitter</td>
            <td>
                <button type="button" className="btn btn-info">Edit</button>
                <button type="button" className="btn btn-danger">Delete</button> 
            </td>
            </tr>
        </tbody>
        </table>
        </>
    );
  };
  
  export default Listpriest;
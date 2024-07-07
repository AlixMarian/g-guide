import { Link } from "react-router-dom";


export const Layout = () => {
  return (
    <>
    <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
        <button className="navbar-expand-lg sticky-top bg-body-tertiary " data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
      <input type="image" src="../src/assets/logo.png" height="40" width="40"></input>
      </button>
        <a className="navbar-brand" href="#">G! Guide</a>
    <div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
      <div className="offcanvas-header">
        <img src="../src/assets/logo.png" className="rounded float-start" alt="..." width="40" height="40"/> 
        <h5 className="offcanvas-title" id="offcanvasNavbarLabel">G! Guide</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <hr></hr>
      <div className="offcanvas-body">
        <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-calendar-check-fill" viewBox="0 0 16 16">
            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-5.146-5.146-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
          </svg>
            <Link to="/SEA">Schedule, Events, and Announcements</Link>
          </li>
          <hr></hr>
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 48 48"><defs><mask id="ipSAppointment0"><g fill="none" stroke-width="4"><circle cx="24" cy="11" r="7" fill="#fff" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" d="M4 41c0-8.837 8.059-16 18-16"/><circle cx="34" cy="34" r="9" fill="#fff" stroke="#fff"/><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="M33 31v4h4"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSAppointment0)"/></svg>
            <Link to="/Appointmens">Appointments</Link>
          </li>
          <hr></hr>
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 24 24"><path fill="currentColor" d="M2 22v-8l4-1.775V9l5-2.5V5H9V3h2V1h2v2h2v2h-2v1.5L18 9v3.225L22 14v8h-8v-3q0-.825-.587-1.412T12 17t-1.412.588T10 19v3zm10-8.5q.625 0 1.063-.437T13.5 12t-.437-1.062T12 10.5t-1.062.438T10.5 12t.438 1.063T12 13.5"/></svg>
            <Link to="/ChurchInfo">Church Information</Link>
          </li>
          <hr></hr>
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 256 256"><path fill="currentColor" d="M128 83.22a54 54 0 0 0-8-10.06V40h-16a8 8 0 0 1 0-16h16V8a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16h-16v33.16a54 54 0 0 0-8 10.06M180 56c-17.74 0-33.21 6.48-44 17.16V176a8 8 0 0 1-16 0V73.16C109.21 62.48 93.74 56 76 56a60.07 60.07 0 0 0-60 60c0 29.86 14.54 48.85 26.73 59.52A90.5 90.5 0 0 0 64 189.34V208a16 16 0 0 0 16 16h96a16 16 0 0 0 16-16v-18.66a90.5 90.5 0 0 0 21.27-13.82C225.46 164.85 240 145.86 240 116a60.07 60.07 0 0 0-60-60"/></svg>
            <Link to="/ListofPriest">List of Priest</Link>
          </li>
          <hr></hr>
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 24 24"><path fill="black" d="M14.121 10.48a1 1 0 0 0-1.414 0l-.707.706a2 2 0 0 1-2.828-2.828l5.63-5.632a6.5 6.5 0 0 1 6.377 10.568l-2.108 2.135zM3.161 4.468a6.5 6.5 0 0 1 8.009-.938L7.757 6.944a4 4 0 0 0 5.513 5.794l.144-.137l4.243 4.242l-4.243 4.243a2 2 0 0 1-2.828 0L3.16 13.66a6.5 6.5 0 0 1 0-9.192"/></svg>
            <Link to="/ServiceOffered">Services Offered</Link>
          </li>
          <hr></hr>
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill"  viewBox="0 0 24 24"><path fill="black" d="M20 17q.86 0 1.45.6t.58 1.4L14 22l-7-2v-9h1.95l7.27 2.69q.78.31.78 1.12q0 .47-.34.82t-.86.37H13l-1.75-.67l-.33.94L13 17zM16 3.23Q17.06 2 18.7 2q1.36 0 2.3 1t1 2.3q0 1.03-1 2.46t-1.97 2.39T16 13q-2.08-1.89-3.06-2.85t-1.97-2.39T10 5.3q0-1.36.97-2.3t2.34-1q1.6 0 2.69 1.23M.984 11H5v11H.984z"/></svg>
            <Link to="/RequestforVolunteer">Request for Volunteers</Link>
          </li>
          <hr></hr>
          <li className="nav-item" data-bs-dismiss="offcanvas">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className="bi bi-calendar-check-fill" viewBox="0 0 24 24"><path fill="black" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
            <Link to="/AccountSettings">Account Settings</Link>
          </li>
          <hr></hr>
        </ul>
      </div>
      <li className="nav-item" data-bs-dismiss="offcanvas">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><g fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2"/><path d="M15 12H3l3-3m0 6l-3-3"/></g></svg>
      <Link to ="/">Log-out</Link>
      </li>
    </div>
  </div>
</nav>
    </>
  );
};


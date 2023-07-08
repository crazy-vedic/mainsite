import { Outlet, Link } from "react-router-dom";


function Layout() {
  
  return (
    <>
      <ul>
        <li>
          <Link to="/">Login</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
      </ul>
    </>
  )
}

export default Layout
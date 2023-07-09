import './Login.css';
import {Link} from 'react-router-dom';

function No404Page() {
  return (
    <>
      <h1>Unknown page, please login again</h1>
      <Link to="/login">Login</Link>
    </>
  )
}

export default No404Page
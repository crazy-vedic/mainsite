import './Login.css';
import {Link} from 'react-router-dom';

function No404Page() {
  return (
    <>
      <h1>Unknown page, please login again</h1>
      <Link to="/"><h1>Login</h1></Link>
    </>
  )
}

export default No404Page
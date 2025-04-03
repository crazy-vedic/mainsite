// import './Login.css';
import {Link} from 'react-router-dom';

function StudentManagementNo404Page() {
  return (
    <>
      <h1>Unknown page, please login again</h1>
      <Link to='/projects/studentManagement' className="home-button"><h2>Home</h2></Link>    </>
  )
}

export default StudentManagementNo404Page
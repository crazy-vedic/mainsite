import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const BACKENDSERVER = "https://vedicvarma.com";
  const toasty =  {position: "top-right",autoClose: 5000,hideProgressBar: false,closeOnClick: true,draggable: true,progress: undefined,theme: "colored",}
  const navigate = useNavigate()
  const  [input, setInput] = useState({username: '', password: ''})

  const handleChange = (e) => {
    setInput(values => ({...values, [e.target.name]: e.target.value}))
  }

  const toastifyError = (msg) => {
    toast.error(msg, {
      position: "top-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      theme: "colored",
      });
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    //console.log(input)
    var status,body;
    var response = fetch(`${BACKENDSERVER}/api/students/login`, {method: 'POST', body: JSON.stringify(input), headers: {'Content-Type': 'application/json'}})
    response.then(res => res.json().then(data => {
      status= res.status;
      body= data;
      if (status === 200) {
        localStorage.setItem('token', body.token);
        navigate('/projects/studentManagement/dashboard');//Naviages to the /dashboard page
      }
      else {
          console.log(body);
          toastifyError(`${status}: ${body.message}`);
          document.getElementById("password").value = "";
        }}))
      .catch(err => {
        toast.error(`${response.status} : ${err}`,toasty);
        console.log(err);});
  }
  
  return (
    <div id="login-root">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label >User</label>
        <input name='username' type="text" id="username" onChange={handleChange} />
        <label htmlFor="password">Password</label>
        <input name='password' type="password" id="password" onChange={handleChange}/>
        <button type="submit">Login</button>
      </form>
      <ToastContainer />
    </div>
  )
}

export default Login
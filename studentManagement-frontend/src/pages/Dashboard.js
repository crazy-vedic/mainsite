import { useEffect, useState } from 'react';
import './Dashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';


function Dashboard() {
  const BACKENDSERVER = "https://vedicvarma.com";
  const toasty =  {position: "top-right",autoClose: 5000,hideProgressBar: false,closeOnClick: true,draggable: true,progress: undefined,theme: "colored",}
  var token = localStorage.getItem('token');
  const [students, setStudents] = useState([]);
  const [addStudent, setAddStudent] = useState({show:false,name:null, _id: NaN, joining: null, gpa: null, section: null,program:null});
  const [updateStudents, setUpdateStudents] = useState([]);
  function clearAddData() {
    setAddStudent(prevState => ({...prevState,show:false,name:null, joining: null, gpa: null, section: null,program:null}))
    document.querySelectorAll("input.add-student").forEach((input) => input.value = "")
  }
  function fetchStudents() {
    console.log("fetching students")
    token = localStorage.getItem('token');
    var response
    fetch(`${BACKENDSERVER}/api/students/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
    'Authorization':`${token}`},
    body: JSON.stringify({sort: {_id: -1},limit:10})
    })
      .then(res => {response=res;return res.json();})
      .then(data => setStudents(prevState => {return data.map((student) => {
        if (prevState===undefined) {
          return {...student,checked:false,settings:false}
        }
        var prevStudent = (prevState.find((prevStudent) => prevStudent._id === student._id))||({checked:false,settings:false});
        var tempstudent = {...student};
        tempstudent.checked=prevStudent.checked||false;
        tempstudent.settings=prevStudent.settings||false;
        return tempstudent;})}))
      .catch(err => {
        if (response.status===403) {
          toast.error(`Unauthorized :\n${<Link to="'/projects/studentManagement'">Please login again from the login page.</Link>}`,toasty);
        }else{
        toast.error(`${response.status} : ${err}`,toasty);
        console.log(err);}});
  }
  useEffect(() => {
    fetchStudents();
    //getLastId();

    const timer = setInterval(() => {
      fetchStudents();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  function handleAddStudent(event) {
    const {id,value} = event.target
    setAddStudent(prevState=>({...prevState,[id]:value}))
  }
  function getLastId() {
    token = localStorage.getItem('token');
    fetch(`${BACKENDSERVER}/api/students/search`, {method: 'POST', headers: { 'Content-Type': 'application/json',
    'Authorization':`${token}` },body: JSON.stringify({sort: {_id: -1},limit:1})})
  .then(res => res.json())
  .then(info => {
    setAddStudent(prevState=>({...prevState,_id:info[0]._id+1}))
    console.log("get last id");
    return })
  }
  function handleUpdateStudent(event,SID) {
    const {value} = event.target
    const target = event.target.getAttribute("target")
    setUpdateStudents(prevState=>{return prevState.map((student) => {
      if (student._id===SID) {
        return {...student,[target]:value}
      }
      return student;
    })})
    console.log(updateStudents)
  }
  function fetchUpdateStudents(SID) {
    var response;
    token = localStorage.getItem('token');
    fetch(`${BACKENDSERVER}/api/students/${SID}`, {method: 'PUT', headers: { 'Content-Type': 'application/json',
    'Authorization':`${token}` },body: JSON.stringify(Array.from(updateStudents.filter((student) => student._id===SID))[0])})
  .then(res => {response=res;return res.json();})
  .then(info => {if (response.status===200) {
    toast.success(info.message,toasty)
    document.getElementById('updateCancel').click();
    fetchStudents();}
    else {
      toast.error(info.message,toasty)
    }
  })}
  function addStudentToDB(event) {
    event.preventDefault();
    var addbtn = document.getElementById("add-student-btn");
    var response;
    token = localStorage.getItem('token');
    fetch(`${BACKENDSERVER}/api/students/create`, {method: 'POST', headers: { 'Content-Type': 'application/json',
    'Authorization':`${token}` }, body: JSON.stringify(addStudent)})
    .then(res=>{
      response = res;
      return res.json();})
    .then(body => {
      if (response.status === 200) {
        toast.success(body.message,toasty)
        clearAddData();
      } else {
        toast.error(body.message,toasty)
  }
    fetchStudents();}).catch(err => console.log(err))

};
var index;
  return (
    <div id="dashboard-root">
      {/*<button onClick={() => toast.warn("etouhetotusehiesu",toasty)}>toasty pls</button>*/}
      <ToastContainer />
      <h1>Student Dashboard</h1>
      <button id="add-student-btn" onClick={() => {if (!addStudent.show) {getLastId();};setAddStudent(prevState=>({...prevState,'show':!addStudent.show}));}}>{addStudent.show?"Close Menu":"Add Student"}</button>
      <button id="delete-students" onClick={() => {
        const checkedStudents = students.filter((student) => student.checked)
        var response;
        fetch(`${BACKENDSERVER}/api/students`, {method: 'DELETE', headers: { 'Content-Type': 'application/json',
    'Authorization':`${token}` }, body: JSON.stringify(checkedStudents.map((student) => student._id))})
        .then(res => {response = res;
          return res.json();})
        .then(data => {
          if (response.status===200) {
          return toast.success(data.message,toasty);}
          else{toast.warning(data.message,toasty);}})
        .catch(err => console.log(err))
        fetchStudents();
      }}>Delete Checked Students</button>
      {addStudent.show ? (
      <div id="add-student-div">
      <table id='add-student-table'>
        <thead>
        <tr>
          <td className='w3'>
            <div id="addRemoveStudents-div">
              <button
                id="addStudentToDB"
                className="editStudent"
                onClick={(event) => {addStudentToDB(event);document.getElementById("removeAddStudent").click();}}>
                <img src={require("../components/check.png")} alt="check add student" />
              </button>
              <button id="removeAddStudent" className="editStudent" onClick={() => clearAddData()}>
                <img src={require("../components/cancel.png")} alt="cancel add student" />
              </button>
            </div>
          </td>
          <td className="w4">
            <input
              className="add-student"
              id="_id"
              placeholder="regNo"
              onChange={(event) => handleAddStudent(event)}
              value={String(addStudent._id)}
            ></input>
          </td>
          <td className="w13_5">
            <input
              className="add-student"
              id="name"
              placeholder="name"
              onChange={(event) => handleAddStudent(event)}
            ></input>
          </td>
          <td className="w8">
            <input
              className="add-student"
              id="joining"
              placeholder="Joining"
              onChange={(event) => handleAddStudent(event)}
            ></input>
          </td>
          <td className="w7">
            <input
              className="add-student"
              id="program"
              placeholder="Program"
              onChange={(event) => handleAddStudent(event)}
            ></input>
          </td>
          <td className="w3">
            <input
              className="add-student"
              id="gpa"
              placeholder="gpa"
              onChange={(event) => handleAddStudent(event)}
            ></input>
          </td>
          <td className="w6">
            <input
              className="add-student"
              id="section"
              placeholder="section"
              onChange={(event) => handleAddStudent(event)}
            ></input>
          </td>
          <td className='w3'></td>
        </tr>
        </thead>
      </table>
      </div>
      )
      ://////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      <div id="add-student"></div>}
      <table id='main-table'>
      <thead>
        <tr>
          <td className="w3">Delete</td>
          <td className="w4">Reg No.</td>
          <td className="w13_5">Name</td>
          <td className="w8">Joining</td>
          <td className="w7">Program</td>
          <td className="w3">gpa</td>
          <td className="w3">Section</td>
          <td className="w3">Edit</td>
        </tr>
      </thead>
        <tbody>
          {students.map((student) => (student.settings?
            <tr key = {student._id}>
            <td>
              <input
                type="checkbox"
                checked={Boolean(student.checked)}
                onChange={(event) => {
                  const updatedStudents = students.map((s) =>
                    s._id === student._id ? { ...s, checked: event.target.checked } : s
                  );
                  console.log(updatedStudents);
                  setStudents(updatedStudents);
                }}
              />
            </td>
            <td>{student._id}</td>{/*      const { _id,name, joining, program, gpa, section} = req.body;*/}
           <td><input type="text" onChange={(event) => handleUpdateStudent(event,student._id)} target='name' placeholder={student.name}/></td>
            <td><input type="text" onChange={(event) => handleUpdateStudent(event,student._id)} target='joining' placeholder={student.joining}/></td>
            <td><input type="text" onChange={(event) => handleUpdateStudent(event,student._id)} target='program' placeholder={student.program}/></td>
            <td><input type="text" onChange={(event) => handleUpdateStudent(event,student._id)} target='gpa' placeholder={student.gpa["$numberDecimal"]}/></td>
            <td><input type="text" onChange={(event) => handleUpdateStudent(event,student._id)} target='section' placeholder={student.section}/></td>
            <td><div id='updateDiv'>
              <button onClick={() => {
                setUpdateStudents(prevState => prevState.filter((s) => s._id !== student._id))
                setStudents(students.map((s) =>
                s._id === student._id ? { ...s, settings: false } : s
                ));
              }} id='updateCancel'><img src={require("../components/cancel.png")} alt='reject update'></img></button>
              <button onClick={() => fetchUpdateStudents(student._id)}><img src={require("../components/check.png")} alt='accept update'></img></button>
            </div></td>
            </tr>
          :////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            <tr key = {student._id}>
            <td>
              <input
                type="checkbox"
                checked={Boolean(student.checked)}
                onChange={(event) => {
                  const updatedStudents = students.map((s) =>
                    s._id === student._id ? { ...s, checked: event.target.checked } : s
                  );
                  setStudents(updatedStudents);
                }}
              />
            </td>
              <td>{student._id}</td>
              <td>{student.name}</td>
              <td>{student.joining}</td>
              <td>{student.program}</td>
              <td>{student.gpa["$numberDecimal"]}</td>
              <td>{student.section}</td>
              <td><button className="editStudent" onClick={(event) => {
              setUpdateStudents(prevState => [...prevState,student])
              var tempStudents = [...students]
              index=students.findIndex((studentF) => studentF._id===student._id)
              tempStudents[index].settings=tempStudents[index].settings?false:true
              setStudents(tempStudents)
            }}><img src={require("../components/settings.png")} alt="edit row" /></button></td></tr>          ))}
        </tbody>
      </table>
    </div>
  )}
export default Dashboard
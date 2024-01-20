import React from 'react';
import styled from "styled-components";
import github from '../components/github.png';

const Navbar = () => (
  <NavWrapper>
    <ul className="menu">
      <li className="nav-item logo" ><a href="/" ><img src={github} alt="logo" /></a></li>
      <li className="nav-item mt-2"><a href="#portfolio" >Portfolio</a></li>
      <li className="nav-item mt-2"><a href="#about" >About</a></li>
      <li className="nav-item mt-2"><a href="#contact" >Contact</a></li>
    </ul>
  </NavWrapper>
);

export default Navbar;

const NavWrapper = styled.div`
background-color:#000000;
box-shadow: inset 0 0 1000px 1000px rgba(0, 0, 0, 0.747);
margin:0;

*{
  color:grey;
}

.menu {
  display: -webkit-box; 
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex; 
  display: flex;
}
.mt-2{
  margin-top:1rem;
}
ul {
  list-style-type: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding: 1rem 2rem;
}

.nav-item{
  color:#ffffff;
  margin-right: 1rem;
}

.logo{
  margin-right:auto;
}
@media only screen and (max-width: 767px) { 
  ul {
    padding: 1rem 1.5rem;
  }
    .nav-item{
      margin-right: .75rem;
    
  }
`
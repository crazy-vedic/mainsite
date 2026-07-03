import React from 'react';
import './Navbar.css';

const Navbar = () => (
  <nav className="site-nav">
    <ul className="site-nav__menu">
      <li className="site-nav__item site-nav__item--logo">
        <a href="/" aria-label="Home">
          <img src="/assets/logo.png" alt="Vedic Varma" className="site-nav__logo" />
        </a>
      </li>
      <li className="site-nav__item">
        <a href="/#projects">Portfolio</a>
      </li>
      <li className="site-nav__item">
        <a href="/resume">Resume</a>
      </li>
      <li className="site-nav__item">
        <a href="/#contact">Contact</a>
      </li>
    </ul>
  </nav>
);

export default Navbar;

import React, { useEffect, lazy, Suspense } from 'react'
import TypeWriter from '../../components/Typewriter'
import styled from "styled-components";
import Navbar from '../../components/Navbar'
import CbackgroundImage from '../../components/background.jpeg';
import {BallTriangle} from 'react-loader-spinner'
//https://oluwakayode.netlify.app/
//https://github.com/lollykrown/react-portfolio/tree/main
const Portfolio = lazy(() => import('../../components/Portfolio'));

function Home() {
    const words = [
        "Hi",
        `I'm Vedic`,
        "A Developer ",
        "A Researcher",
        "Data Scientist"
    ]

    useEffect(() => {
        document.body.style.backgroundColor='#000'
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return () => {
        }
    }, [])

    return (
        <HomeWrapper>
            <Navbar />
            <section className="top" style={{'backgroundImage':`url(${CbackgroundImage})`,'filter':'brightness(3)'}}>
                <div className="caption" >
                    <div className="box">
                        <h2 className=""><TypeWriter className="" texts={words} /> </h2>
                    </div>
                </div>
            </section>
            <div className="portfolio" id="portfolio" >
                <Suspense fallback={<BallTriangle
                    className="cen"
                    type="BallTriangle"
                    color="#000"
                    height={100}
                    width={100}
                    timeout={5000} //5 secs
                />}>
                    <Portfolio />
                </Suspense>
            </div>

            <section className="footer" id='contact'>
            
            <form
                action="https://formspree.io/f/xrbzgjql"
                method="POST"
                style={{position:'relative','bottom':'4.5rem'}}>
                <p className='col' style={{color:'black'}}>
                    Please contact me for any collaboration regarding research or projects.
                </p>
                <input type="text" name="name" placeholder='Name'></input>
                <input type="email" name="email" placeholder='Email'></input>
                <textarea name="message" placeholder='Message'></textarea>
                <button type="submit" className='btn-send'>Submit</button>
            </form>
                <h1>Contact</h1>
                <ul className="links">
                    <li className="icon"><a href="https://github.com/crazy-vedic"><i className="fa fa-github"></i></a></li>
                    <li className="icon"><a href="https://wa.me/+918766304030"><i className="fa fa-whatsapp "></i></a></li>
                </ul>
                <h3 className="email-label">Email</h3>
                <a className="email" href="mailto:vedic20052005@gmail.com">vedic20052005@gmail.com</a>

                <p className="footnotes">&copy; 2024 <a href="https://vedicvarma.com"
                    rel="noopener noreferrer" target="_blank">Vedic.</a> All rights reserved.</p>
            </section>
        </HomeWrapper >
    )
}

export default Home

const HomeWrapper = styled.div`
*{box-sizing:border-box}
.cen{
    margin: 36%;
    padding:5rem;
}
.top{
    height: 88vh;
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    box-shadow: inset 0 0 1000px 1000px rgba(0, 0, 0, 0.747);
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    z-index:1;
}

  .box{
    margin:0 auto;
    z-index:-1;
    padding-left:.5rem;
    width:400px;
    height:200px;
    border: 3px solid #ffffff;
  }
  .caption {
    display: flex;
    flex-direction: column;
    margin: auto;
    flex-grow: 1;
    width: 100%;
    justify-content: center;
    align-items: center;
  }
  h2{
      width:max-content;
      overflow-x:visible;
  }
  .caption h2 {
    text-align: center;
    font-size: 3rem;
    color: #fff;
  }
  .l{
      margin:0 auto;
  }

  .btn {
    font-size: 16px;
    border-radius: 3px;
  }
  .arrow{
      margin:0 auto 1.75rem auto;
      padding: 1rem;
  }
  .arrow:hover {
    background-color:rgba(255, 255, 255, 0.3);
    border-radius: 3rem;   
    cursor:grab;   
}
  
  .row {
    display:grid;
    grid-template-columns: 50% 50%;
    justify-items:center;
    padding-left:1.125rem;
  }
.img {
    width: 90%;
    height: 70%;
    margin-left: 1rem;
    z-index: 11;
    box-shadow: 5px 15px 15px 15px rgba(0,0,0,0.35)
}

.center {
    text-align:center;
    font-size: 3rem;
    text-shadow: 4px 4px 6px rgba(0,0,0,0.4);
}
.bg {
    width: 90%;
    height: 92%;
    position: absolute;
    left:0;
    top:2rem;
    z-index: -1;
}
.bg, .footer, .btn-send {
    color:#fff;
    background-color: #000fff;
    box-shadow: inset 0 0 1000px 1000px rgba(0, 0, 0, 0.747);
}
.footer {
    background-color: #000;
    padding: 1rem 5rem;
    margin-top: 2em;
}
.links{
    padding-inline-start: 0;
}
.links li{
    display: inline;
}
.icon {
    margin-right: 1.4rem;
}
a {
    color: #6d6d6d;
    font-size:1.25rem;
    text-decoration:none;
    transition: 2s linear;
}
a:hover {
    color: #fff;
    font-weight:500;
}
.form {
    position: relative;
    bottom: 4.5rem;
}
form {
    background-color: #fff;
    color: #ffffff;
    padding: 3em;
    width: 30%;
    float: right;
    box-shadow: 5px 10px 15px 10px rgba(0,0,0,0.7);
}
.col{
    color:#000;
}
input, textarea {
    width: 100%;
    border: none;
    border: 1px solid #000;
    background-color: rgba(0,0,0,0.075);
    color: #000;
}
input {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}
input:focus {
    border: none;
    border-bottom: 1px solid #d1d1d1;
  }
::placeholder,::-webkit-input-placeholder, :-ms-input-placeholder {
    color: #ffffff;
}

textarea {
    height: 4rem;
    margin-bottom: 1.75rem;
}
.btn-send {
    padding: .75em 4em;
    font-weight: 600;
    text-transform: uppercase;
    display: block;
    width: max-content;
}
.footnotes {
    margin-top: 3rem;
}

@media only screen and (max-width: 767px) { 
    .footer {
        padding: 1em 2rem;
    }
    .caption h2 {
        font-size: 1.5rem;
      }
      .box{
          width:220px;
          height:120px;
      }
    .top {
        height: 82vh;
      }
      .row {
          display:table;
        }
    .email, .email-label, .skype,.skype-label {
        display: none;
    }
    form {
        padding: 2em;
        width: 100%;
    }
    .fa:hover{
        font-size:1.35rem;
    }
}
@media only screen and (min-width: 768px) and (max-width: 991px) { 
    form {
        padding: 2em;
        width: 50%;
        padding: 10px;
    }
}
@media only screen and (min-width: 992px) and (max-width: 1200px) { 
    form {
        padding: 2em;
        width: 40%;
        padding: 10px;
    }
}

`;
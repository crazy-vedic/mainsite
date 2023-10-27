import React from 'react';
import './styles.css';

class Portfolio extends React.Component {
  // Function to handle theme change
  themeChange() {
    document.body.classList.toggle('dark-mode');
  }

  render() {
    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Vedic Varma</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <style>
          {`
            h3 {
              font-size: 20px;
            }
            div.main {
              display: flex;
              flex-direction: column;
            }
            li {
              font-size: 18px;
            }
          `}
        </style>
        <body>
          <main>
            <div className="topnav" id="topnav">
              <div id="title">
                <h1>Vedic Varma</h1>
              </div>
              <div className="socials">
                <button className="social" type="button">
                  <a
                    target="_blank"
                    href="https://www.linkedin.com/in/vedic-varma"
                    title="linkedin Icon"
                  >
                    <img
                      src="../../components/linkedin.png"
                      alt="linked in logo"
                      height="70"
                      width="70"
                    />
                  </a>
                </button>
                <button className="social" type="button">
                  <a
                    target="_blank"
                    href="https://github.com/jo-mamaa"
                    title="Github Icon"
                  >
                    <img
                      src="../../components/github.png"
                      alt="github logo"
                      height="70"
                      width="70"
                    />
                  </a>
                </button>
                <button className="social" type="button">
                  <a
                    target="_blank"
                    href="https://www.instagram.com/crazy._.vedic"
                    title="Instagram Icon"
                  >
                    <img
                      src="../../components/instagram.png"
                      alt="Instagram Icon"
                      width="70"
                      height="70"
                    />
                  </a>
                </button>
                <button className="theme" type="button" onClick={this.themeChange}>
                  <img
                    src="../../components/theme.png"
                    alt="button to change themes"
                    height="30"
                    width="30"
                  />
                </button>
              </div>
            </div>
            <div className="main">
              <h3>
                At a young age, I developed a strong interest in coding and software development due to my exposure to software through my father's profession. Over the past five years, I have gained experience in programming, primarily using Python and the most commonly used modules. My work includes developing Windows applications and integrating APIs with server applications. Although most of my work has been solo, I have collaborated with others frequently.

                Coding is my passion, and I often devote hours to a task until I can complete it. Collaborating with a partner enhances my programming and debugging abilities.

                I am eager to establish new connections and gain valuable on-site work experience in the computer science field. This is a goal that I have been striving for since the beginning of my journey in computer science.
              </h3>
              <div id="education">
                <div className="eduTitle">
                  <h1 className="eduTitle">EDUCATION</h1>
                </div>
                <h2 className="school">Sanskriti School ‘22</h2>
                <ul className="School">
                  <li>
                    Attained second rank and a trophy in an inter-school IT competition, Shri-Tech.
                  </li>
                  <li>
                    99.57 percentile in International English Olympiad, with 67th rank internationally.
                  </li>
                  <li>
                    Received international salary for solo, and team-based software, specialized in <br /> tkinter, discord.py, sql, google sheets api etc.
                  </li>
                  <li>Been an active contributor to the following clubs:</li>
                  <ol>
                    <li>Project Beta (CS club)</li>
                    <li>Neutrino (Physics club)</li>
                  </ol>
                </ul>

                <div>
                  <br />
                  <h2 className="college">Manipal University Jaipur ‘26</h2>
                  <div className="College">
                    <h4>Pursuing B.tech in CSE (Core).</h4>
                    <b>Aspiring MERN full stack developer:</b> Created multiple projects based on ReactJS, nodeJS, and expressJS
                    <h3>First Year:</h3>
                    <h4>A part of the working team at the official computer science club of MUJ, Randomize.</h4>
                    <h4>Completed a 2-month paid internship with a flourishing <a href="https://skello.in/">startup</a>, gaining hands-on experience <br /> in business, python-cloud functions, and user acquisitions.</h4>
                    Been an active member of events such as:<br />
                    <ul>
                      <li>Blood Donation Camp ‘22</li>
                      <li>Onerios</li>
                      <li>Randomize Hackathon</li>
                    </ul>
                    <h3>Second Year:</h3>
                    <h4>A part of the Core Committee, as the Head of Finance at the official computer science club of MUJ, Randomize.</h4>
                    <h4>Participated strongly in the competitive coding scene at <a href="https://www.codingninjas.com/studio/profile/crazylecious">Coding Ninjas</a></h4>
                  </div>
                </div>
              </div>
              <div>
                <h2>Skills:</h2>
                <ul>
                  <li>Proficient in Python and SQL.</li>
                  <li>Familiar with scripting in JS, nodeJS, reactJS, expressJS</li>
                  <li>Have a lot of experience in group (senior and junior dev) and individual programming projects.</li>
                  <li>Utilized flask to create server side APIs in linux.</li>
                  <li>Learned C language for general programming knowledge.</li>
                </ul>
              </div>
              <br />

              <h2>Projects:</h2>
              <a className="projects" href="https://vedicvarma.com/home/projects/rockpaperscissors.html" target="_blank">
                <h3><i>Rock Paper Scissors</i></h3>
              </a>
              <br />
              <a className="projects" href="https://vedicvarma.com/home/projects/calculator.html" target="_blank">
                <h3><i>Calculator</i></h3>
              </a>
              <br />
              <a className="projects" href="https://github.com/jo-mamaa/Library-Management-System" target="_blank">
                <h3><i>Detailed GUI-based library management system:</i></h3>
              </a>
              <br />
              <img id="LMS-png" src="../../components/libraryManagementSystem.png" alt="Library management system" height={300} width={600} />
              <br />
              Modules used: Tkinter, csv, sql, functools.
              <br />
              <br />
              <a className="projects" href="https://github.com/jo-mamaa/PVP-TOOL ">
                <h3><i>Multiple misc GUI based tkinter & flask projects performed in a group.</i></h3>
              </a>
              <a className="projects" href="https://github.com/jo-mamaa/bot_chain">
                <h3><i>Large async discord.py based discord bot majorly used for API and google sheets integration</i></h3>
              </a>
            </div>
          </main>
        </body>
      </html>
    );
  }
}

export default Portfolio;

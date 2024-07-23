import React from "react";
import styled from "styled-components";
import vid from "../components/pathfinding.mp4";
import lbmgmts from "../components/libraryManagementSystem.png";
import pgmt from "../components/PMGMTS.mp4";
import stella from "../components/stella.png";
const PortfolioContainer = styled.section`
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  font-family: Arial, sans-serif;
`;
const Section = styled.div`
  margin-bottom: 2rem;
`;
const SectionTitle = styled.h2`
  border-bottom: 2px solid #19f0ff;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  color: #19f0ff;
`;
const ProjectList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;
const ProjectItem = styled.a`
  width: 300px;
  margin: 1rem;
  text-decoration: none;
  color: #333;
  border: 1px solid #19f0ff;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;
const ProjectMedia = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
`;
const ProjectImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const ProjectVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const ProjectName = styled.h3`
  background: #19f0ff;
  color: #fff;
  padding: 0.5rem;
  text-align: center;
`;
const ProjectDescription = styled.p`
  padding: 1rem;
`;
const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;
const Skill = styled.div`
  width: 45%;
  margin-bottom: 1rem;
  background-color: #1e1e1e; /* Dark background color */
  padding: 1rem;
  border-radius: 8px;
  color: #fff; /* Text color for dark background */
`;
const ExperienceItem = styled.div`
  margin-bottom: 1.5rem;
  background-color: #1e1e1e; /* Dark background color */
  padding: 1rem;
  border-radius: 8px;
  color: #fff; /* Text color for dark background */
`;
const ExperienceTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #00c7eb; /* Text color for dark background */
`;
const CertificationItem = styled.a`
  display: block;
  margin-bottom: 0.5rem;
  color: #fff; /* Text color for dark background */
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Portfolio() {
  const projects = [
    {
      name: "GUI-Based Library Management System",
      description:
        "Developed a feature-rich Library Management System with sorting, filtering, and checking out functionalities using Python, Tkinter, and MySQL.",
      link: "https://github.com/crazy-vedic/Library-Management-System",
      imgUrl: lbmgmts,
    },
    {
      name: "Dell Hackathon: Smart Navigator",
      description:
        "Led the frontend development in React-Native. Won First Position in a 100-man hackathon.",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7156234041803837440/",
      imgUrl:
        "https://media.licdn.com/dms/image/D5622AQH0Xtbku34r4Q/feedshare-shrink_1280/0/1706179149521?e=1724889600&v=beta&t=sYlrDppsAcVmCSP0VniS2ep1oU-uE2SdMLG4kUovkLs",
    },
    {
      name: "Placement Management System",
      description:
        "Developed React and bare JavaScript versions to explore ReactJS workings.",
      link: "/projects/studentManagement",
      vidUrl: pgmt,
    },
    {
      name: "Discord Bot: Stella",
      description:
        'Developed Stella, a Python Discord bot for "torn.com" with international commissions and AWS hosting.',
      link: "#",
      imgUrl: stella,
    },
    {
      name: "Pathfinding Visualizer Research/Project",
      description:
        "Developed a Pathfinding Visualizer using Matplotlib and Tkinter for ML-based pathfinding research.",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7206898124106153984/",
      vidUrl: vid,
    },
    {
      name: "Sorting Algorithm Research",
      description:
        "Working on a variation of selection sort with <NlogN time complexity.",
      link: "",
    },
    {
      name: "Nth Root Estimation",
      description:
        "Developed an algorithm that can find the root of a number much faster than Newton-Rhapson technique.",
      link: "",
    },
  ];

  const skills = [
    {
      category: "Programming Languages",
      details: "Experienced: Python, JavaScript, C, Bash, Java",
    },
    {
      category: "Software Development",
      details:
        "Design Before Code methodology, GIT, Linux, Bash Scripting, DevOps Lifecycles",
    },
    {
      category: "Frameworks & Libraries",
      details: "Django, Flask, Win32API, React, React Native",
    },
    { category: "Languages", details: "English,  Hindi, Spanish" },
  ];

  const experience = [
    {
      role: "Full Stack Development Engineer",
      company: "SKELLO, New Delhi",
      duration: "May 2023 - July 2023",
      description:
        "Created a product backend, genAI wrapper for administrative assistance.",
    },
    {
      role: "Freelance Full Stack Web Developer",
      duration: "June 2023 – Current",
      description:
        "Developed MERN web pages for companies, creating landing pages for startups.",
    },
    {
      role: "Research Intern",
      company: "DRDO, GTRE",
      duration: "May 2024 – July 2024",
      description:
        "Optimized software for leading gas turbine engines. Researched an optimized square root algorithm.",
    },
  ];

  const certifications = [
    {
      title:
        "IBM Data Science Specialization - 10 Course Professional Certificate",
      link: "https://www.coursera.org/account/accomplishments/specialization/PRQQWA8847T4",
    },
    {
      title: "Full Stack Development with Geeks For Geeks - 10 Weeks",
      link: "https://media.geeksforgeeks.org/courses/certificates/2c6446cedfd50db8978af158d90bee02.pdf",
    },
    {
      title:
        "Google Cloud Computing Foundations with GenAI - 8 Course Certificate",
      link: "https://www.cloudskillsboost.google/public_profiles/8e7ee180-8824-43b6-aede-baeeb6e89cfc",
    },
    {
      title:
        "University of LEEDS An Introduction to Logic for Computer Science - 7 Hour Certificate",
      link: "https://www.coursera.org/account/accomplishments/verify/5VTALAQ2RNBN",
    },
    {
      title:
        "Vanderbilt University Introduction to Data, Signal, and Image Analysis with MATLAB - 24 Hour Certificate",
      link: "https://www.coursera.org/account/accomplishments/verify/L8NLG8A4MQ74",
    },
  ];

  return (
    <PortfolioContainer>
      <Section>
        <SectionTitle>Projects</SectionTitle>
        <ProjectList style={{justifyContent:'space-around'}}>
          {projects.map((project, index) => (
            <ProjectItem key={index} href={project.link}>
              <ProjectMedia>
                {project.vidUrl ? (
                  <ProjectVideo src={project.vidUrl} autoPlay muted loop />
                ) : (
                  <ProjectImage src={project.imgUrl} alt={project.name} />
                )}
              </ProjectMedia>
              <ProjectName>{project.name}</ProjectName>
              <ProjectDescription>{project.description}</ProjectDescription>
            </ProjectItem>
          ))}
        </ProjectList>
      </Section>
      <Section>
        <SectionTitle>Skills</SectionTitle>
        <SkillList>
          {skills.map((skill, index) => (
            <Skill key={index}>
              <h3>{skill.category}</h3>
              <p>{skill.details}</p>
            </Skill>
          ))}
        </SkillList>
      </Section>
      <Section>
        <SectionTitle>Experience</SectionTitle>
        {experience.map((exp, index) => (
          <ExperienceItem key={index}>
            <ExperienceTitle>{exp.role}</ExperienceTitle>
            <p>
              {exp.company ? `${exp.company} - ` : ""}
              {exp.duration}
            </p>
            <p>{exp.description}</p>
          </ExperienceItem>
        ))}
      </Section>
      <Section>
        <SectionTitle>Certifications</SectionTitle>
        {certifications.map((cert, index) => (
          <CertificationItem key={index} href={cert.link}>
            {cert.title}
          </CertificationItem>
        ))}
      </Section>
    </PortfolioContainer>
  );
}

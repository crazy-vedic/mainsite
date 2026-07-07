import CertificationsSection from './CertificationsSection';
import ContactSection from './ContactSection';
import ExperienceSection from './ExperienceSection';
import HashScrollHandler from './HashScrollHandler';
import Hero from './Hero';
import ProjectsSection from './ProjectsSection';
import ScrollScene from './ScrollScene';
import ScrollToTop from './ScrollToTop';
import SkillsSection from './SkillsSection';
import type { SiteContent } from '../types/content';

type HomePageProps = {
  content: SiteContent;
};

export default function HomePage({ content }: HomePageProps) {
  const { profile, projects, skills, experience, certifications, contact, siteConfig } = content;

  return (
    <div className="home-page">
      <HashScrollHandler />
      <ScrollScene />
      <Hero profile={profile} siteConfig={siteConfig} />
      <ProjectsSection projects={projects} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />
      <CertificationsSection certifications={certifications} />
      <ContactSection contact={contact} />
      <ScrollToTop />
    </div>
  );
}

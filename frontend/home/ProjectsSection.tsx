import { IconExternal } from '../icons';
import type { Project } from '../types/content';

type ProjectCardProps = {
  project: Project;
};

function ProjectCard({ project }: ProjectCardProps) {
  const { title, description, stack = [], media, link } = project;

  return (
    <article className="project-card">
      <div className="project-card__media">
        {media?.type === 'video' && media.src ? (
          <video src={media.src} muted loop playsInline autoPlay />
        ) : media?.type === 'image' && media.src ? (
          <img src={media.src} alt={title} loading="lazy" />
        ) : (
          <div className="project-card__media-fallback" aria-hidden="true">
            <span>{title.charAt(0) || '?'}</span>
          </div>
        )}
      </div>
      <div className="project-card__body">
        <h3>{title}</h3>
        <p>{description}</p>
        {stack.length > 0 && (
          <ul className="tag-list">
            {stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {link && (
          <a className="project-card__link" href={link} target="_blank" rel="noreferrer">
            View <IconExternal />
          </a>
        )}
      </div>
    </article>
  );
}

type ProjectsSectionProps = {
  projects: Project[];
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects.length) return null;

  return (
    <section className="section">
      <p className="eyebrow">{'// projects'}</p>
      <h2 id="projects" className="section__title">Projects</h2>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id || project.title} project={project} />
        ))}
      </div>
    </section>
  );
}

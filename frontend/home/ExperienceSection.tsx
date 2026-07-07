import type { ExperienceItem as ExperienceItemType } from '../types/content';

type ExperienceItemProps = {
  item: ExperienceItemType;
};

function ExperienceItem({ item }: ExperienceItemProps) {
  const bullets = Array.isArray(item.bullets) ? item.bullets : item.bullets ? [item.bullets] : [];

  return (
    <div className="experience-item">
      <div className="experience-item__meta">
        <span className="experience-item__dates">
          {item.start} - {item.end}
        </span>
      </div>
      <div className="experience-item__content">
        <h3>{item.role}</h3>
        <p className="experience-item__org">
          {item.company}
          {item.location ? ` · ${item.location}` : ''}
        </p>
        {bullets.length > 0 && (
          <ul>
            {bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type ExperienceSectionProps = {
  experience: ExperienceItemType[];
};

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
  if (!experience.length) return null;

  return (
    <section className="section">
      <p className="eyebrow">{'// experience'}</p>
      <h2 id="experience" className="section__title">Experience</h2>
      <div className="experience-list">
        {experience.map((item, index) => (
          <ExperienceItem key={index} item={item} />
        ))}
      </div>
    </section>
  );
}

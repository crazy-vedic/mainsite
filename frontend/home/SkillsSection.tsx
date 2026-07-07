import type { Skill } from '../types/content';

type SkillCardProps = {
  skill: Skill;
};

function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="skill-card">
      <h3>{skill.category}</h3>
      <p className="skill-card__list">
        {skill.note ? <span className="skill-card__note">{skill.note}: </span> : null}
        {skill.items?.join(', ')}
      </p>
    </div>
  );
}

type SkillsSectionProps = {
  skills: Skill[];
};

export default function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills.length) return null;

  return (
    <section className="section">
      <p className="eyebrow">{'// skills'}</p>
      <h2 id="skills" className="section__title">Skills</h2>
      <div className="skill-grid">
        {skills.map((skill) => (
          <SkillCard key={skill.category} skill={skill} />
        ))}
      </div>
    </section>
  );
}

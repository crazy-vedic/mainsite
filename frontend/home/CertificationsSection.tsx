import type { Certification } from '../types/content';

type CertificationRowProps = {
  cert: Certification;
};

function CertificationRow({ cert }: CertificationRowProps) {
  const content = (
    <>
      <span className="cert-row__title">{cert.title}</span>
      <span className="cert-row__meta">{[cert.provider, cert.duration].filter(Boolean).join(' · ')}</span>
    </>
  );

  return cert.link ? (
    <a className="cert-row cert-row--link" href={cert.link} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <div className="cert-row">{content}</div>
  );
}

type CertificationsSectionProps = {
  certifications: Certification[];
};

export default function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (!certifications.length) return null;

  return (
    <section className="section">
      <p className="eyebrow">{'// certifications'}</p>
      <h2 id="certifications" className="section__title">Certifications</h2>
      <div className="cert-list">
        {certifications.map((cert, index) => (
          <CertificationRow key={index} cert={cert} />
        ))}
      </div>
    </section>
  );
}

export type NavItem = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  initials: string;
  heroImage: string;
  resumeUrl: string;
  nav: NavItem[];
  roles?: string[];
};

export type ProjectMedia =
  | {
      type: 'image';
      src: string;
    }
  | {
      type: 'video';
      src: string;
    }
  | null;

export type Project = {
  id?: string;
  title: string;
  description: string;
  stack?: string[];
  media?: ProjectMedia;
  link?: string | null;
};

export type Skill = {
  category: string;
  note?: string | null;
  items?: string[];
};

export type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  bullets?: string[] | string;
};

export type Certification = {
  title: string;
  provider?: string | null;
  duration?: string | null;
  link?: string | null;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type Contact = {
  email?: string;
  phone?: string;
  formspreeEndpoint?: string;
  formIntro?: string;
  socials?: SocialLink[];
  footerName?: string;
  footerNote?: string;
};

export type ChatConfig = {
  enabled?: boolean;
  title?: string;
  greeting?: string;
  placeholder?: string;
};

export type SiteConfig = {
  chat?: ChatConfig;
};

export type SiteContent = {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  experience: ExperienceItem[];
  certifications: Certification[];
  contact: Contact;
  siteConfig: SiteConfig;
};

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatSectionLink = {
  intent: string;
  href: string;
  label: string;
};

export type ChatDonePayload = {
  reply: string;
  links: ChatSectionLink[];
  source?: string;
};

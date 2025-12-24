
export interface Project {
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  date: string;
  image?: string;
}

export interface Skill {
  name: string;
  description: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string[];
}

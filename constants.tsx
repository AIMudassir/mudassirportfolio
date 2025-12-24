
import { Project, SkillCategory, Experience } from './types';

export const PROJECTS: Project[] = [
  {
    title: "Synthetic Face Generation for Drug Abuse Detection",
    description: "Co-developed an AI system using BLIP, CLIP, and OpenCV for generating intelligent prompts from images to detect drug abuse indicators.",
    longDescription: "This research project focuses on the intersection of generative AI and medical diagnostics. By leveraging SDXL and custom LoRA weights, we synthesize facial datasets that exhibit specific physiological markers associated with long-term drug abuse. The pipeline involves automated prompt engineering via BLIP-2 and CLIP to ensure high-fidelity anatomical accuracy for clinical study support.",
    tags: ["SDXL", "LoRA", "PyTorch", "OpenCV"],
    date: "2025 - Present"
  },
  {
    title: "Environmental Data Processing",
    description: "Built a system to analyze air quality and Sentinel-2 imagery using MySQL, FFT, and image processing for pollution detection.",
    longDescription: "Utilizing satellite data from the Sentinel-2 mission, this project implements Fast Fourier Transforms (FFT) to analyze spectral signatures of atmospheric pollutants. The system integrates a robust MySQL backend to store temporal environmental data, visualized through a custom-built GUI that allows researchers to identify pollution hotspots in real-time.",
    tags: ["Python", "MySQL", "FFT", "Image Processing"],
    date: "2024 - 2025"
  },
  {
    title: "Sketch-to-Image Generation",
    description: "A diffusion-based pipeline that converts hand-drawn sketches into realistic images, deployed as an interactive Gradio app.",
    longDescription: "Developed during the peak of the diffusion model era, this project uses ControlNet architectures to provide structural guidance to pre-trained Stable Diffusion models. Users can draw simple line art which the system interprets and textures into high-resolution cinematic renders. The application was optimized for low-latency inference on consumer-grade GPUs.",
    tags: ["Diffusion Models", "Gradio", "Generative AI"],
    date: "2022"
  },
  {
    title: "Data Visualization using Tableau",
    description: "Analyzed complex datasets and created informative interactive dashboards for data-driven organizational insights.",
    longDescription: "Focused on business intelligence, this project involved cleaning and aggregating large-scale organizational datasets using SQL. The final product was a suite of interactive Tableau dashboards that enabled stakeholders to drill down into KPIs, resulting in a 15% increase in operational efficiency through better resource allocation.",
    tags: ["Tableau", "Data Analysis", "SQL"],
    date: "2021"
  }
];

export const SKILLS: SkillCategory[] = [
  {
    category: "AI & ML",
    skills: [
      { name: "Stable Diffusion", description: "Image synthesis & generative art models." },
      { name: "PyTorch", description: "Developing complex neural architectures." },
      { name: "LLMs", description: "Prompt engineering & RAG pipelines." },
      { name: "Generative AI", description: "Synthetic data & content generation." },
      { name: "Computer Vision", description: "Object detection & facial biometrics." }
    ]
  },
  {
    category: "Programming",
    skills: [
      { name: "Python", description: "Primary logic for AI/ML development." },
      { name: "C++", description: "Performance-critical system components." },
      { name: "JavaScript", description: "Interactive frontend & biometric UI." },
      { name: "SQL", description: "Relational database architecture." },
      { name: "Java", description: "Enterprise-grade backend logic." }
    ]
  },
  {
    category: "Data Tools",
    skills: [
      { name: "Tableau", description: "Interactive business intelligence." },
      { name: "Power BI", description: "Advanced KPI reporting & dashboarding." },
      { name: "Excel Pivot", description: "Quick data aggregation & analysis." },
      { name: "Pandas", description: "Data manipulation & preprocessing." },
      { name: "NumPy", description: "Scientific computing & matrix operations." }
    ]
  }
];

export const EXPERIENCES: Experience[] = [
  {
    role: "Database Developer Intern",
    company: "Naveena Group",
    period: "Jan 2021 - Feb 2021",
    description: [
      "Wrote complex Oracle queries to retrieve data efficiently.",
      "Designed and developed user-friendly forms for enhanced data entry."
    ]
  },
  {
    role: "Aurora Student Ambassador",
    company: "Université Paris-Est Créteil",
    period: "2024 - Present",
    description: [
      "Representing UPEC in the prestigious Aurora European University Alliance.",
      "Collaborating on international projects with peers across Europe."
    ]
  }
];

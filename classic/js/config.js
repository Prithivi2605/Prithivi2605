/* ============================================================
   PORTFOLIO CONFIG
   Edit this file to update the site and the interactive desk.
   Leave a string empty when you do not have that detail yet.
   Do not add achievements, grades, or project facts you cannot verify.
   ============================================================ */
const PORTFOLIO = {
  name: "Prithiviraj B",
  role: "Software Developer / Full-Stack Developer",
  shortRole: "Software Developer",

  /* Add your real address, for example "you@domain.com". */
  email: "",
  /* Optional. Leave empty to hide it. */
  phone: "",

  /* Full https URLs. Leave empty until you have them. */
  github: "",
  linkedin: "",

  /* Put the real PDF at this path, then the download button will use it. */
  resumePath: "assets/Prithiviraj-B-Resume.pdf",

  intro:
    "I build useful web applications and like solving practical problems, from the screen a person uses through to the data behind it.",
  context:
    "Final-year engineering student at KCT, Coimbatore. Software Developer Intern at BINI from July 2025 to January 2026.",

  about: [
    "I am a final-year engineering student at KCT, Coimbatore. I spend my time learning how software is put together, and I care most about applications that do a clear job for someone.",
    "From July 2025 to January 2026 I worked as a Software Developer Intern at BINI. I developed dynamic web pages with C# .NET and MySQL, which meant connecting what a person sees to data stored in a database.",
    "I am interested in full-stack development, AI-powered applications, backend development, databases, and the practical side of software engineering. I learn by building, then going back and making the rough parts clearer."
  ],

  interests: [
    "Full-stack development",
    "AI-powered applications",
    "Backend development",
    "Databases",
    "Practical software engineering"
  ],

  education: {
    institution: "KCT, Coimbatore",
    status: "Final-year engineering student",
    /* Fill these in when you want them on the page. Leave blank to hide them. */
    degree: "",
    department: "",
    graduationYear: "",
    notes: ""
  },

  experience: [
    {
      id: "bini",
      role: "Software Developer Intern",
      organization: "BINI",
      start: "July 2025",
      end: "January 2026",
      responsibilities: [
        "Developed dynamic web pages using C# .NET and MySQL."
      ],
      technologies: ["C# .NET", "MySQL"]
    }
  ],

  /* Hide the whole section while this array is empty. */
  achievements: [
    /* { title: "", issuer: "", date: "", summary: "", url: "" } */
  ],

  skillGroups: [
    {
      name: "Frontend",
      skills: [
        { name: "HTML", short: "HTML", bg: "#E34F26", fg: "#fff" },
        { name: "CSS", short: "CSS", bg: "#1572B6", fg: "#fff" },
        { name: "JavaScript", short: "JS", bg: "#F7DF1E", fg: "#1a1a1a" },
        { name: "React.js", short: "Re", bg: "#087EA4", fg: "#fff" }
      ]
    },
    {
      name: "Backend",
      skills: [
        { name: "Node.js", short: "Node", bg: "#339933", fg: "#fff" },
        { name: "Express.js", short: "Ex", bg: "#222222", fg: "#fff" },
        { name: "C# .NET", short: ".NET", bg: "#512BD4", fg: "#fff" }
      ]
    },
    {
      name: "Programming",
      skills: [
        { name: "Java", short: "Java", bg: "#E76F00", fg: "#fff" },
        { name: "Python", short: "Py", bg: "#3776AB", fg: "#fff" },
        { name: "C", short: "C", bg: "#3949AB", fg: "#fff" }
      ]
    },
    {
      name: "Databases",
      skills: [
        { name: "MySQL", short: "SQL", bg: "#00758F", fg: "#fff" },
        { name: "MongoDB", short: "Mg", bg: "#1E6F3F", fg: "#fff" },
        { name: "PostgreSQL / Supabase", short: "PG", bg: "#336791", fg: "#fff" }
      ]
    },
    {
      name: "Tools and technologies",
      skills: [
        { name: "Git", short: "Git", bg: "#F05032", fg: "#fff" },
        { name: "GitHub", short: "GH", bg: "#24292F", fg: "#fff" },
        { name: "REST APIs", short: "API", bg: "#0F6E56", fg: "#fff" },
        { name: "Firebase Authentication", short: "Auth", bg: "#B45309", fg: "#fff" }
      ]
    }
  ],

  projects: [
    {
      id: "p-merchant",
      enabled: true,
      name: "Merchant Mind",
      summary: "An inventory management system for grocery shops.",
      description: "Merchant Mind is an inventory management system for grocery shops.",
      features: [],
      stack: [],
      github: "",
      demo: "",
      image: "",
      status: "",
      accent: "#1f7a4d",
      tint: "#e7f6ee",
      illustration: "merchant"
    },
    {
      id: "p-analyzer",
      enabled: true,
      name: "Resume Analyzer",
      summary: "A web application that extracts resume skills, analyzes how often they appear, and generates a skill score.",
      description: "Resume Analyzer is a web application that extracts skills from a resume, analyzes skill frequency, and generates a skill score.",
      features: [
        "Extracts skills from a resume",
        "Analyzes how often those skills appear",
        "Generates a skill score"
      ],
      stack: [],
      github: "",
      demo: "",
      image: "",
      status: "",
      accent: "#5b2bb8",
      tint: "#f3eefe",
      illustration: "analyzer"
    },
    {
      id: "p-hallora",
      enabled: true,
      name: "Hallora",
      summary: "",
      description: "",
      features: [],
      stack: [],
      github: "",
      demo: "",
      image: "",
      status: "Description and technology stack still to be added",
      accent: "#24518f",
      tint: "#e8f0fb",
      illustration: "hallora"
    },
    {
      id: "p-soulsync",
      enabled: true,
      name: "SoulSync",
      summary: "",
      description: "",
      features: [],
      stack: [],
      github: "",
      demo: "",
      image: "",
      status: "Details to be confirmed",
      accent: "#8a3d62",
      tint: "#fdeff4",
      illustration: "soulsync"
    },
    {
      id: "p-line",
      enabled: true,
      name: "Line Follower Robot",
      summary: "An autonomous robot that follows a line using a microcontroller, reflectance sensors, a motor driver, and PID-based control.",
      description: "Line Follower Robot is an autonomous robotics project. It follows a line using a microcontroller, reflectance sensors, a motor driver, and PID-based control.",
      features: [
        "Autonomous line following",
        "Reflectance sensors",
        "Motor driver",
        "PID-based control"
      ],
      stack: ["Microcontroller", "Reflectance sensors", "Motor driver", "PID-based control"],
      github: "",
      demo: "",
      image: "",
      status: "",
      accent: "#1e3a5f",
      tint: "#e7eef6",
      illustration: "robot"
    }
  ]
};

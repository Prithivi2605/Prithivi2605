/** Edit this file to update the desk and the viewers. Leave a string empty when you do not have that detail yet. */
export const portfolio = {
  name: "Prithiviraj B",
  role: "Full-Stack Developer | Web Developer",
  shortRole: "Full-Stack Developer",
  email: "prithivirajb26@gmail.com",
  phone: "7339044516",
  github: "",
  linkedin: "",
  resumePath: "/resume/Prithiviraj-B-Resume.pdf",
  summary: "Final-year Computer Science and Engineering student with hands-on experience in full-stack web development and ASP.NET MVC application development. Skilled in React.js, Node.js, Express.js, MySQL, and REST APIs, with project experience in inventory management, examination seating automation, and machine learning-based sentiment analysis. Familiar with database management, version control using Git, and developing web applications to solve practical problems. Seeking an entry-level Full-Stack Developer or Software Developer role.",
  about: [
    "Final-year Computer Science and Engineering student with hands-on experience in full-stack web development and ASP.NET MVC application development. Skilled in React.js, Node.js, Express.js, MySQL, and REST APIs, with project experience in inventory management, examination seating automation, and machine learning-based sentiment analysis.",
    "Familiar with database management, version control using Git, and developing web applications to solve practical problems. Seeking an entry-level Full-Stack Developer or Software Developer role."
  ],
  interests: ["Full-Stack Development", "Emerging Technologies"],
  softSkills: ["Problem Solving", "Analytical Thinking", "Team Collaboration", "Adaptive Learning", "Technical Communication"],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Tamil", level: "Fluent" },
    { name: "Hindi", level: "Basic" }
  ],
  education: [
    {
      degree: "B.E. — Computer Science and Engineering",
      institution: "Kumaraguru College of Technology, Coimbatore",
      years: "2023 – 2027",
      score: "CGPA: 7.74/10"
    },
    {
      degree: "Higher Secondary Education",
      institution: "Little Flower Matric Higher Secondary School",
      years: "2019 – 2023",
      score: "Percentage: 93.67%"
    }
  ],
  experience: [
    {
      id: "bini",
      role: "Junior Web Developer Intern",
      organization: "Wander With Food | BINI",
      start: "July 2025",
      end: "January 2026",
      responsibilities: [
        "Developed new webpages and integrated them into an ongoing web application using ASP.NET MVC and C#.",
        "Worked with SQL queries and database integration to support application functionality.",
        "Performed application testing, identified bugs and errors, and reported issues for resolution.",
        "Collaborated with developers using Git to integrate code from different modules and improve code quality."
      ],
      technologies: ["ASP.NET MVC", "C#", "SQL", "Git"]
    }
  ],
  achievements: [],
  certifications: [
    { id: "cert-ml", title: "Machine Learning Techniques", issuer: "Coursera", year: "2026" },
    { id: "cert-aws", title: "AWS Academy Graduate — Cloud Foundations", issuer: "", year: "2025" },
    { id: "cert-algo", title: "Algorithmic Thinking", issuer: "Rice University", year: "2024" }
  ],
  skillGroups: [
    {
      name: "Programming Languages",
      skills: [
        { name: "Java", short: "Java", bg: "#E76F00", fg: "#fff" },
        { name: "JavaScript", short: "JS", bg: "#F7DF1E", fg: "#1a1a1a" },
        { name: "Python", short: "Py", bg: "#3776AB", fg: "#fff" },
        { name: "C", short: "C", bg: "#3949AB", fg: "#fff" }
      ]
    },
    {
      name: "Web Development and Backend",
      skills: [
        { name: "React.js", short: "Re", bg: "#087EA4", fg: "#fff" },
        { name: "Node.js", short: "Node", bg: "#339933", fg: "#fff" },
        { name: "Express.js", short: "Ex", bg: "#222222", fg: "#fff" },
        { name: "ASP.NET MVC", short: "ASP", bg: "#512BD4", fg: "#fff" },
        { name: "REST APIs", short: "API", bg: "#0F6E56", fg: "#fff" }
      ]
    },
    {
      name: "Databases",
      skills: [
        { name: "MySQL", short: "SQL", bg: "#00758F", fg: "#fff" },
        { name: "MongoDB", short: "Mg", bg: "#1E6F3F", fg: "#fff" }
      ]
    },
    {
      name: "Developer Tools and Platforms",
      skills: [
        { name: "Git", short: "Git", bg: "#F05032", fg: "#fff" },
        { name: "GitHub", short: "GH", bg: "#24292F", fg: "#fff" },
        { name: "Firebase", short: "Fb", bg: "#FFCA28", fg: "#1a1a1a" },
        { name: "AWS", short: "AWS", bg: "#FF9900", fg: "#1a1a1a" },
        { name: "Microsoft Azure", short: "Az", bg: "#0078D4", fg: "#fff" },
        { name: "Docker", short: "Dk", bg: "#2496ED", fg: "#fff" }
      ]
    },
    {
      name: "Computer Science Fundamentals",
      skills: [
        { name: "Object-Oriented Programming (OOP)", short: "OOP", bg: "#243056", fg: "#fff" },
        { name: "Database Management Systems (DBMS)", short: "DBMS", bg: "#0F6E56", fg: "#fff" },
        { name: "Data Structures and Algorithms (DSA)", short: "DSA", bg: "#5b2bb8", fg: "#fff" },
        { name: "Operating Systems", short: "OS", bg: "#3d4a3a", fg: "#fff" },
        { name: "Computer Networks", short: "CN", bg: "#24518f", fg: "#fff" }
      ]
    }
  ],
  projects: [
    {
      id: "p-merchant",
      enabled: true,
      name: "Merchant Mind",
      subtitle: "Inventory Management System",
      summary: "A full-stack inventory management application to track product availability, manage stock levels, and handle orders.",
      description: "Developed a full-stack inventory management application to track product availability, manage stock levels, and handle orders.",
      features: [
        "Developed a full-stack inventory management application to track product availability, manage stock levels, and handle orders.",
        "Implemented backend functionality using Node.js and Express.js to support inventory-related operations.",
        "Used MySQL to store and manage inventory and order data.",
        "Implemented low-stock notification functionality to help identify products requiring replenishment."
      ],
      stack: ["React.js", "Node.js", "Express.js", "MySQL"],
      github: "",
      demo: "",
      image: "",
      status: "",
      accent: "#1f7a4d",
      tint: "#e7f6ee",
      c1: "#bfe0cf",
      c2: "#2f7d62",
      sticker: "cat",
      art: "merchant"
    },
    {
      id: "p-hallora",
      enabled: true,
      name: "Hallora",
      subtitle: "Examination Seating Management System",
      summary: "A web-based examination seating management system that automates student seat allocation and examination hall assignment.",
      description: "Designed and developed a web-based examination seating management system to automate student seat allocation and examination hall assignment.",
      features: [
        "Designed and developed a web-based examination seating management system to automate student seat allocation and examination hall assignment.",
        "Implemented seating allocation functionality to generate arrangements for 500+ students.",
        "Used MySQL to manage examination-related data and support database operations.",
        "Developed the application using React.js for the frontend and Node.js with Express.js for backend functionality."
      ],
      stack: ["React.js", "Node.js", "Express.js", "MySQL"],
      github: "",
      demo: "",
      image: "",
      status: "",
      accent: "#24518f",
      tint: "#e8f0fb",
      c1: "#c5d7f2",
      c2: "#24518f",
      sticker: "crystal",
      art: "hallora"
    },
    {
      id: "p-sentisense",
      enabled: true,
      name: "SentiSense",
      subtitle: "Sentiment Analysis System",
      summary: "A sentiment analysis application that classifies user-submitted text as positive or negative.",
      description: "Developed a sentiment analysis application to classify user-submitted text as positive or negative.",
      features: [
        "Developed a sentiment analysis application to classify user-submitted text as positive or negative.",
        "Combined TF-IDF and Byte Pair Encoding (BPE) features for text representation.",
        "Implemented Logistic Regression for sentiment classification.",
        "Built a Flask backend and React.js interface to process text input and display predictions, confidence scores, and influential keywords."
      ],
      stack: ["Python", "Flask", "React.js", "Hugging Face Tokenizers", "Scikit-learn"],
      github: "",
      demo: "",
      image: "",
      status: "",
      accent: "#8a3d62",
      tint: "#fdeff4",
      c1: "#f7c9d8",
      c2: "#8a3d62",
      sticker: "bear",
      art: "sentisense"
    }
  ]
};

export const activeProjects = portfolio.projects.filter((project) => project.enabled !== false);

export const tourStops = [
  ["about", "Prithiviraj B is a final-year Computer Science and Engineering student building full-stack web applications."],
  ["p-merchant", "Merchant Mind tracks stock, orders, and low-stock alerts with React.js, Node.js, Express.js, and MySQL."],
  ["p-hallora", "Hallora automates examination seating and can generate arrangements for 500+ students."],
  ["p-sentisense", "SentiSense classifies text as positive or negative with Python, Flask, and React.js."],
  ["timeline", "Junior Web Developer Intern at Wander With Food | BINI, July 2025 to January 2026, using ASP.NET MVC and C#."],
  ["skillcard", "The skill chips match the resume: languages, web and backend, databases, tools, and fundamentals."],
  ["resume", "Open the resume sheet for education, projects, the internship, and certifications."],
  ["biz", "Email is prithivirajb26@gmail.com. Phone is 7339044516. LinkedIn and GitHub URLs are not added yet."]
];

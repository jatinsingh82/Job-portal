import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const salt = bcrypt.genSaltSync(10);
const demoPasswordHash = bcrypt.hashSync("password123", salt);

const initialUsers = [
  {
    _id: "emp_demo_1",
    name: "Sarah Jenkins",
    email: "employer@jobportal.com",
    phone: "4155551234",
    password: demoPasswordHash,
    role: "Employer",
    company: "Apex Technologies",
    title: "Head of People & Talent Acquisition",
    bio: "Apex Technologies is a leading cloud infrastructure and enterprise intelligence provider, building high-scale distributed software for global clients.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    savedJobs: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
  },
  {
    _id: "seeker_demo_1",
    name: "Alex Rivera",
    email: "seeker@jobportal.com",
    phone: "4155556789",
    password: demoPasswordHash,
    role: "Job Seeker",
    title: "Senior Full Stack Engineer",
    bio: "Passionate software engineer with 6+ years specializing in React, Node.js, TypeScript, and scalable cloud systems. Experienced in leading agile teams and architecting modern web platforms.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    preferredLocation: "San Francisco, CA or Remote",
    preferredJobType: "Full-time",
    skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "MongoDB", "PostgreSQL", "Docker", "AWS", "GraphQL", "Next.js"],
    education: [
      {
        school: "University of California, Berkeley",
        degree: "B.S. in Computer Science",
        fieldOfStudy: "Software Engineering & Distributed Systems",
        startYear: "2015",
        endYear: "2019",
      },
    ],
    experience: [
      {
        company: "Starlight Cloud Platforms",
        title: "Senior Full Stack Engineer",
        location: "San Francisco, CA (Hybrid)",
        startDate: "2021",
        endDate: "Present",
        current: true,
        description: "Spearheaded frontend migration to React 18 & TypeScript, reducing bundle size by 35%. Designed resilient Node.js microservices handling 25M+ monthly API queries.",
      },
      {
        company: "Nova Digital Innovations",
        title: "Frontend Software Engineer",
        location: "San Jose, CA",
        startDate: "2019",
        endDate: "2021",
        current: false,
        description: "Developed core dashboard components and analytics workflows with React, Redux, and Chart.js. Mentored 4 junior engineers.",
      },
    ],
    projects: [
      {
        title: "OmniDash Analytics",
        description: "High-throughput operational telemetry dashboard with real-time WebSocket feeds and custom time-series visualization.",
        link: "https://github.com/example/omnidash",
      },
      {
        title: "CloudVault Storage",
        description: "Encrypted distributed file synchronization service built with Node.js and AWS S3.",
        link: "https://github.com/example/cloudvault",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        year: "2023",
      },
      {
        name: "Professional Scrum Master I (PSM I)",
        issuer: "Scrum.org",
        year: "2022",
      },
    ],
    resume: {
      name: "Alex_Rivera_Senior_FullStack_Resume.pdf",
      url: "/CVs/cv1.jpg",
      public_id: "demo_resume_1",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      size: "245 KB",
    },
    savedJobs: ["job_seed_1", "job_seed_3"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
  },
];

const initialJobs = [
  {
    _id: "job_seed_1",
    title: "Senior Full Stack Engineer",
    company: "Apex Technologies",
    description: "Apex Technologies is looking for a Senior Full Stack Engineer to join our core product team. You will lead the development of our enterprise cloud orchestrator, building intuitive customer-facing interfaces and high-performance server APIs.",
    responsibilities: "• Architect and ship scalable features using React, Node.js, and TypeScript.\n• Collaborate with product managers, UX designers, and platform engineers.\n• Optimize database queries and API response latencies.\n• Mentor mid-level and junior software engineers in best coding practices.",
    requirements: "• 5+ years experience building production web applications.\n• Strong mastery of modern JavaScript/TypeScript, React, and Node.js.\n• Experience with relational or NoSQL database modeling.\n• Experience with containerized deployments (Docker / Kubernetes).",
    benefits: ["Comprehensive medical, dental, and vision insurance", "401(k) matching up to 5%", "$2,500 annual learning & conference stipend", "Flexible remote work and home office setup budget"],
    category: "Web Development",
    employmentType: "Full-time",
    workMode: "Remote",
    experienceLevel: "Senior Level",
    skills: ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
    country: "United States",
    city: "San Francisco",
    location: "San Francisco, CA (Remote Allowed)",
    salaryFrom: 135000,
    salaryTo: 175000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_2",
    title: "Mobile Application Developer",
    company: "Vanguard Health Systems",
    description: "Vanguard Health Systems creates digital health solutions empowering millions of patients. We are seeking a Mobile Developer to design and engineer state-of-the-art iOS and Android applications.",
    responsibilities: "• Build cross-platform patient portal and telemedicine mobile apps.\n• Integrate Bluetooth health monitors and wearable APIs.\n• Ensure strict HIPAA compliance and secure data encryption standards.\n• Maintain test automation pipelines for mobile releases.",
    requirements: "• 3+ years experience with React Native or Flutter.\n• Deep knowledge of native iOS (Swift) or Android (Kotlin) bridging.\n• Experience delivering consumer-facing applications on App Store / Google Play.\n• Strong background in RESTful APIs and offline-first data sync.",
    benefits: ["Health, Vision & Dental Coverage with zero deductible", "Annual wellness allowance and gym membership", "Generous PTO (25 days + federal holidays)"],
    category: "Mobile App Development",
    employmentType: "Full-time",
    workMode: "Hybrid",
    experienceLevel: "Mid Level",
    skills: ["React Native", "iOS", "Android", "TypeScript", "REST APIs"],
    country: "United States",
    city: "Austin",
    location: "Austin, TX (2 days in-office)",
    fixedSalary: 115000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_3",
    title: "Lead UI/UX Product Designer",
    company: "Starlight Digital Studio",
    description: "Starlight Digital Studio is seeking a visionary Lead UI/UX Product Designer to drive our design system and create engaging, accessible digital journeys for high-growth SaaS brands.",
    responsibilities: "• Own user research, wireframing, high-fidelity prototypes, and component design tokens in Figma.\n• Partner closely with frontend engineering to ensure pixel-perfect fidelity.\n• Establish design consistency across web, tablet, and mobile platforms.\n• Lead user testing sessions and synthesize feedback into actionable roadmap items.",
    requirements: "• 5+ years of UI/UX design experience for SaaS or digital products.\n• Exceptional portfolio demonstrating complex UX flows and modern visual design.\n• Expert mastery of Figma, prototyping, and design systems.\n• Strong understanding of WCAG accessibility standards.",
    benefits: ["Competitive equity options", "Unlimited PTO policy", "Top-tier MacBook Pro and 4K display equipment allowance"],
    category: "Graphics & Design",
    employmentType: "Full-time",
    workMode: "Remote",
    experienceLevel: "Senior Level",
    skills: ["Figma", "UI Design", "UX Research", "Design Systems", "Prototyping"],
    country: "United States",
    city: "New York",
    location: "New York, NY (Remote)",
    salaryFrom: 120000,
    salaryTo: 155000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_4",
    title: "DevOps & Cloud Platform Specialist",
    company: "CloudScale Networks",
    description: "Join CloudScale Networks to scale our multi-region Kubernetes clusters, enforce zero-trust security postures, and streamline continuous delivery for over 200 microservices.",
    responsibilities: "• Maintain Terraform infrastructure-as-code across AWS and Google Cloud.\n• Optimize CI/CD pipelines with GitHub Actions and ArgoCD.\n• Monitor telemetry with Prometheus, Grafana, and Datadog.\n• Collaborate with security teams on vulnerability patching and disaster recovery.",
    requirements: "• 4+ years in DevOps, SRE, or Cloud Infrastructure roles.\n• Hands-on mastery of Kubernetes, Docker, and Terraform.\n• Experience with AWS networking (VPCs, Transit Gateways, IAM).\n• Proficient in Python, Bash, or Go for automation scripting.",
    benefits: ["100% remote flexibility with quarterly team retreats", "Performance bonus paid bi-annually", "Home internet and mobile reimbursement"],
    category: "DevOps",
    employmentType: "Full-time",
    workMode: "Remote",
    experienceLevel: "Senior Level",
    skills: ["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD", "Prometheus"],
    country: "United States",
    city: "Seattle",
    location: "Seattle, WA (Remote)",
    fixedSalary: 145000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_5",
    title: "AI & Machine Learning Solutions Architect",
    company: "Apex Technologies",
    description: "Architect and deploy cutting-edge generative AI models, intelligent retrieval agents, and low-latency inference pipelines serving enterprise customers at Apex Technologies.",
    responsibilities: "• Design RAG (Retrieval-Augmented Generation) architectures and fine-tuning pipelines.\n• Deploy scalable model endpoints using PyTorch, ONNX, and vLLM.\n• Evaluate model accuracy, hallucination rates, and safety guardrails.\n• Partner with product teams to embed generative intelligence into SaaS workflows.",
    requirements: "• Master's or 4+ years practical experience in ML / AI engineering.\n• Deep familiarity with Transformer architectures, Vector DBs, and Python.\n• Experience deploying models in cloud environments with GPU clusters.\n• Solid understanding of software design patterns and API design.",
    benefits: ["Competitive base salary + significant equity grant", "Sponsored conference attendance (NeurIPS, ICML, CVPR)", "Relocation assistance available"],
    category: "Artificial Intelligence",
    employmentType: "Full-time",
    workMode: "Hybrid",
    experienceLevel: "Lead / Director",
    skills: ["Python", "PyTorch", "LLMs", "Vector DBs", "Machine Learning", "Docker"],
    country: "United States",
    city: "Boston",
    location: "Boston, MA (Kendall Square Innovation Hub)",
    salaryFrom: 160000,
    salaryTo: 210000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_6",
    title: "Junior Frontend Engineer (React)",
    company: "NextWave Interactive",
    description: "Launch your engineering career at NextWave Interactive! We are looking for an energetic Junior Frontend Engineer eager to learn, build responsive components, and collaborate with experienced mentors.",
    responsibilities: "• Build user-facing features using React, Tailwind CSS, and HTML5.\n• Participate in code reviews and pair programming sessions.\n• Write clean unit and integration tests with Vitest and React Testing Library.\n• Debug cross-browser issues and optimize client-side rendering.",
    requirements: "• 0-2 years experience with JavaScript and React.\n• Solid understanding of HTML, CSS, and modern responsive layouts.\n• Familiarity with Git version control.\n• High curiosity, eagerness to learn, and strong communication skills.",
    benefits: ["Dedicated senior engineer mentorship program", "Annual hardware stipend", "Full health and dental insurance"],
    category: "Web Development",
    employmentType: "Full-time",
    workMode: "On-site",
    experienceLevel: "Entry Level",
    skills: ["React", "JavaScript", "HTML/CSS", "Tailwind CSS", "Git"],
    country: "United States",
    city: "Chicago",
    location: "Chicago, IL (Loop Tech Center)",
    salaryFrom: 70000,
    salaryTo: 88000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_7",
    title: "Software Engineering Intern (Summer 2026)",
    company: "Apex Technologies",
    description: "Join Apex Technologies for an immersive 12-week paid summer internship. Work directly on production features alongside our core engineering teams, with mentorship, tech talks, and project presentations.",
    responsibilities: "• Develop backend microservices or frontend web features.\n• Work directly in production codebases following industry best practices.\n• Present end-of-internship capstone project to company engineering leadership.",
    requirements: "• Currently enrolled in a B.S./M.S. program in Computer Science or related STEM field.\n• Basic knowledge of data structures, algorithms, and web programming.\n• Excited to solve real-world problems in distributed systems.",
    benefits: ["Competitive hourly compensation ($45/hr)", "Intern housing assistance stipend", "Full-time return offer opportunities for top performers"],
    category: "Web Development",
    employmentType: "Internship",
    workMode: "Hybrid",
    experienceLevel: "Entry Level",
    skills: ["Python", "JavaScript", "Git", "Problem Solving"],
    country: "United States",
    city: "San Francisco",
    location: "San Francisco, CA",
    fixedSalary: 52000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    postedBy: "emp_demo_1",
  },
  {
    _id: "job_seed_8",
    title: "Data Analyst & Business Intelligence",
    company: "Nexus Analytics",
    description: "Nexus Analytics is looking for a data enthusiast to translate complex multi-source business data into actionable executive insights, dashboards, and automated forecasting reports.",
    responsibilities: "• Build SQL queries, data transformations, and automated ETL pipelines.\n• Develop interactive executive dashboards in Tableau and PowerBI.\n• Perform cohort retention analyses and marketing funnel optimizations.\n• Present findings to C-suite and department directors.",
    requirements: "• 2+ years experience in business analytics or data analysis.\n• Advanced SQL proficiency and experience with relational warehouses.\n• Proficiency in Python (pandas, numpy) or R.\n• Experience with BI visualization tools (Tableau, Looker, or PowerBI).",
    benefits: ["Comprehensive medical and retirement plans", "Generous parental leave", "Education reimbursement"],
    category: "Data Science & Analytics",
    employmentType: "Full-time",
    workMode: "Hybrid",
    experienceLevel: "Mid Level",
    skills: ["SQL", "Python", "Tableau", "PowerBI", "Data Analysis"],
    country: "United States",
    city: "Denver",
    location: "Denver, CO",
    salaryFrom: 85000,
    salaryTo: 110000,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
    status: "active",
    expired: false,
    jobPostedOn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    postedBy: "emp_demo_1",
  },
];

const initialApplications = [
  {
    _id: "app_seed_1",
    jobId: "job_seed_1",
    jobTitle: "Senior Full Stack Engineer",
    company: "Apex Technologies",
    name: "Alex Rivera",
    email: "seeker@jobportal.com",
    coverLetter: "I am thrilled to apply for the Senior Full Stack Engineer role at Apex Technologies. With 6 years of engineering experience across React, Node.js, and distributed cloud services, I have consistently delivered robust, scalable platforms and intuitive user experiences. I look forward to contributing to your team's mission.",
    phone: "4155556789",
    address: "742 Evergreen Terrace, San Francisco, CA",
    resume: {
      public_id: "demo_resume_1",
      url: "/CVs/cv1.jpg",
      name: "Alex_Rivera_Senior_FullStack_Resume.pdf",
      size: "245 KB",
    },
    applicantID: {
      user: "seeker_demo_1",
      role: "Job Seeker",
    },
    employerID: {
      user: "emp_demo_1",
      role: "Employer",
    },
    status: "Interview",
    interview: {
      scheduled: true,
      date: "2026-10-05",
      time: "14:00 PST",
      type: "Video Call",
      link: "https://meet.google.com/abc-defg-hij",
      notes: "Technical deep-dive on architecture and live coding session with engineering manager.",
    },
    timeline: [
      {
        status: "Applied",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        note: "Application submitted successfully.",
      },
      {
        status: "Under Review",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        note: "Resume and project portfolio reviewed by hiring team.",
      },
      {
        status: "Shortlisted",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        note: "Selected for technical interview round.",
      },
      {
        status: "Interview",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        note: "Technical interview scheduled with Lead Architect.",
      },
    ],
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    _id: "app_seed_2",
    jobId: "job_seed_3",
    jobTitle: "Lead UI/UX Product Designer",
    company: "Starlight Digital Studio",
    name: "Alex Rivera",
    email: "seeker@jobportal.com",
    coverLetter: "I have been following Starlight Digital Studio's design innovations and would love to bring my systems design and interactive prototyping expertise to your team.",
    phone: "4155556789",
    address: "742 Evergreen Terrace, San Francisco, CA",
    resume: {
      public_id: "demo_resume_1",
      url: "/CVs/cv1.jpg",
      name: "Alex_Rivera_Design_Resume.pdf",
      size: "245 KB",
    },
    applicantID: {
      user: "seeker_demo_1",
      role: "Job Seeker",
    },
    employerID: {
      user: "emp_demo_1",
      role: "Employer",
    },
    status: "Under Review",
    interview: {
      scheduled: false,
      date: "",
      time: "",
      type: "Video Call",
      link: "",
      notes: "",
    },
    timeline: [
      {
        status: "Applied",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        note: "Application submitted.",
      },
      {
        status: "Under Review",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        note: "Portfolio currently under review by Design Lead.",
      },
    ],
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
];

export const users = [...initialUsers];
export const jobs = [...initialJobs];
export const applications = [...initialApplications];

function makeUserDoc(u, includePassword = false) {
  if (!u) return null;
  const clone = JSON.parse(JSON.stringify(u));
  if (!includePassword) {
    delete clone.password;
  }
  clone.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, u.password);
  };
  clone.getJWTToken = function () {
    return jwt.sign(
      { id: u._id },
      process.env.JWT_SECRET_KEY || "fallback_job_portal_secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
  };
  clone.save = async function () {
    const idx = users.findIndex((item) => String(item._id) === String(u._id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...clone };
    }
    return clone;
  };
  return clone;
}

function makeJobDoc(j) {
  if (!j) return null;
  const clone = JSON.parse(JSON.stringify(j));
  clone.deleteOne = async function () {
    const idx = jobs.findIndex((item) => String(item._id) === String(j._id));
    if (idx !== -1) jobs.splice(idx, 1);
    return { acknowledged: true, deletedCount: 1 };
  };
  clone.save = async function () {
    const idx = jobs.findIndex((item) => String(item._id) === String(j._id));
    if (idx !== -1) jobs[idx] = { ...jobs[idx], ...clone };
    return clone;
  };
  return clone;
}

function makeAppDoc(a) {
  if (!a) return null;
  const clone = JSON.parse(JSON.stringify(a));
  clone.deleteOne = async function () {
    const idx = applications.findIndex((item) => String(item._id) === String(a._id));
    if (idx !== -1) applications.splice(idx, 1);
    return { acknowledged: true, deletedCount: 1 };
  };
  clone.save = async function () {
    const idx = applications.findIndex((item) => String(item._id) === String(a._id));
    if (idx !== -1) applications[idx] = { ...applications[idx], ...clone };
    return clone;
  };
  return clone;
}

export const mockUser = {
  async findOne(query) {
    let includePassword = false;
    const findFn = () => {
      const u = users.find((item) => {
        if (query.email && item.email.toLowerCase() === query.email.toLowerCase()) {
          return true;
        }
        return false;
      });
      return makeUserDoc(u, includePassword);
    };

    const chainable = {
      select(fields) {
        if (typeof fields === "string" && fields.includes("+password")) {
          includePassword = true;
        }
        return Promise.resolve(findFn());
      },
      then(resolve, reject) {
        return Promise.resolve(findFn()).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(findFn()).catch(reject);
      },
    };
    return chainable;
  },

  async findById(id) {
    const u = users.find((item) => String(item._id) === String(id));
    return makeUserDoc(u, false);
  },

  async findByIdAndUpdate(id, updateData) {
    const idx = users.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updateData };
    return makeUserDoc(users[idx], false);
  },

  async create(userData) {
    const existing = users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existing) {
      const err = new Error("Email already registered !");
      err.code = 11000;
      err.keyValue = { email: userData.email };
      throw err;
    }
    const hash = await bcrypt.hash(userData.password, 10);
    const newUser = {
      _id: "user_" + Date.now() + Math.random().toString(36).substring(2, 6),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hash,
      role: userData.role,
      title: "",
      bio: "",
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      savedJobs: [],
      createdAt: new Date(),
    };
    users.push(newUser);
    return makeUserDoc(newUser, false);
  },
};

export const mockJob = {
  async find(query = {}) {
    let filtered = [...jobs];
    if (query.expired === false) {
      filtered = filtered.filter((j) => !j.expired);
    }
    if (query.postedBy) {
      filtered = filtered.filter(
        (j) => String(j.postedBy) === String(query.postedBy)
      );
    }
    return filtered.map(makeJobDoc);
  },

  async findById(id) {
    const j = jobs.find((item) => String(item._id) === String(id));
    return makeJobDoc(j);
  },

  async findByIdAndUpdate(id, updateData) {
    const idx = jobs.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;
    jobs[idx] = { ...jobs[idx], ...updateData };
    return makeJobDoc(jobs[idx]);
  },

  async create(jobData) {
    const newJob = {
      _id: "job_" + Date.now() + Math.random().toString(36).substring(2, 6),
      company: jobData.company || "Hiring Company",
      status: "active",
      expired: false,
      skills: jobData.skills || [],
      responsibilities: jobData.responsibilities || "",
      requirements: jobData.requirements || "",
      benefits: jobData.benefits || [],
      employmentType: jobData.employmentType || "Full-time",
      workMode: jobData.workMode || "Hybrid",
      experienceLevel: jobData.experienceLevel || "Mid Level",
      jobPostedOn: new Date(),
      ...jobData,
    };
    jobs.unshift(newJob);
    return makeJobDoc(newJob);
  },
};

export const mockApplication = {
  async create(appData) {
    const newApp = {
      _id: "app_" + Date.now() + Math.random().toString(36).substring(2, 6),
      status: "Applied",
      appliedAt: new Date(),
      updatedAt: new Date(),
      timeline: [
        {
          status: "Applied",
          date: new Date(),
          note: "Application submitted.",
        },
      ],
      interview: {
        scheduled: false,
        date: "",
        time: "",
        type: "Video Call",
        link: "",
        notes: "",
      },
      ...appData,
    };
    applications.unshift(newApp);
    return makeAppDoc(newApp);
  },

  async find(query = {}) {
    let filtered = [...applications];
    if (query["employerID.user"]) {
      filtered = filtered.filter(
        (a) => String(a.employerID?.user) === String(query["employerID.user"])
      );
    }
    if (query["applicantID.user"]) {
      filtered = filtered.filter(
        (a) => String(a.applicantID?.user) === String(query["applicantID.user"])
      );
    }
    if (query.jobId) {
      filtered = filtered.filter((a) => String(a.jobId) === String(query.jobId));
    }
    return filtered.map(makeAppDoc);
  },

  async findById(id) {
    const a = applications.find((item) => String(item._id) === String(id));
    return makeAppDoc(a);
  },

  async findByIdAndUpdate(id, updateData) {
    const idx = applications.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;
    applications[idx] = { ...applications[idx], ...updateData, updatedAt: new Date() };
    return makeAppDoc(applications[idx]);
  },
};

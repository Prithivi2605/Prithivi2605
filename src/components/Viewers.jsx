import { activeProjects, portfolio } from "../data/portfolio.js";
import { ObjectFace } from "./ObjectFace.jsx";

function isHttp(value) {
  return /^https:\/\//i.test(value || "");
}

function External({ href, children, primary }) {
  if (!isHttp(href)) return null;
  return <a className={primary ? "btn p" : "btn"} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function ViewerBody({ item, dark, onDownload }) {
  if (item.viewer === "project") return <ProjectViewer id={item.projectId} />;
  if (item.viewer === "skills") return <SkillsViewer />;
  if (item.viewer === "experience") return <ExperienceViewer />;
  if (item.viewer === "resume") return <ResumeViewer onDownload={onDownload} />;
  if (item.viewer === "contact") return <ContactViewer />;
  if (item.viewer === "education") return <EducationViewer />;
  if (item.viewer === "cert") return <CertViewer id={item.certId} />;
  if (item.viewer === "about") {
    return (
      <div className="vb split">
        <FaceFrame item={item} dark={dark} />
        <div className="txt">
          {portfolio.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="chips">{portfolio.interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="vb split">
      <FaceFrame item={item} dark={dark} />
      <div className="txt"><p>{item.note}</p></div>
    </div>
  );
}

function FaceFrame({ item, dark }) {
  const scale = Math.min(3.2, 360 / item.w, 440 / item.h);
  return (
    <div className="frame">
      <div style={{ width: item.w * scale, height: item.h * scale }}>
        <div style={{ width: item.w, height: item.h, transform: `scale(${scale}) rotate(${item.r / 2}deg)`, transformOrigin: "0 0" }}>
          <ObjectFace item={item} dark={dark} binCount={0} />
        </div>
      </div>
    </div>
  );
}

export function viewerTitle(item) {
  if (item.viewer === "project") return activeProjects.find((project) => project.id === item.projectId)?.name || item.name;
  if (item.viewer === "about") return portfolio.name;
  if (item.viewer === "resume") return portfolio.name;
  if (item.viewer === "contact") return "Say hello";
  if (item.viewer === "skills") return "Technical skills";
  if (item.viewer === "experience") return portfolio.experience[0].organization;
  if (item.viewer === "education") return portfolio.education[0].institution;
  if (item.viewer === "cert") return portfolio.certifications.find((cert) => cert.id === item.certId)?.title || item.name;
  if (item.kind === "lamp") return "Light and dark";
  return item.name;
}

export function viewerKind(item) {
  if (item.viewer === "project") return "Project";
  if (item.viewer === "skill") return `Skill · ${item.skill.group}`;
  return {
    about: "About",
    resume: "Resume",
    contact: "Contact",
    skills: "Skills",
    experience: "Experience",
    education: "Education",
    cert: "Certificate",
    note: "Note"
  }[item.viewer] || "Desk";
}

function ProjectViewer({ id }) {
  const project = activeProjects.find((entry) => entry.id === id);
  if (!project) return null;
  const image = isHttp(project.image) || String(project.image || "").startsWith("/") ? project.image : "";
  return (
    <div className="vb pg">
      <div className="sheet project-sheet" style={{ "--sheet-tint": project.tint, "--sheet-accent": project.accent }}>
        {image ? <img src={image} alt={`${project.name} preview`} /> : null}
        {project.status && <p className="status-pill">{project.status}</p>}
        {project.subtitle && <p><b>{project.subtitle}</b></p>}
        {project.features.length > 0 && (
          <>
            <h3>What I built</h3>
            <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </>
        )}
        <h3>Technology</h3>
        {project.stack.length > 0 ? (
          <div className="chips">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
        ) : (
          <p className="fine">Technology stack not added yet. Edit this project in src/data/portfolio.js.</p>
        )}
        <p className="link-row">
          <External href={project.demo} primary>Live demo</External>
          <External href={project.github}>GitHub</External>
        </p>
        {!isHttp(project.github) && !isHttp(project.demo) && <p className="fine">GitHub and live demo links can be added in src/data/portfolio.js.</p>}
      </div>
    </div>
  );
}

function SkillsViewer() {
  return (
    <div className="vb pg">
      <div className="sheet skill-sheet">
        {portfolio.skillGroups.map((group) => (
          <div className="skill-group" key={group.name}>
            <div className="skill-group-title"><b>{group.name}</b><span>{group.skills.length}</span></div>
            <div className="skill-grid">
              {group.skills.map((skill) => (
                <div className="skill-detail" key={skill.name}>
                  <div className="skill-detail-top">
                    <span className="mark" style={{ background: skill.bg, color: skill.fg }}>{skill.short}</span>
                    <b>{skill.name}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceViewer() {
  return (
    <div className="vb pg">
      <div className="sheet">
        {portfolio.experience.map((job) => (
          <article className="job" key={job.id}>
            <h3>{job.role}</h3>
            <p><b>{job.organization}</b><br />{job.start} – {job.end}</p>
            <ul>{job.responsibilities.map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="chips">{job.technologies.map((item) => <span key={item}>{item}</span>)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function EducationViewer() {
  return (
    <div className="vb pg">
      <div className="sheet">
        {portfolio.education.map((school) => (
          <article key={school.institution}>
            <h3>{school.degree}</h3>
            <p><b>{school.institution}</b><br />{school.years}<br />{school.score}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function CertViewer({ id }) {
  const cert = portfolio.certifications.find((entry) => entry.id === id);
  if (!cert) return null;
  return (
    <div className="vb pg">
      <div className="sheet">
        <h3>{cert.title}</h3>
        <p>{[cert.issuer, cert.year].filter(Boolean).join(" · ")}</p>
      </div>
    </div>
  );
}

function ResumeViewer({ onDownload }) {
  return (
    <div className="vb pg">
      <div className="sheet">
        <div className="resume-face">
          <small>Resume</small>
          <h4>{portfolio.name}</h4>
          <p className="role-line">{portfolio.role}</p>
          <p>{portfolio.email}<br />{portfolio.phone}</p>
          <h3>Professional summary</h3>
          <p>{portfolio.summary}</p>
          <h3>Education</h3>
          {portfolio.education.map((school) => <p key={school.institution}><b>{school.degree}</b><br />{school.institution}<br />{school.years} · {school.score}</p>)}
          <h3>Internship</h3>
          {portfolio.experience.map((job) => <p key={job.id}><b>{job.role}</b><br />{job.organization} · {job.start} – {job.end}</p>)}
          <h3>Certifications</h3>
          <ul>{portfolio.certifications.map((cert) => <li key={cert.id}>{cert.title}{cert.issuer ? ` — ${cert.issuer}` : ""} ({cert.year})</li>)}</ul>
          <h3>Languages</h3>
          <p>{portfolio.languages.map((language) => `${language.name} — ${language.level}`).join(" · ")}</p>
        </div>
        <p className="link-row"><button type="button" className="btn p" onClick={onDownload}>Download PDF</button></p>
        <p className="fine">Save your resume as public/resume/Prithiviraj-B-Resume.pdf. This page is a readable preview, not a generated PDF.</p>
      </div>
    </div>
  );
}

function ContactViewer() {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(portfolio.email);
  return (
    <div className="vb pg">
      <div className="sheet">
        <p>Email and phone are the ways to reach me.</p>
        {email ? <p><a className="btn p" href={`mailto:${portfolio.email}`}>{portfolio.email}</a></p> : null}
        {portfolio.phone ? <p><a className="btn" href={`tel:${portfolio.phone}`}>{portfolio.phone}</a></p> : null}
        <p className="link-row">
          <External href={portfolio.github} primary>GitHub</External>
          <External href={portfolio.linkedin}>LinkedIn</External>
        </p>
        {!isHttp(portfolio.github) && !isHttp(portfolio.linkedin) && <p className="fine">LinkedIn and GitHub profile URLs are not added yet. Add them in src/data/portfolio.js.</p>}
      </div>
    </div>
  );
}

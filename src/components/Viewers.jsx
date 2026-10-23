import { useState } from "react";
import { activeProjects, portfolio, skillWord } from "../data/portfolio.js";
import { certImage } from "../utils/certImage.js";
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
  if (item.viewer === "projects") return <LaptopViewer />;
  if (item.viewer === "postcard") return <PostcardViewer id={item.projectId} />;
  if (item.viewer === "skills") return <SkillsViewer />;
  if (item.viewer === "experience") return <ExperienceViewer />;
  if (item.viewer === "resume") return <ResumeViewer onDownload={onDownload} />;
  if (item.viewer === "contact") return <ContactViewer />;
  if (item.viewer === "education") return <EducationViewer index={item.eduIndex} />;
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
  if (item.viewer === "project" || item.viewer === "postcard") return activeProjects.find((project) => project.id === item.projectId)?.name || item.name;
  if (item.viewer === "projects") return "All projects";
  if (item.viewer === "about") return portfolio.name;
  if (item.viewer === "resume") return portfolio.name;
  if (item.viewer === "contact") return "Say hello";
  if (item.viewer === "skills") return "Technical skills";
  if (item.viewer === "experience") return portfolio.experience[0].organization;
  if (item.viewer === "education") return portfolio.education[item.eduIndex ?? 0]?.institution || item.name;
  if (item.viewer === "cert") return portfolio.certifications.find((cert) => cert.id === item.certId)?.title || item.name;
  if (item.kind === "lamp") return "Light and dark";
  return item.name;
}

export function viewerKind(item) {
  if (item.viewer === "project") return "Project";
  if (item.viewer === "skill") return skillWord(item.skill.name);
  return {
    projects: "Projects",
    postcard: "Postcard",
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

function LaptopViewer() {
  return (
    <div className="vb pg">
      <div className="sheet">
        {activeProjects.map((project) => {
          const live = isHttp(project.demo) ? project.demo : isHttp(project.github) ? project.github : "";
          return (
            <div className="pr" key={project.id}>
              <i style={{ background: `linear-gradient(135deg, ${project.c1}, ${project.c2})` }} />
              <div>
                <b>{project.name}</b>
                <span>{project.subtitle} · {project.stack.slice(0, 3).join(", ")}</span>
              </div>
              {live ? <a className="btn p" href={live} target="_blank" rel="noopener noreferrer">Live project</a> : null}
            </div>
          );
        })}
        <p className="link-row laptop-end">
          <a className="btn" href={portfolio.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </div>
    </div>
  );
}

function PostcardViewer({ id }) {
  const project = activeProjects.find((entry) => entry.id === id);
  if (!project) return null;
  return (
    <div className="vb pg">
      <div className="sheet">
        <h3>A note from {project.name}</h3>
        <p>{project.summary}</p>
        <p>{project.description}</p>
        <div className="chips">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
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

function EducationViewer({ index }) {
  const schools = Number.isInteger(index) ? portfolio.education.filter((_, entry) => entry === index) : portfolio.education;
  return (
    <div className="vb pg">
      <div className="sheet">
        {schools.map((school) => (
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
        {certImage(cert) ? <img className="cert-view" src={certImage(cert)} alt={cert.title} /> : null}
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
        <p className="fine">The download uses the file in public/resume/Prithiviraj.pdf.</p>
      </div>
    </div>
  );
}

function ContactViewer() {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(portfolio.email);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const form = portfolio.contactForm;

  async function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = new FormData();
    Object.entries(form.fields).forEach(([key, entry]) => {
      if (entry) body.append(entry, String(data.get(key) || ""));
    });
    setSending(true);
    fetch(form.action, { method: "POST", mode: "no-cors", body }).catch(() => {});
    setSent(true);
    setSending(false);
  }

  return (
    <div className="vb pg">
      <div className="sheet contact-sheet">
        <h3>Send a message</h3>
        {sent ? <p><b>Message sent. Thank you.</b></p> : (
          <form className="message-form" onSubmit={onSubmit}>
            <label>Your name
              <input name="name" type="text" autoComplete="name" required maxLength={120} />
            </label>
            <label>Your email
              <input name="email" type="email" autoComplete="email" required maxLength={160} />
            </label>
            <label>What is this about?
              <select name="topic" required defaultValue="">
                <option value="" disabled>Choose one</option>
                <option>Job or Internship</option>
                <option>Project collaboration</option>
                <option>Just saying hello</option>
                <option>Something else</option>
              </select>
            </label>
            <label>Message
              <textarea name="message" required maxLength={2000} />
            </label>
            <button type="submit" className="btn p" disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
          </form>
        )}
        <div className="reach">
          <h3>Reach me</h3>
          {email && (
            <div className="reach-row">
              <span>Email</span>
              <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
            </div>
          )}
          {portfolio.phone && (
            <div className="reach-row">
              <span>Phone</span>
              <a href={`tel:${portfolio.phone}`}>{portfolio.phone}</a>
            </div>
          )}
          <div className="reach-row">
            <span>GitHub</span>
            {isHttp(portfolio.github) ? <a className="btn" href={portfolio.github} target="_blank" rel="noopener noreferrer">Open GitHub</a> : <em>Not added yet</em>}
          </div>
          <div className="reach-row">
            <span>LinkedIn</span>
            {isHttp(portfolio.linkedin) ? <a className="btn" href={portfolio.linkedin} target="_blank" rel="noopener noreferrer">Open LinkedIn</a> : <em>Not added yet</em>}
          </div>
        </div>
      </div>
    </div>
  );
}

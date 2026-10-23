import { activeProjects, portfolio, skillWord } from "../data/portfolio.js";
import { certImage } from "../utils/certImage.js";

function Eyes({ y }) {
  return (
    <>
      <circle cx="40" cy={y} r="4.2" fill="#2a2540" />
      <circle cx="60" cy={y} r="4.2" fill="#2a2540" />
      <circle cx="41.3" cy={y - 1.4} r="1.4" fill="#fff" />
      <circle cx="61.3" cy={y - 1.4} r="1.4" fill="#fff" />
      <path d={`M44 ${y + 12}q6 5 12 0`} stroke="#2a2540" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function Mascot({ kind }) {
  if (kind === "crystal") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 4 80 27 73 72 50 94 27 72 20 27Z" fill="#a465f5" />
        <path d="M50 4V94L73 72 80 27Z" fill="#7b3fe4" opacity=".55" />
        <Eyes y={48} />
      </svg>
    );
  }
  if (kind === "axo") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="22" cy="40" rx="9" ry="5" fill="#4cc9b0" transform="rotate(-30 22 40)" />
        <ellipse cx="20" cy="54" rx="9" ry="5" fill="#4cc9b0" transform="rotate(20 20 54)" />
        <path d="M14 60Q16 32 48 32 82 32 90 56 92 80 58 82 26 84 14 60Z" fill="#8fe3d1" />
        <path d="M84 58Q100 52 98 72 94 84 80 80Z" fill="#6fd3c0" />
        <Eyes y={54} />
      </svg>
    );
  }
  if (kind === "skull") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M26 42Q26 10 50 10 74 10 74 42 74 58 62 62V84H38V62Q26 58 26 42Z" fill="#e8f0e4" />
        <ellipse cx="40" cy="44" rx="6" ry="7" fill="#3a4a40" />
        <ellipse cx="60" cy="44" rx="6" ry="7" fill="#3a4a40" />
        <path d="M50 10Q50 -4 66 -2 62 12 50 10Z" fill="#6fb58a" />
      </svg>
    );
  }
  if (kind === "bear") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="26" cy="26" r="11" fill="#9ac7ae" />
        <circle cx="74" cy="26" r="11" fill="#9ac7ae" />
        <ellipse cx="50" cy="56" rx="34" ry="32" fill="#a9d3bd" />
        <ellipse cx="50" cy="64" rx="14" ry="10" fill="#d4ebdd" />
        <Eyes y={50} />
        <ellipse cx="50" cy="60" rx="4" ry="3" fill="#3a4a40" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M20 90Q12 52 28 40L24 12 42 27Q50 25 58 27L76 12 72 40Q88 52 80 90Z" fill="#26213a" />
      <path d="M33 70 50 84 67 70 63 88H37Z" fill="#8a4dff" />
      <ellipse cx="39" cy="52" rx="5" ry="5.5" fill="#c59cff" />
      <ellipse cx="61" cy="52" rx="5" ry="5.5" fill="#c59cff" />
      <circle cx="40" cy="52" r="2" fill="#1a1530" />
      <circle cx="62" cy="52" r="2" fill="#1a1530" />
    </svg>
  );
}

function Shot({ a, b }) {
  return (
    <div className="shot">
      <div className="sb"><i /><i /><i /></div>
      <div className="sc" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}><b /><b /><u /><b /><b /></div>
    </div>
  );
}

function Sticker({ kind }) {
  return <div className="pst cut"><Mascot kind={kind} /></div>;
}

function Mark({ skill }) {
  return <span className="mark" style={{ background: skill.bg, color: skill.fg }} aria-hidden="true">{skill.short}</span>;
}

export function ObjectFace({ item, dark, binCount }) {
  const project = item.projectId ? activeProjects.find((entry) => entry.id === item.projectId) : null;
  if (item.kind === "about") {
    return (
      <>
        <div className="tape" />
        <div className="face"><div className="polaroid"><div className="im"><Mascot kind="cat" /></div><div className="cap">{portfolio.name}</div></div></div>
      </>
    );
  }
  if (item.kind === "resume") {
    const job = portfolio.experience[0];
    return (
      <div className="face">
        <div className="stack"><i style={{ transform: "rotate(-2.6deg) translate(-8px, 7px)" }} /><i style={{ transform: "rotate(2.2deg) translate(8px, 4px)" }} /></div>
        <div className="clip" style={{ left: 42 }} />
        <div className="rs pp fold">
          <div className="rdoc" style={{ transform: "scale(.353)" }}>
            <h1>{portfolio.name}</h1>
            <div className="ti">{portfolio.role}</div>
            <div className="ct">{portfolio.email}<br />{portfolio.phone}</div>
            <div className="bd">
              <div>
                <h2>Summary</h2>
                <p>{portfolio.summary}</p>
                <h2>Projects</h2>
                {activeProjects.map((project) => <p key={project.id}><b>{project.name}</b> — {project.subtitle}</p>)}
              </div>
              <div className="sd">
                <h2>Education</h2>
                {portfolio.education.map((school) => <p key={school.institution}><b>{school.degree}</b><br /><span>{school.institution}<br />{school.years} · {school.score}</span></p>)}
                <h2>Internship</h2>
                <p><b>{job.role}</b><br /><span>{job.organization}<br />{job.start} – {job.end}</span></p>
              </div>
            </div>
          </div>
        </div>
        <i className="stain" style={{ right: 34, bottom: 46 }} />
      </div>
    );
  }
  if (item.kind === "folded") {
    return (
      <div className="face">
        <div className="paper pp" style={{ padding: 0, background: "linear-gradient(135deg,#fff 50%,#ece9dd 50%)", display: "grid", placeItems: "center", font: "800 22px var(--serif)", color: "#e0455a" }}>?</div>
      </div>
    );
  }
  if (item.kind === "sticky") {
    return <div className="face"><div className="sticky"><span>Solve practical</span><span>problems.</span><span>Write it down ✦</span></div></div>;
  }
  if (item.kind === "notes") {
    return (
      <>
        <i className="pin pin-yellow" style={{ left: 22, top: -6 }} />
        <div className="face"><div className="note pp">Interests<br />{portfolio.interests.map((interest) => <span key={interest}>✓ {interest}<br /></span>)}</div></div>
      </>
    );
  }
  if (item.kind === "lamp") {
    return (
      <div className="face">
        <div className={`lamp-shell ${dark ? "is-off" : "is-on"}`}>
          <div className="lamp-glow" />
          <svg viewBox="0 0 150 210" aria-hidden="true">
            <path d="M50 26H100L128 82H22Z" className="shade" fill="#d8a93f" />
            <path d="M58 27H92L106 67H44Z" fill="#f7e3a1" opacity=".8" />
            <circle cx="75" cy="71" r="9" className="bulb" fill="#fff3b0" />
            <path d="M75 82V157" stroke="#55566a" strokeWidth="8" strokeLinecap="round" />
            <path d="M55 157H95L111 191H39Z" fill="#6d6e7d" />
            <ellipse cx="75" cy="193" rx="44" ry="8" fill="#3f404b" />
            <path d="M57 157H93" stroke="#d7d8df" strokeWidth="3" opacity=".7" />
          </svg>
          <span className="lamp-label">click to switch light</span>
        </div>
      </div>
    );
  }
  if (item.kind === "mail") {
    return (
      <>
        <i className="clip" style={{ left: 108, transform: "rotate(8deg)" }} />
        <div className="face"><div className="mailx"><Envelope /></div></div>
      </>
    );
  }
  if (item.kind === "biz") {
    return (
      <div className="face"><div className="bizx"><BizCard /></div></div>
    );
  }
  if (item.kind === "phone") {
    return (
      <div className="face"><div className="phx"><PhoneCard /></div></div>
    );
  }
  if (item.kind === "laptop") {
    return (
      <div className="face">
        <svg viewBox="0 0 330 220" aria-hidden="true" style={{ display: "block", width: "100%", height: "100%" }}>
          <rect x="28" y="6" width="274" height="172" rx="9" fill="#2d2f3a" />
          <rect x="36" y="14" width="258" height="156" rx="3" fill="#fff" />
          <rect x="36" y="14" width="258" height="24" fill="#eceef4" />
          <g fill="#f08a7e"><circle cx="47" cy="26" r="3" /></g>
          <circle cx="57" cy="26" r="3" fill="#f4c542" />
          <circle cx="67" cy="26" r="3" fill="#6fd3c0" />
          <rect x="78" y="17" width="72" height="21" rx="5" fill="#fff" />
          <text x="86" y="30" fontFamily="Bricolage Grotesque, sans-serif" fontSize="7" fontWeight="700" fill="#23223a">prithivirajb</text>
          <rect x="158" y="21" width="116" height="13" rx="6.5" fill="#fff" stroke="#d6d9e4" />
          <text x="166" y="30.5" fontFamily="Bricolage Grotesque, sans-serif" fontSize="6.5" fill="#6b6a80">github.com/prithivirajb26</text>
          <rect x="36" y="38" width="258" height="132" fill="#f6f1ff" />
          <text x="52" y="72" fontFamily="Fraunces, Georgia, serif" fontWeight="800" fontSize="20" fill="#23223a">I'm Prithiviraj.</text>
          <text x="52" y="86" fontFamily="Bricolage Grotesque, sans-serif" fontSize="8.5" fill="#6b6a80">{portfolio.shortRole}</text>
          <rect x="52" y="95" width="62" height="16" rx="8" fill="#7b3fe4" />
          <text x="83" y="106" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700" fontSize="8" fill="#fff">{activeProjects.length} projects</text>
          <circle cx="252" cy="78" r="30" fill="#dff3ea" />
          <svg x="228" y="54" width="48" height="48" viewBox="0 0 100 100">
            <circle cx="26" cy="26" r="11" fill="#9ac7ae" />
            <circle cx="74" cy="26" r="11" fill="#9ac7ae" />
            <ellipse cx="50" cy="56" rx="34" ry="32" fill="#a9d3bd" />
            <ellipse cx="50" cy="64" rx="14" ry="10" fill="#d4ebdd" />
            <circle cx="38" cy="50" r="4.2" fill="#2a2540" />
            <circle cx="62" cy="50" r="4.2" fill="#2a2540" />
            <circle cx="39.3" cy="48.6" r="1.4" fill="#fff" />
            <circle cx="63.3" cy="48.6" r="1.4" fill="#fff" />
            <ellipse cx="50" cy="60" rx="4" ry="3" fill="#3a4a40" />
          </svg>
          <g>
            <rect x="52" y="124" width="64" height="38" rx="4" fill="#e7defc" />
            <rect x="126" y="124" width="64" height="38" rx="4" fill="#d6f5ef" />
            <rect x="200" y="124" width="64" height="38" rx="4" fill="#fff1c9" />
            {[52, 126, 200].map((x) => (
              <g key={x}>
                <rect x={x + 6} y="130" width="30" height="4" rx="2" fill="#23223a" opacity="0.7" />
                <rect x={x + 6} y="140" width="50" height="3" rx="1.5" fill="#23223a" opacity="0.25" />
                <rect x={x + 6} y="147" width="40" height="3" rx="1.5" fill="#23223a" opacity="0.25" />
              </g>
            ))}
          </g>
          <path d="M8 178H322L316 196Q314 204 304 204H26Q16 204 14 196Z" fill="#c9ccd8" stroke="#8e92a4" strokeWidth="1.2" />
          <path d="M8 178H322" stroke="#8e92a4" strokeWidth="1.5" />
          <path d="M138 178H192Q190 187 165 187 140 187 138 178Z" fill="#aeb2c2" stroke="#8e92a4" />
          <path d="M18 198H312" stroke="#aeb2c2" />
        </svg>
      </div>
    );
  }
  if (item.kind === "postcard" && project) {
    return (
      <div className="face">
        <div className="postcard pp" style={{ "--a": project.c1, "--b": project.c2 }}>
          <div className="photo"><Mascot kind={project.sticker} /></div>
          <div className="line" />
          <div className="addr">Prithiviraj B<br />Coimbatore</div>
          <div className="caption">{project.name}</div>
          <small>{project.summary}</small>
          <div className="postmark">PB<br />2026</div>
        </div>
      </div>
    );
  }
  if (item.kind === "project" && project) {
    const total = String(activeProjects.length).padStart(2, "0");
    const number = String(item.projectIndex + 1).padStart(2, "0");
    const fasteners = [
      <i key="pin" className="pin pin-red" style={{ left: 16, top: -8 }} />,
      <i key="clip" className="clip" style={{ left: 22 }} />,
      <i key="tape" className="tape" style={{ left: "28%", transform: "rotate(7deg)" }} />,
      <i key="pinb" className="pin pin-blue" style={{ right: 18, left: "auto", top: -6 }} />,
      <i key="tape2" className="tape tape-violet" />
    ];
    return (
      <>
        {fasteners[item.projectIndex % fasteners.length]}
        <div className="face">
        <div className="pos pp fold" style={{ "--bg2": project.tint, "--ac": project.accent }}>
          <small>PROJECT {number}</small>
          <h3>{project.name}</h3>
          <Shot a={project.c1} b={project.c2} />
          <div className="cols"><u /><u /><u /></div>
          <div className="pf">
            <span>{project.stack.slice(0, 2).join(" · ")}</span>
            <span>{number} / {total}</span>
          </div>
          <Sticker kind={project.sticker} />
        </div>
      </div>
      </>
    );
  }
  if (item.kind === "experience") {
    const job = portfolio.experience[0];
    return (
      <div className="face"><div className="old pp">
        <h4>Experience, so far</h4>
        <div className="tl">
          <div><b>{job.start} – {job.end}</b>{job.role}, {job.organization}</div>
          <div><b>{portfolio.education[0].years}</b>{portfolio.education[0].degree}</div>
        </div>
      </div></div>
    );
  }
  if (item.kind === "education") {
    const school = portfolio.education[item.eduIndex] || portfolio.education[0];
    const label = item.eduIndex === 0 ? "College" : item.eduIndex === 1 ? "School" : "Education";
    return (
      <>
        <i className="bclip" />
        <div className="face"><div className="paper pp fold">
          <small>{label}</small>
          <p><b>{school.institution}</b><br />{school.degree}<br />{school.years}<br />{school.score}</p>
        </div></div>
      </>
    );
  }
  if (item.kind === "field") {
    return (
      <>
        <i className="tape" style={{ left: "62%", transform: "rotate(-8deg)" }} />
        <i className="pin pin-green" style={{ left: 14, top: 8 }} />
        <div className="face"><div className="note pp" style={{ paddingTop: 12, fontSize: 18, lineHeight: "22px" }}><span style={{ fontSize: 13, color: "#8a7a6a" }}>postmarked field note</span><br />Seeking an entry-level full-stack role.<br /><span style={{ fontSize: 14 }}>— from the resume</span></div></div>
      </>
    );
  }
  if (item.kind === "clock") {
    return (
      <div className="face">
        <svg viewBox="0 0 100 100" className="clk" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#f4f1e8" stroke="#2b2c33" strokeWidth="4" />
          <line className="hh" x1="50" y1="50" x2="50" y2="30" stroke="#1d1d26" strokeWidth="4" strokeLinecap="round" />
          <line className="mh" x1="50" y1="50" x2="50" y2="20" stroke="#1d1d26" strokeWidth="3" strokeLinecap="round" />
          <line className="sh" x1="50" y1="54" x2="50" y2="16" stroke="#d63b4f" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="3" fill="#d63b4f" />
        </svg>
      </div>
    );
  }
  if (item.kind === "mug") {
    return (
      <div className="face">
        <svg viewBox="0 0 100 115" aria-hidden="true">
          <path className="steam" d="M40 34Q34 24 41 16" stroke="#aab0bd" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="105" rx="36" ry="6" fill="#e4e5ec" />
          <path d="M80 52H88Q98 52 98 66T88 80H80" stroke="#d96b5b" strokeWidth="7" fill="none" />
          <path d="M20 44H80V82Q80 102 50 102 20 102 20 82Z" fill="#f08a7e" />
          <ellipse cx="50" cy="44" rx="30" ry="8" fill="#fff4ee" />
          <ellipse cx="50" cy="45" rx="22" ry="5" fill="#5a3220" />
          <text x="50" y="80" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="18" fill="#fff8f0">code</text>
        </svg>
      </div>
    );
  }
  if (item.kind === "cat") return <div className="face cut"><Mascot kind={item.mascot} /></div>;
  if (item.kind === "stamp") {
    const ink = item.mascot === "axo" ? ["#1c4fa0", "#0c1f4f"] : item.mascot === "bear" ? ["#2f7d62", "#12392b"] : ["#4a2a86", "#1c1240"];
    return (
      <div className="face"><div className="stamp"><div className="in" style={{ background: `linear-gradient(160deg, ${ink[0]}, ${ink[1]})` }}>
        <Mascot kind={item.mascot} />
        <span><b>{item.stampLabel}</b></span>
      </div></div></div>
    );
  }
  if (item.kind === "skillcard") {
    return (
      <>
        <div className="tape" />
        <div className="face"><div className="skcard pp">
          <b>Skills</b>
          <div className="skill-lines">✓ Frontend<br />✓ Backend<br />✓ Database<br />✓ Fundamentals</div>
        </div></div>
      </>
    );
  }
  if (item.kind === "doodle") {
    return <div className="face"><div className="paper pp doodle"><div>{"<h1>Hello</h1>"}</div><div className="hw">a scrap of HTML</div></div></div>;
  }
  if (item.kind === "pen") return <div className="face"><div className="pen" /></div>;
  if (item.kind === "pencil") return <div className="face"><div className="pencil" /></div>;
  if (item.kind === "eraser") return <div className="face"><div className="eraser" /></div>;
  if (item.kind === "skill") {
    return (
      <div className="face"><div className="skl" style={{ "--c": item.skill.color }}>
        <Mark skill={item.skill} />
        <div><span className="skill-name">{item.skill.name}</span><span className="skill-cat">{skillWord(item.skill.name)}</span></div>
      </div></div>
    );
  }
  if (item.kind === "cert") {
    const cert = portfolio.certifications.find((entry) => entry.id === item.certId);
    if (!cert) return null;
    const photo = certImage(cert);
    if (photo) {
      return (
        <>
          <i className="clip" />
          <div className="face"><div className="cert cert-photo"><img src={photo} alt={cert.title} /></div></div>
        </>
      );
    }
    return (
      <>
        <i className="clip" />
        <div className="face"><div className="cert" style={{ background: "#fbf6e7", border: "3px solid #1d2b53", padding: "16px 14px" }}>
          <small style={{ letterSpacing: ".08em" }}>CERTIFICATE</small>
          <b style={{ display: "block", marginTop: 10, font: "800 18px/1.15 var(--serif)", color: "#1d2b53" }}>{cert.title}</b>
          <span style={{ display: "block", marginTop: 8, fontSize: 12, color: "#5a5a6a" }}>{[cert.issuer, cert.year].filter(Boolean).join(" · ")}</span>
        </div></div>
      </>
    );
  }
  if (item.kind === "bin") {
    return (
      <div className="face"><div className="dustbin">
        <div className="handle" /><div className="lid" />
        <div className="body"><i className="slot s1" /><i className="slot s2" /><i className="slot s3" /></div>
        <i className="dust d1" /><i className="dust d2" /><i className="dust d3" /><i className="dust d4" />
        {binCount > 0 && <span className="count">{binCount}</span>}
        <span className="label">dustbin · click or shake</span>
      </div></div>
    );
  }
  if (item.kind === "scrap") {
    return <div className="face"><div className="note pp scrap-note">Scrap paper<br />nothing important</div></div>;
  }
  return null;
}

function Envelope() {
  return (
    <svg viewBox="0 0 460 300" aria-hidden="true">
      <rect width="460" height="300" rx="3" fill="#f7f1e3" />
      <path d="M12 288 230 162 448 288M12 12 230 138 448 12" fill="none" stroke="#d8cdb2" strokeWidth="1.2" />
      <rect x="8" y="8" width="444" height="284" fill="none" stroke="#2f4e8f" strokeWidth="8" />
      <text x="34" y="58" fontFamily="Caveat, cursive" fontSize="28" fill="#1f3a8a">{portfolio.name}</text>
      <text x="46" y="168" fontFamily="Caveat, cursive" fontSize="40" fontWeight="700" fill="#1f3a8a">Let&apos;s work together.</text>
      <text x="48" y="206" fontFamily="Caveat, cursive" fontSize="20" fill="#1f3a8a">{portfolio.email}</text>
      <text x="48" y="234" fontFamily="Caveat, cursive" fontSize="20" fill="#1f3a8a">{portfolio.phone}</text>
      <g transform="translate(392 232)">
        <circle r="36" fill="#7b3fe4" />
        <text y="-4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">OPEN</text>
        <text y="10" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">TO</text>
        <text y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">WORK</text>
      </g>
    </svg>
  );
}

function BizCard() {
  const initials = portfolio.name.split(" ").map((part) => part[0]).join("");
  return (
    <svg viewBox="0 0 450 250" aria-hidden="true">
      <rect width="450" height="250" fill="#f3ede0" />
      <path d="M450 0H300A150 150 0 0 0 450 150Z" fill="#e2573f" />
      <circle cx="64" cy="52" r="22" fill="none" stroke="#23223a" strokeWidth="2" />
      <text x="64" y="58" textAnchor="middle" fontSize="16" fontFamily="Fraunces, Georgia, serif" fill="#23223a">{initials}</text>
      <text x="42" y="112" fontSize="32" fontFamily="Fraunces, Georgia, serif" fill="#23223a">{portfolio.name}</text>
      <text x="43" y="136" fontSize="14" fontWeight="700" fill="#c4452f">{portfolio.shortRole}</text>
      <line x1="42" x2="280" y1="152" y2="152" stroke="#23223a" />
      <text x="42" y="178" fontSize="14" fill="#2d2c3a">{portfolio.email}</text>
      <text x="42" y="200" fontSize="14" fill="#2d2c3a">{portfolio.phone}</text>
      <text x="42" y="224" fontSize="12" fill="#6b6a80">GitHub and LinkedIn URLs not added</text>
    </svg>
  );
}

function PhoneCard() {
  return (
    <svg viewBox="0 0 190 398" aria-hidden="true">
      <rect width="190" height="398" rx="22" fill="#111318" />
      <rect x="8" y="8" width="174" height="382" rx="16" fill="#13224a" />
      <text x="18" y="36" fontSize="12" fontWeight="700" fill="#fff">9:41</text>
      <text x="18" y="78" fontSize="22" fontWeight="800" fill="#fff">{portfolio.name.split(" ")[0]}</text>
      <text x="18" y="98" fontSize="11" fill="#d7deee">{portfolio.shortRole}</text>
      <rect x="16" y="118" width="158" height="36" rx="10" fill="#fff" />
      <text x="24" y="140" fontSize="8" fontWeight="700" fill="#1b1d26">{portfolio.email}</text>
      <rect x="16" y="164" width="158" height="36" rx="10" fill="#ffffff22" />
      <text x="28" y="187" fontSize="13" fontWeight="700" fill="#fff">{portfolio.phone}</text>
      <rect x="16" y="214" width="158" height="32" rx="10" fill="#ffffff18" />
      <text x="28" y="235" fontSize="12" fontWeight="700" fill="#fff">GitHub — add URL</text>
      <rect x="16" y="254" width="158" height="32" rx="10" fill="#ffffff18" />
      <text x="28" y="275" fontSize="12" fontWeight="700" fill="#fff">LinkedIn — add URL</text>
    </svg>
  );
}

export function MarkList() {
  return null;
}

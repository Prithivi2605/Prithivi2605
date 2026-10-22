/* Builds desk objects from PORTFOLIO. The desk engine runs after this file. */
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
function isHttp(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (err) {
    return false;
  }
}
function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
function chipsHtml(list) {
  if (!list || !list.length) return "";
  return `<div class="chips">${list.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}
function linkRow(pairs) {
  const ready = (pairs || []).filter((pair) => isHttp(pair.url));
  if (!ready.length) return "";
  return `<p class="link-row">${ready.map((pair, index) => `<a class="btn ${index ? "" : "p"}" href="${escapeHtml(pair.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pair.label)}</a>`).join(" ")}</p>`;
}
function markHtml(skill) {
  return `<span class="mark" style="background:${skill.bg};color:${skill.fg}" aria-hidden="true">${escapeHtml(skill.short)}</span>`;
}

const activeProjects = PORTFOLIO.projects.filter((project) => project.enabled !== false);
const flatSkills = PORTFOLIO.skillGroups.flatMap((group) => group.skills.map((skill) => ({ ...skill, group: group.name })));

function illustration(kind, accent) {
  const common = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-hidden="true"`;
  if (kind === "merchant") {
    return `<svg ${common}><rect width="640" height="400" fill="#e7f6ee"/><g fill="none" stroke="${accent}" stroke-width="8"><rect x="70" y="70" width="150" height="90" rx="8"/><rect x="245" y="70" width="150" height="90" rx="8"/><rect x="420" y="70" width="150" height="90" rx="8"/><rect x="70" y="200" width="150" height="90" rx="8"/><rect x="245" y="200" width="150" height="90" rx="8"/><rect x="420" y="200" width="150" height="90" rx="8"/></g><path d="M110 250h70M285 250h70M460 115h70" stroke="${accent}" stroke-width="8" stroke-linecap="round"/></svg>`;
  }
  if (kind === "analyzer") {
    return `<svg ${common}><rect width="640" height="400" fill="#f3eefe"/><rect x="150" y="48" width="250" height="304" rx="12" fill="#fff" stroke="${accent}" stroke-width="6"/><path d="M180 100h190M180 140h150M180 180h170M180 230h120" stroke="#2a2540" stroke-width="8" stroke-linecap="round"/><circle cx="470" cy="210" r="70" fill="none" stroke="${accent}" stroke-width="14"/><path d="M520 262l48 48" stroke="${accent}" stroke-width="14" stroke-linecap="round"/></svg>`;
  }
  if (kind === "robot") {
    return `<svg ${common}><rect width="640" height="400" fill="#e7eef6"/><path d="M40 250 C160 250 180 120 320 120 S500 300 610 220" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/><rect x="268" y="150" width="104" height="70" rx="12" fill="#fff" stroke="${accent}" stroke-width="6"/><circle cx="292" cy="232" r="16" fill="${accent}"/><circle cx="348" cy="232" r="16" fill="${accent}"/><circle cx="300" cy="178" r="6" fill="${accent}"/><circle cx="340" cy="178" r="6" fill="${accent}"/></svg>`;
  }
  const label = kind === "soulsync" ? "SoulSync" : "Hallora";
  return `<svg ${common}><rect width="640" height="400" fill="${kind === "soulsync" ? "#fdeff4" : "#e8f0fb"}"/><circle cx="210" cy="200" r="78" fill="none" stroke="${accent}" stroke-width="10"/><circle cx="400" cy="200" r="78" fill="none" stroke="${accent}" stroke-width="10"/><text x="320" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="${accent}">${escapeHtml(label)}</text></svg>`;
}

function projectPage(project) {
  const description = project.description || project.summary;
  const featureBlock = project.features.length
    ? `<h3>Features</h3><ul>${project.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>`
    : "";
  const stackBlock = project.stack.length
    ? `<h3>Technology</h3>${chipsHtml(project.stack)}`
    : `<h3>Technology</h3><p class="fine">Technology stack not added yet. Edit this project in js/config.js.</p>`;
  const links = linkRow([
    { url: project.demo, label: "Live demo" },
    { url: project.github, label: "GitHub" }
  ]);
  const linkNote = links ? "" : `<p class="fine">GitHub and live demo links can be added in js/config.js.</p>`;
  const status = project.status ? `<p class="status-pill">${escapeHtml(project.status)}</p>` : "";
  const image = project.image
    ? `<img src="${escapeHtml(project.image)}" alt="" style="width:100%;border-radius:12px;margin-bottom:16px" onerror="this.remove()">`
    : `<div class="preview" style="border-radius:12px;overflow:hidden;margin-bottom:16px">${illustration(project.illustration, project.accent)}</div>`;
  return `<div class="sheet project-sheet">${image}${status}${description ? `<p>${escapeHtml(description)}</p>` : `<p class="fine">Add a description for ${escapeHtml(project.name)} in js/config.js.</p>`}${featureBlock}${stackBlock}${links}${linkNote}</div>`;
}

function projectFace(project, index) {
  const blurb = project.summary || project.status || "Details to be added";
  return `<div class="face"><div class="pos pp fold" style="--bg2:${project.tint};--ac:${project.accent}"><small>PROJECT ${String(index + 1).padStart(2, "0")}</small><h3 style="font:800 28px/1.05 Fraunces,Georgia,serif;margin:8px 0 0">${escapeHtml(project.name)}</h3><p class="poster-sum">${escapeHtml(blurb)}</p><div class="preview poster-art">${illustration(project.illustration, project.accent)}</div><div class="pf"><span>${escapeHtml(project.stack.slice(0, 2).join(" · "))}</span><span>${String(index + 1).padStart(2, "0")} / ${String(activeProjects.length).padStart(2, "0")}</span></div></div></div>`;
}

const CAT = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 90Q12 52 28 40L24 12 42 27Q50 25 58 27L76 12 72 40Q88 52 80 90Z" fill="#26213a"/><path d="M33 70 50 84 67 70 63 88H37Z" fill="#8a4dff"/><ellipse cx="39" cy="52" rx="5" ry="5.5" fill="#c59cff"/><ellipse cx="61" cy="52" rx="5" ry="5.5" fill="#c59cff"/><circle cx="40" cy="52" r="2" fill="#1a1530"/><circle cx="62" cy="52" r="2" fill="#1a1530"/></svg>`;
function sv() { return CAT; }

const educationLines = [
  ["Institution", PORTFOLIO.education.institution],
  ["Status", PORTFOLIO.education.status],
  ["Degree", PORTFOLIO.education.degree],
  ["Department", PORTFOLIO.education.department],
  ["Graduation year", PORTFOLIO.education.graduationYear],
  ["Notes", PORTFOLIO.education.notes]
].filter((pair) => String(pair[1] || "").trim());

function educationBody() {
  const missing = ["degree", "department", "graduationYear"].filter((key) => !String(PORTFOLIO.education[key] || "").trim());
  const note = missing.length
    ? `<p class="fine">Add ${missing.join(", ")} in js/config.js when you want ${missing.length === 1 ? "it" : "them"} shown here.</p>`
    : "";
  return educationLines.map((pair) => `<h3>${escapeHtml(pair[0])}</h3><p>${escapeHtml(pair[1])}</p>`).join("") + note;
}

const job = PORTFOLIO.experience[0];
function experiencePage() {
  return `<div class="sheet"><article class="job"><h3>${escapeHtml(job.role)}</h3><p><b>${escapeHtml(job.organization)}</b><br>${escapeHtml(job.start)} – ${escapeHtml(job.end)}</p><ul>${job.responsibilities.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>${chipsHtml(job.technologies)}</article><p class="fine">Add another role in the experience array in js/config.js when you have one to include.</p></div>`;
}

function contactPage() {
  const email = isEmail(PORTFOLIO.email)
    ? `<p><a class="btn p" href="mailto:${escapeHtml(PORTFOLIO.email)}">Email ${escapeHtml(PORTFOLIO.name)}</a></p>`
    : `<p class="fine">Add your email address in js/config.js. The contact form will then open an email draft. It does not send messages through a server.</p>`;
  return `<div class="sheet"><p>The direct way to reach me is email.</p>${email}${linkRow([{ url: PORTFOLIO.github, label: "GitHub" }, { url: PORTFOLIO.linkedin, label: "LinkedIn" }])}</div>`;
}

function skillPage() {
  return `<div class="sheet skill-sheet">${PORTFOLIO.skillGroups.map((group) => `<div class="skill-group"><div class="skill-group-title"><b>${escapeHtml(group.name)}</b><span>${group.skills.length}</span></div><div class="skill-grid">${group.skills.map((skill) => `<div class="skill-detail"><div class="skill-detail-top">${markHtml(skill)}<b>${escapeHtml(skill.name)}</b></div></div>`).join("")}</div></div>`).join("")}</div>`;
}

function resumeInner() {
  const contactBits = [
    isEmail(PORTFOLIO.email) ? PORTFOLIO.email : "",
    PORTFOLIO.phone || "",
    isHttp(PORTFOLIO.github) ? PORTFOLIO.github.replace(/^https?:\/\//, "") : "",
    isHttp(PORTFOLIO.linkedin) ? "LinkedIn" : ""
  ].filter(Boolean);
  return `<small>Resume</small><h4>${escapeHtml(PORTFOLIO.name)}</h4><p class="role-line">${escapeHtml(PORTFOLIO.shortRole)}</p>${contactBits.length ? `<p>${contactBits.map(escapeHtml).join("<br>")}</p>` : ""}<p><b>${escapeHtml(job.role)}</b><br>${escapeHtml(job.organization)} · ${escapeHtml(job.start)} – ${escapeHtml(job.end)}<br>${escapeHtml(job.responsibilities[0])}</p><p><b>${escapeHtml(PORTFOLIO.education.institution)}</b><br>${escapeHtml(PORTFOLIO.education.status)}</p><p><b>Projects</b><br>${activeProjects.map((project) => escapeHtml(project.name)).join(" · ")}</p>`;
}

function resumePage() {
  return `<div class="sheet"><div class="resume-face">${resumeInner()}</div><p class="link-row"><button type="button" class="btn p" data-resume-download>Download PDF</button></p><p class="fine">Save your resume as <span class="path">${escapeHtml(PORTFOLIO.resumePath)}</span>. This page is a readable preview, not a generated PDF.</p></div>`;
}

const items = [];
let zc = 0;
function add(entry) {
  entry.zc = ++zc;
  entry.x0 = entry.x;
  entry.y0 = entry.y;
  entry.r0 = entry.r;
  items.push(entry);
}
function V(type, title, body, page) {
  return { type, title, body, page };
}

add({
  id: "about",
  name: "About me",
  cat: "Personal",
  lv: 1,
  x: 36,
  y: 40,
  w: 210,
  h: 270,
  r: -4,
  html: `<div class="tape"></div><div class="face"><div class="polaroid"><div class="im im-mono">PB</div><div class="cap">${escapeHtml(PORTFOLIO.name)}</div></div></div>`,
  v: V("About", PORTFOLIO.name, PORTFOLIO.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") + chipsHtml(PORTFOLIO.interests))
});

add({
  id: "resume",
  name: "Resume",
  cat: "Documents",
  lv: 0,
  x: 270,
  y: 28,
  w: 280,
  h: 390,
  r: -1.5,
  html: `<div class="face"><div class="clip"></div><div class="paper pp fold resume-face">${resumeInner()}</div></div>`,
  v: V("Resume", PORTFOLIO.name, null, resumePage())
});

add({
  id: "sticky",
  name: "Desk note",
  cat: "Personal",
  lv: 3,
  x: 580,
  y: 36,
  w: 168,
  h: 140,
  r: 3,
  html: `<div class="face"><div class="sticky"><span>Build useful</span><span>things.</span></div></div>`,
  v: V("Note", "Build useful things", `<p>A reminder on the desk: I would rather ship something a person can use than polish an idea that stays in a notebook.</p>`)
});

add({
  id: "notes",
  name: "Learning notes",
  cat: "Personal",
  lv: 1,
  x: 575,
  y: 200,
  w: 220,
  h: 210,
  r: 2,
  html: `<div class="face"><div class="note pp">Learning now<br>Full-stack work<br>AI-powered apps<br>Backend<br>Databases</div></div>`,
  v: V("Notes", "What I am learning toward", `<p>These are the areas I am spending time on: full-stack development, AI-powered applications, backend development, and databases.</p>`)
});

add({
  id: "lamp",
  name: "Desk lamp",
  cat: "Decor",
  lv: 4,
  x: 830,
  y: 24,
  w: 150,
  h: 210,
  r: -2,
  themeLamp: true,
  html: `<div class="face"><div class="lamp-shell"><div class="lamp-glow"></div><svg viewBox="0 0 150 210" aria-hidden="true"><path d="M50 26H100L128 82H22Z" class="shade" fill="#d8a93f"/><path d="M58 27H92L106 67H44Z" fill="#f7e3a1" opacity=".8"/><circle cx="75" cy="71" r="9" class="bulb" fill="#fff3b0"/><path d="M75 82V157" stroke="#55566a" stroke-width="8" stroke-linecap="round"/><path d="M55 157H95L111 191H39Z" fill="#6d6e7d"/><ellipse cx="75" cy="193" rx="44" ry="8" fill="#3f404b"/><path d="M57 157H93" stroke="#d7d8df" stroke-width="3" opacity=".7"/></svg><span class="lamp-label">click to switch light</span></div></div>`,
  v: V("Desk lamp", "Light and dark", `<p>Click the lamp to switch the portfolio between light and dark. You can also use the theme button in the header. Drag the lamp if you want it somewhere else.</p>`)
});

add({
  id: "mail",
  name: "Envelope",
  cat: "Contact",
  lv: 2,
  x: 1010,
  y: 40,
  w: 250,
  h: 150,
  r: 2,
  html: `<div class="face"><div class="letter pp"><q>Say hello.</q><span>${escapeHtml(PORTFOLIO.name)}<br>Software developer</span></div></div>`,
  v: V("Contact", "Say hello", null, contactPage())
});

add({
  id: "biz",
  name: "Contact card",
  cat: "Contact",
  lv: 1,
  x: 1020,
  y: 214,
  w: 250,
  h: 130,
  r: -2,
  html: `<div class="face"><div class="biz"><span class="mono">PB</span><div class="bt"><b>${escapeHtml(PORTFOLIO.name)}</b><em>${escapeHtml(PORTFOLIO.shortRole)}</em><span>Email, GitHub, and LinkedIn<br>are linked once they are added.</span></div></div></div>`,
  v: V("Contact", PORTFOLIO.name, null, contactPage())
});

add({
  id: "phone",
  name: "Phone",
  cat: "Contact",
  lv: 2,
  x: 1288,
  y: 48,
  w: 92,
  h: 180,
  r: 6,
  html: `<div class="face"><div class="phone"><div class="scr"><b>${escapeHtml(PORTFOLIO.name.split(" ")[0])}</b><div class="pill">Developer</div><div class="pill">GitHub</div><div class="pill">LinkedIn</div></div></div></div>`,
  v: V("Contact", "Find me online", null, contactPage())
});

const projectSpots = [
  [24, 470, -1.5],
  [292, 486, 1.2],
  [560, 468, -1],
  [828, 484, 1.4],
  [1096, 470, -1]
];
activeProjects.forEach((project, index) => {
  const spot = projectSpots[index] || [28 + (index % 5) * 270, 470 + Math.floor(index / 5) * 320, 0];
  add({
    id: project.id,
    name: project.name,
    cat: "Projects",
    lv: 1,
    x: spot[0],
    y: spot[1],
    w: 248,
    h: 292,
    r: spot[2],
    html: projectFace(project, index),
    v: V("Project", project.name, null, projectPage(project))
  });
});

add({
  id: "timeline",
  name: "Experience",
  cat: "Experience",
  lv: 0,
  x: 28,
  y: 810,
  w: 390,
  h: 230,
  r: 1,
  html: `<div class="face"><div class="old pp"><h4>Experience</h4><div class="tl"><div><b>${escapeHtml(job.start)} – ${escapeHtml(job.end)}</b>${escapeHtml(job.role)}, ${escapeHtml(job.organization)}</div><div><b>Now</b>${escapeHtml(PORTFOLIO.education.status)}</div></div></div></div>`,
  v: V("Experience", job.organization, null, experiencePage())
});

add({
  id: "edu",
  name: "Education",
  cat: "Education",
  lv: 0,
  x: 450,
  y: 830,
  w: 280,
  h: 190,
  r: -2,
  html: `<div class="face"><div class="paper pp fold"><small>Education</small><h4>${escapeHtml(PORTFOLIO.education.institution)}</h4><p>${escapeHtml(PORTFOLIO.education.status)}</p></div></div>`,
  v: V("Education", PORTFOLIO.education.institution, null, `<div class="sheet">${educationBody()}</div>`)
});

add({
  id: "fieldnote",
  name: "Field note",
  cat: "Personal",
  lv: 1,
  x: 760,
  y: 830,
  w: 250,
  h: 150,
  r: 2,
  html: `<div class="face"><div class="note pp" style="font-size:18px;line-height:24px">Make it useful before making it complicated.</div></div>`,
  v: V("Note", "A working rule", `<p>I try to get a useful version working before I spend time on extra complexity.</p>`)
});

add({
  id: "clock",
  name: "Desk clock",
  cat: "Decor",
  lv: 4,
  x: 1040,
  y: 800,
  w: 110,
  h: 110,
  r: 0,
  html: `<div class="face"><svg viewBox="0 0 100 100" class="clk" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#f4f1e8" stroke="#2b2c33" stroke-width="4"/><line class="hh" x1="50" y1="50" x2="50" y2="30" stroke="#1d1d26" stroke-width="4" stroke-linecap="round"/><line class="mh" x1="50" y1="50" x2="50" y2="20" stroke="#1d1d26" stroke-width="3" stroke-linecap="round"/><line class="sh" x1="50" y1="54" x2="50" y2="16" stroke="#d63b4f" stroke-width="1.5"/><circle cx="50" cy="50" r="3" fill="#d63b4f"/></svg></div>`,
  v: V("Clock", "Local time", `<p>The clock on the desk shows the time on this computer.</p>`)
});

add({
  id: "mug",
  name: "Coffee mug",
  cat: "Decor",
  lv: 4,
  x: 1180,
  y: 820,
  w: 100,
  h: 115,
  r: -4,
  html: `<div class="face"><svg viewBox="0 0 100 115" aria-hidden="true"><path class="steam" d="M40 34Q34 24 41 16" stroke="#aab0bd" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="105" rx="36" ry="6" fill="#e4e5ec"/><path d="M80 52H88Q98 52 98 66T88 80H80" stroke="#d96b5b" stroke-width="7" fill="none"/><path d="M20 44H80V82Q80 102 50 102 20 102 20 82Z" fill="#f08a7e"/><ellipse cx="50" cy="44" rx="30" ry="8" fill="#fff4ee"/><ellipse cx="50" cy="45" rx="22" ry="5" fill="#5a3220"/><text x="50" y="80" text-anchor="middle" font-family="Caveat, cursive" font-size="18" fill="#fff8f0">code</text></svg></div>`,
  v: V("Mug", "Coffee mug", `<p>Shake the mug while dragging it if you want a coffee spill. Shake it again to wipe the desk.</p>`)
});

add({
  id: "k1",
  name: "Desk cat",
  cat: "Decor",
  lv: 4,
  x: 40,
  y: 1088,
  w: 84,
  h: 84,
  r: 6,
  html: `<div class="face cut">${CAT}</div>`,
  v: V("Desk", "Desk cat", `<p>A small mascot for the desk. It does not represent a project.</p>`)
});

add({
  id: "skillcard",
  name: "Skills card",
  cat: "Skills",
  lv: 1,
  x: 150,
  y: 1075,
  w: 280,
  h: 150,
  r: -1,
  html: `<div class="tape"></div><div class="face"><div class="skcard pp"><b>Skills</b><div class="skill-lines">HTML · CSS · JavaScript<br>React.js · Node.js · C# .NET<br>MySQL · Git · REST APIs</div><div class="skill-more">+ the rest, grouped below</div></div></div>`,
  v: V("Skills", "Technical skills", null, skillPage())
});

add({
  id: "doodle",
  name: "HTML scrap",
  cat: "Decor",
  lv: 2,
  x: 460,
  y: 1100,
  w: 180,
  h: 130,
  r: -6,
  html: `<div class="face"><div class="paper pp" style="font-family:ui-monospace,monospace;font-size:13px"><div>&lt;h1&gt;Hello&lt;/h1&gt;</div><div class="hw" style="position:relative;left:0;top:18px">a scrap of HTML</div></div></div>`,
  v: V("Scrap", "A scrap of HTML", `<p>A doodle on the desk. It is not a dated claim about a first website.</p>`)
});

add({
  id: "pen",
  name: "Pen",
  cat: "Decor",
  lv: 4,
  x: 700,
  y: 1140,
  w: 150,
  h: 16,
  r: -8,
  roll: 1,
  html: `<div class="face"><div class="pen"></div></div>`,
  v: V("Desk", "Pen", `<p>Part of the desk, not a project.</p>`)
});
add({
  id: "pencil",
  name: "Pencil",
  cat: "Decor",
  lv: 4,
  x: 880,
  y: 1120,
  w: 150,
  h: 16,
  r: 5,
  roll: 1,
  html: `<div class="face"><div class="pencil"></div></div>`,
  v: V("Desk", "Pencil", `<p>Part of the desk, not a project.</p>`)
});
add({
  id: "eraser",
  name: "Eraser",
  cat: "Decor",
  lv: 4,
  x: 1060,
  y: 1160,
  w: 56,
  h: 30,
  r: 12,
  html: `<div class="face"><div class="eraser"></div></div>`,
  v: V("Desk", "Eraser", `<p>Part of the desk, not a project.</p>`)
});

flatSkills.forEach((skill, index) => {
  const col = index % 4;
  const row = Math.floor(index / 4);
  const width = Math.max(150, Math.min(250, Math.round(skill.name.length * 7.2 + 70)));
  add({
    id: "sk-" + skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: skill.name,
    cat: "Skills",
    lv: 4,
    x: 24 + col * 340,
    y: 1288 + row * 72,
    w: width,
    h: 52,
    r: ((index % 5) - 2) * 1.2,
    html: `<div class="face"><div class="skl" style="--c:${["#2bb7a3", "#7b3fe4", "#d8a93f", "#2f7d62", "#243056"][PORTFOLIO.skillGroups.findIndex((group) => group.name === skill.group)] || "#243056"}">${markHtml(skill)}<div><span class="skill-name">${escapeHtml(skill.name)}</span><span class="skill-cat">${escapeHtml(skill.group)}</span></div></div></div>`,
    v: V("Skill · " + skill.group, skill.name, `<p>${escapeHtml(skill.name)} sits with the ${escapeHtml(skill.group.toLowerCase())} skills on this portfolio. There is no proficiency score attached to it.</p>`)
  });
});

add({
  id: "dustbin",
  name: "Dustbin",
  cat: "Decor",
  lv: 5,
  x: 1210,
  y: 1648,
  w: 125,
  h: 145,
  r: 1,
  isDustbin: true,
  html: `<div class="face"><div class="dustbin"><div class="handle"></div><div class="lid"></div><div class="body"><i class="slot s1"></i><i class="slot s2"></i><i class="slot s3"></i></div><i class="dust d1"></i><i class="dust d2"></i><i class="dust d3"></i><i class="dust d4"></i><span class="count">0</span><span class="label">dustbin · click or shake</span></div></div>`,
  v: V("Dustbin", "Dustbin", `<p>Drag something here to set it aside. Open the bin to put an item back. Shake the bin to sweep the desk, then shake it again to restore what was swept.</p>`)
});

add({
  id: "j1",
  name: "Scrap paper",
  cat: "Decor",
  lv: 3,
  x: 860,
  y: 1680,
  w: 160,
  h: 90,
  r: -4,
  html: `<div class="face"><div class="note pp" style="font-size:16px;line-height:22px">Scrap paper<br>nothing important</div></div>`,
  v: V("Scrap", "Scrap paper", `<p>This starts in the dustbin so you can try putting something back.</p>`)
});

const strip = (value) => (value || "").replace(/<[^>]+>/g, " ");
items.forEach((item) => {
  item.text = [item.name, item.cat, item.v.type, item.v.title, strip(item.v.body), strip(item.v.page)].join(" ").toLowerCase();
});

const DESK_TOUR = [
  ["about", "I am Prithiviraj, a software developer. I like building web applications that are useful in practice."],
  ["p-merchant", "Merchant Mind is an inventory management system for grocery shops."],
  ["p-analyzer", "Resume Analyzer extracts resume skills, looks at how often they appear, and generates a skill score."],
  ["p-line", "Line Follower Robot uses a microcontroller, reflectance sensors, a motor driver, and PID-based control."],
  ["timeline", "I interned as a Software Developer at BINI from July 2025 to January 2026, building pages with C# .NET and MySQL."],
  ["skillcard", "Skills are grouped by the kind of work. There are no made-up percentages."],
  ["resume", "The resume is one page here. The PDF download works after the file is added to the project."],
  ["biz", "Contact is email, plus GitHub and LinkedIn once those links are added."]
];

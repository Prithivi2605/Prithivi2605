/* Conventional portfolio sections. Content comes from js/config.js. */
function skillDomId(name) {
  return "sk-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
function showItem(id) {
  const it = items.find((item) => item.id === id);
  if (!it) return;
  if (it.inBin || !it.el) {
    openPlain(it);
    return;
  }
  const rect = it.el.getBoundingClientRect();
  const visible = rect.bottom > 80 && rect.top < innerHeight - 40 && rect.left < innerWidth && rect.right > 0;
  if (visible) openItem(it);
  else openPlain(it);
}
function externalLink(url, label) {
  if (!isHttp(url)) return `<span class="pending">${escapeHtml(label)} link not added</span>`;
  return `<a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}
function mailLink() {
  if (!isEmail(PORTFOLIO.email)) return `<span class="pending">Email not added yet</span>`;
  return `<a class="btn p" href="mailto:${escapeHtml(PORTFOLIO.email)}">${escapeHtml(PORTFOLIO.email)}</a>`;
}

const missingSetup = [];
if (!isEmail(PORTFOLIO.email)) missingSetup.push("email");
if (!isHttp(PORTFOLIO.github)) missingSetup.push("GitHub URL");
if (!isHttp(PORTFOLIO.linkedin)) missingSetup.push("LinkedIn URL");

document.getElementById("intro").innerHTML = `
  <p class="kicker">${escapeHtml(PORTFOLIO.shortRole)}</p>
  <h1 id="intro-title">${escapeHtml(PORTFOLIO.name)}</h1>
  <p class="lede">${escapeHtml(PORTFOLIO.intro)}</p>
  <p class="context">${escapeHtml(PORTFOLIO.context)}</p>
  <div class="actions">
    <a class="btn p" href="#projects">View projects</a>
    <button type="button" class="btn" data-resume-download>Download resume</button>
    <a class="btn" href="#contact">Contact me</a>
  </div>
  <div class="social">${externalLink(PORTFOLIO.github, "GitHub")}${externalLink(PORTFOLIO.linkedin, "LinkedIn")}</div>`;

document.getElementById("about").innerHTML = `
  <h2 id="about-title">About me</h2>
  <div class="about-grid">
    <div class="prose">${PORTFOLIO.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
    <aside class="card">
      <h3>Current interests</h3>
      <ul>${PORTFOLIO.interests.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </aside>
  </div>`;

document.getElementById("skills").innerHTML = `
  <h2 id="skills-title">Technical skills</h2>
  <p class="context">Grouped by the kind of work. These are tools I use. They are not ranked, and there are no proficiency scores.</p>
  <div class="skill-board">${PORTFOLIO.skillGroups.map((group) => `
    <div class="skill-panel">
      <h3>${escapeHtml(group.name)}</h3>
      <ul class="skill-list">${group.skills.map((skill) => `<li><button type="button" data-open="${skillDomId(skill.name)}">${markHtml(skill)}<span>${escapeHtml(skill.name)}</span></button></li>`).join("")}</ul>
    </div>`).join("")}
  </div>`;

document.getElementById("projects").innerHTML = `
  <h2 id="projects-title">Featured projects</h2>
  <p class="context">Descriptions, stacks, and links come from js/config.js. Empty details stay empty.</p>
  <div class="project-grid">${activeProjects.map((project) => `
    <article class="project-card">
      <div class="preview" style="--tint:${project.tint}">${project.image ? `<img src="${escapeHtml(project.image)}" alt="" onerror="this.remove()">` : illustration(project.illustration, project.accent)}</div>
      <div class="body">
        ${project.status ? `<span class="status-pill">${escapeHtml(project.status)}</span>` : ""}
        <h3>${escapeHtml(project.name)}</h3>
        <p>${escapeHtml(project.summary || project.status || "Details have not been added yet.")}</p>
        <div class="actions">
          <button type="button" class="btn p" data-open="${project.id}">View details</button>
          <button type="button" class="btn" data-scroll="${project.id}">Show on desk</button>
        </div>
      </div>
    </article>`).join("")}
  </div>`;

document.getElementById("experience").innerHTML = `
  <h2 id="experience-title">Experience</h2>
  <div class="timeline">${PORTFOLIO.experience.map((role) => `
    <article class="info-card job-card">
      <h3>${escapeHtml(role.role)}</h3>
      <p class="when">${escapeHtml(role.organization)} · ${escapeHtml(role.start)} – ${escapeHtml(role.end)}</p>
      <ul class="plain-list">${role.responsibilities.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      ${chipsHtml(role.technologies)}
      <p><button type="button" class="btn" data-open="timeline">Open on the desk</button></p>
    </article>`).join("")}
  </div>`;

const eduPairs = [
  ["Institution", PORTFOLIO.education.institution],
  ["Status", PORTFOLIO.education.status],
  ["Degree", PORTFOLIO.education.degree],
  ["Department", PORTFOLIO.education.department],
  ["Graduation year", PORTFOLIO.education.graduationYear],
  ["Notes", PORTFOLIO.education.notes]
].filter((pair) => String(pair[1] || "").trim());
document.getElementById("education").innerHTML = `
  <h2 id="education-title">Education</h2>
  <article class="info-card">
    <ul class="edu-list">${eduPairs.map((pair) => `<li><strong>${escapeHtml(pair[0])}</strong><span>${escapeHtml(pair[1])}</span></li>`).join("")}</ul>
    <p><button type="button" class="btn" data-open="edu">Open on the desk</button></p>
  </article>`;

const achievements = Array.isArray(PORTFOLIO.achievements) ? PORTFOLIO.achievements.filter((item) => item && String(item.title || "").trim()) : [];
const achievementsSection = document.getElementById("achievements");
const achievementsLink = document.getElementById("nav-achievements");
if (!achievements.length) achievementsSection.removeAttribute("aria-labelledby");
if (achievements.length) {
  achievementsSection.hidden = false;
  achievementsLink.hidden = false;
  achievementsSection.innerHTML = `
    <h2 id="achievements-title">Achievements and certifications</h2>
    <div class="achieve-list">${achievements.map((item) => `
      <article class="info-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${[item.issuer, item.date].filter(Boolean).map(escapeHtml).join(" · ")}</p>
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
        ${isHttp(item.url) ? `<p><a class="btn" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">View credential</a></p>` : ""}
      </article>`).join("")}
    </div>`;
}

document.getElementById("resume").innerHTML = `
  <h2 id="resume-title">Resume</h2>
  <article class="info-card">
    <p>The page has a readable resume preview. The download uses a PDF you add to the project.</p>
    <p class="setup-note">Save the file as <span class="path">${escapeHtml(PORTFOLIO.resumePath)}</span>.</p>
    <p class="actions"><button type="button" class="btn p" data-resume-download>Download resume</button>
    <button type="button" class="btn" data-open="resume">Preview on the desk</button></p>
    <p class="form-status" id="resume-status" role="status"></p>
  </article>`;

document.getElementById("contact").innerHTML = `
  <h2 id="contact-title">Contact</h2>
  <div class="contact-grid">
    <div>
      <p>Email is the way to reach me. The form checks what you typed, then opens your email app with the message filled in. It is not sent until you send it there.</p>
      <div class="social">${mailLink()}${externalLink(PORTFOLIO.github, "GitHub")}${externalLink(PORTFOLIO.linkedin, "LinkedIn")}</div>
      ${missingSetup.length ? `<p class="setup-note">Still to add in <span class="path">js/config.js</span>: ${missingSetup.map(escapeHtml).join(", ")}.</p>` : ""}
    </div>
    <form class="info-card form" id="contact-form" novalidate>
      <p class="hp"><label>Company <input name="company" tabindex="-1" autocomplete="off"></label></p>
      <label>Name <input id="contact-name" name="name" autocomplete="name" required> <span class="error" id="err-name"></span></label>
      <label>Email <input id="contact-email" name="email" type="email" autocomplete="email" required> <span class="error" id="err-email"></span></label>
      <label>Message <textarea id="contact-message" name="message" required></textarea> <span class="error" id="err-message"></span></label>
      <button type="submit" class="btn p">Write email</button>
      <p class="form-status" id="contact-status" role="status"></p>
    </form>
  </div>`;

document.getElementById("site-footer").innerHTML = `
  <div><strong>${escapeHtml(PORTFOLIO.name)}</strong> · ${escapeHtml(PORTFOLIO.shortRole)}</div>
  <div class="social">${externalLink(PORTFOLIO.github, "GitHub")}${externalLink(PORTFOLIO.linkedin, "LinkedIn")}</div>
  <div>© ${new Date().getFullYear()} ${escapeHtml(PORTFOLIO.name)}</div>`;

async function downloadResume() {
  const status = document.getElementById("resume-status");
  try {
    const response = await fetch(PORTFOLIO.resumePath, { method: "HEAD" });
    if (!response.ok) throw new Error("missing");
    const link = document.createElement("a");
    link.href = PORTFOLIO.resumePath;
    link.download = "Prithiviraj-B-Resume.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (status) status.textContent = "The resume download should start.";
  } catch (err) {
    if (status) status.textContent = `The PDF is not in the project yet. Save it as ${PORTFOLIO.resumePath} and try again.`;
    document.getElementById("resume").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
  }
}

document.addEventListener("click", (event) => {
  const open = event.target.closest("[data-open]");
  if (open) {
    event.preventDefault();
    showItem(open.dataset.open);
    return;
  }
  const scroll = event.target.closest("[data-scroll]");
  if (scroll) {
    const it = items.find((item) => item.id === scroll.dataset.scroll);
    if (it && it.inBin && typeof restoreFromBin === "function") restoreFromBin(it);
    scrollToItem(it);
    return;
  }
  if (event.target.closest("[data-resume-download]")) downloadResume();
});

const form = document.getElementById("contact-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.getElementById("contact-status");
  const name = document.getElementById("contact-name");
  const email = document.getElementById("contact-email");
  const message = document.getElementById("contact-message");
  const errors = { name: "", email: "", message: "" };
  if (name.value.trim().length < 2) errors.name = "Enter your name.";
  if (!isEmail(email.value.trim())) errors.email = "Enter a valid email address.";
  if (message.value.trim().length < 10) errors.message = "Write a message of at least 10 characters.";
  ["name", "email", "message"].forEach((key) => {
    document.getElementById("err-" + key).textContent = errors[key];
    document.getElementById("contact-" + key).setAttribute("aria-invalid", errors[key] ? "true" : "false");
  });
  if (errors.name || errors.email || errors.message) {
    status.textContent = "Check the highlighted fields.";
    status.className = "form-status";
    return;
  }
  if (form.company && form.company.value) {
    status.textContent = "The message could not be prepared.";
    status.className = "form-status";
    return;
  }
  if (!isEmail(PORTFOLIO.email)) {
    status.textContent = "Add your email address in js/config.js first. This form does not send messages to a server.";
    status.className = "form-status";
    return;
  }
  const subject = encodeURIComponent(`Portfolio note from ${name.value.trim()}`);
  const body = encodeURIComponent(`${message.value.trim()}\n\nFrom: ${name.value.trim()} <${email.value.trim()}>`);
  status.textContent = "Your email app should open with this message. It is not sent until you send it from there.";
  status.className = "form-status ok";
  window.location.href = `mailto:${PORTFOLIO.email}?subject=${subject}&body=${body}`;
});

const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("site-nav");
navToggle.addEventListener("click", () => {
  const open = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.textContent = open ? "Close" : "Menu";
});
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "Menu";
  }
});

document.getElementById("themeBtn").addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark"));
});

const arrangeBtn = document.getElementById("bArrange");
const arrangeNote = document.getElementById("arrangeNote");
const coarse = window.matchMedia("(pointer: coarse)");
function syncArrangeButton() {
  arrangeBtn.hidden = !coarse.matches && innerWidth >= 720;
}
syncArrangeButton();
coarse.addEventListener?.("change", syncArrangeButton);
addEventListener("resize", syncArrangeButton);
arrangeBtn.addEventListener("click", () => {
  const on = document.body.classList.toggle("arrange");
  arrangeBtn.setAttribute("aria-pressed", String(on));
  arrangeBtn.textContent = on ? "Done moving" : "Move items";
  arrangeNote.hidden = !on;
  if (on) arrangeNote.focus?.();
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...siteNav.querySelectorAll("a")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.toggleAttribute("aria-current", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
  sections.forEach((section) => observer.observe(section));
}

document.getElementById("themeBtn").setAttribute("aria-pressed", String(document.body.classList.contains("dark")));
if (document.body.classList.contains("dark")) document.getElementById("themeBtn").textContent = "Light theme";

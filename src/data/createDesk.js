import { activeProjects, portfolio } from "./portfolio.js";
import { rememberHome } from "../utils/layout.js";

const groupColors = ["#2bb7a3", "#7b3fe4", "#d8a93f", "#2f7d62", "#243056"];

function add(items, item) {
  item.z = items.length + 1;
  item.inBin = false;
  item.swept = false;
  item.off = false;
  item.dim = false;
  item.hit = false;
  rememberHome(item);
  items.push(item);
}

export function createDesk() {
  const items = [];
  const job = portfolio.experience[0];
  const skills = portfolio.skillGroups.flatMap((group, groupIndex) =>
    group.skills.map((skill) => ({ ...skill, group: group.name, color: groupColors[groupIndex] || "#243056" }))
  );

  add(items, { id: "about", name: "About me", cat: "Personal", lv: 1, x: 18, y: 36, w: 210, h: 270, r: -11, kind: "about", viewer: "about" });
  add(items, { id: "resume", name: "Resume", cat: "Documents", lv: 0, x: 168, y: 78, w: 280, h: 390, r: 6, kind: "resume", viewer: "resume" });
  add(items, { id: "sticky", name: "Desk note", cat: "Personal", lv: 3, x: 430, y: 12, w: 168, h: 140, r: 9, kind: "sticky", viewer: "note", note: "A reminder on the desk: I would rather ship something a person can use than polish an idea that stays in a notebook." });
  add(items, { id: "folded", name: "Folded note", cat: "Personal", lv: 3, x: 1168, y: 36, w: 74, h: 58, r: 12, kind: "folded", viewer: "note", note: "Prithiviraj B. Final-year B.E. Computer Science and Engineering, Kumaraguru College of Technology, Coimbatore, 2023–2027. Open to an entry-level Full-Stack Developer role." });
  add(items, { id: "notes", name: "Learning notes", cat: "Interests", lv: 1, x: 548, y: 128, w: 250, h: 210, r: -8, kind: "notes", viewer: "note", note: portfolio.interests.join(", ") });
  add(items, { id: "lamp", name: "Desk lamp", cat: "Decor", lv: 4, x: 742, y: 48, w: 150, h: 210, r: -7, kind: "lamp", themeLamp: true, viewer: "note", note: "Click the lamp to switch between light and dark. Drag it if you want it somewhere else." });
  add(items, { id: "mail", name: "Envelope", cat: "Contact", lv: 2, x: 890, y: 96, w: 250, h: 150, r: 8, kind: "mail", viewer: "contact" });
  add(items, { id: "biz", name: "Contact card", cat: "Contact", lv: 1, x: 1040, y: 214, w: 250, h: 130, r: -11, kind: "biz", viewer: "contact" });
  add(items, { id: "phone", name: "Phone", cat: "Contact", lv: 2, x: 1264, y: 18, w: 92, h: 180, r: 14, kind: "phone", viewer: "contact" });

  const spots = [[16, 330, -7], [300, 368, 5], [584, 318, -4]];
  activeProjects.forEach((project, index) => {
    const column = index % spots.length;
    const row = Math.floor(index / spots.length);
    const spot = spots[column];
    const x = spot[0];
    const y = spot[1] + row * 530;
    add(items, {
      id: project.id,
      name: project.name,
      cat: "Projects",
      lv: 1,
      x,
      y,
      w: 250,
      h: 330,
      r: spot[2],
      kind: "project",
      projectId: project.id,
      projectIndex: index,
      viewer: "project"
    });
    add(items, {
      id: `pc-${project.id}`,
      name: `Postcard: ${project.name}`,
      cat: "Projects",
      lv: 2,
      x: x + 18,
      y: y + 348,
      w: 210,
      h: 145,
      r: spot[2] > 0 ? -4 : 5,
      kind: "postcard",
      projectId: project.id,
      viewer: "postcard",
      note: project.summary
    });
  });

  add(items, {
    id: "laptop",
    name: "Laptop: all projects",
    cat: "Projects",
    lv: 2,
    x: 1040,
    y: 348,
    w: 320,
    h: 215,
    r: -2,
    kind: "laptop",
    viewer: "projects",
    note: activeProjects.map((project) => project.name).join(", ")
  });

  const certSpots = [[900, 620, 6], [1120, 690, -5], [980, 860, 4]];
  portfolio.certifications.forEach((cert, index) => {
    const extra = index - certSpots.length;
    const spot = certSpots[index] || [80 + (extra % 4) * 250, 1500 + Math.floor(extra / 4) * 190, extra % 2 ? -5 : 6];
    add(items, {
      id: cert.id,
      name: cert.title,
      cat: "Certificates",
      lv: 2,
      x: spot[0],
      y: spot[1],
      w: 230,
      h: 160,
      r: spot[2],
      kind: "cert",
      certId: cert.id,
      viewer: "cert"
    });
  });

  add(items, { id: "timeline", name: "Experience", cat: "Experience", lv: 0, x: 640, y: 1000, w: 390, h: 230, r: 7, kind: "experience", viewer: "experience" });
  portfolio.education.forEach((school, index) => {
    const titles = ["College", "School"];
    add(items, {
      id: index === 0 ? "edu-college" : index === 1 ? "edu-school" : `edu-${index}`,
      name: titles[index] || school.degree,
      cat: "Education",
      lv: 0,
      x: 16 + index * 310,
      y: 1000 + (index % 2) * 28,
      w: 280,
      h: 220,
      r: index % 2 ? 6 : -8,
      kind: "education",
      eduIndex: index,
      viewer: "education"
    });
  });
  add(items, { id: "fieldnote", name: "Field note", cat: "Interests", lv: 1, x: 1060, y: 1040, w: 250, h: 210, r: 8, kind: "field", viewer: "note", note: "Seeking an entry-level Full-Stack Developer or Software Developer role." });
  add(items, { id: "clock", name: "Desk clock", cat: "Decor", lv: 4, x: 1260, y: 600, w: 110, h: 110, r: -14, kind: "clock", viewer: "note", note: "The clock on the desk shows the time on this computer." });
  add(items, { id: "mug", name: "Coffee mug", cat: "Decor", lv: 4, x: 1268, y: 860, w: 100, h: 115, r: 9, kind: "mug", viewer: "note", note: "Shake the mug while dragging it for a coffee spill. Shake it again to wipe the desk." });
  [
    ["k1", "Desk cat", "cat", 900, 500, 84, 84, -16],
    ["k2", "Desk crystal", "crystal", 700, 180, 72, 84, -8],
    ["k3", "Desk axolotl", "axo", 960, 150, 100, 86, 7],
    ["k4", "Desk sprout", "skull", 1320, 220, 74, 86, 9],
    ["k5", "Desk bear", "bear", 640, 48, 86, 86, -7]
  ].forEach(([id, name, mascot, x, y, w, h, r]) => {
    add(items, { id, name, cat: "Decor", lv: 4, x, y, w, h, r, kind: "cat", mascot, viewer: "note", note: "A drawing on the desk, like the cat. It does not represent a project." });
  });
  [
    ["s1", "Cat stamp", "cat", "CAT", 200, 1260, 6],
    ["s2", "Bear stamp", "bear", "BEAR", 40, 1240, -5],
    ["s3", "Axolotl stamp", "axo", "AXO", 1120, 1280, -8]
  ].forEach(([id, name, mascot, stampLabel, x, y, r]) => {
    add(items, { id, name, cat: "Decor", lv: 3, x, y, w: 86, h: 112, r, kind: "stamp", mascot, stampLabel, viewer: "note", note: "A stamp drawn for the desk. It does not represent a project." });
  });
  add(items, { id: "skillcard", name: "Skills card", cat: "Skills", lv: 1, x: 360, y: 1280, w: 280, h: 150, r: 8, kind: "skillcard", viewer: "skills" });
  add(items, { id: "doodle", name: "HTML scrap", cat: "Decor", lv: 2, x: 680, y: 1260, w: 180, h: 130, r: -12, kind: "doodle", viewer: "note", note: "A doodle on the desk. It is not a dated claim about a first website." });
  add(items, { id: "pen", name: "Pen", cat: "Decor", lv: 4, x: 900, y: 1320, w: 150, h: 16, r: -22, kind: "pen", roll: true, viewer: "note", note: "Part of the desk, not a project." });
  add(items, { id: "pencil", name: "Pencil", cat: "Decor", lv: 4, x: 1080, y: 1288, w: 150, h: 16, r: 18, kind: "pencil", roll: true, viewer: "note", note: "Part of the desk, not a project." });
  add(items, { id: "eraser", name: "Eraser", cat: "Decor", lv: 4, x: 1260, y: 1340, w: 56, h: 30, r: 21, kind: "eraser", viewer: "note", note: "Part of the desk, not a project." });

  skills.forEach((skill, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const spot = [
      12 + col * 300 + (row % 2) * 36 + ((index % 3) - 1) * 18,
      1460 + row * 112 + (index % 2 ? 16 : -6),
      ((index * 3) % 13) - 6
    ];
    const w = Math.max(150, Math.min(250, Math.round(skill.name.length * 7.2 + 70)));
    add(items, {
      id: "sk-" + skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: skill.name,
      cat: "Skills",
      lv: 4,
      x: Math.max(8, Math.min(spot[0], 1388 - w)),
      y: spot[1],
      w,
      h: 52,
      r: spot[2],
      kind: "skill",
      skill,
      viewer: "skill"
    });
  });

  add(items, { id: "dustbin", name: "Dustbin", cat: "Decor", lv: 5, x: 1220, y: 2100, w: 125, h: 145, r: 4, kind: "bin", isDustbin: true, viewer: "bin" });
  const scrap = { id: "j1", name: "Scrap paper", cat: "Decor", lv: 3, x: 980, y: 2120, w: 160, h: 90, r: -7, kind: "scrap", viewer: "note", note: "This starts in the dustbin so you can try putting something back." };
  add(items, scrap);
  scrap.inBin = true;

  items.forEach((item) => {
    item.text = [item.name, item.cat, item.note || "", job.organization].join(" ").toLowerCase();
  });
  return items;
}

import { useEffect, useRef, useState } from "react";
import { createDesk } from "../data/createDesk.js";
import { activeProjects, portfolio, tourStops } from "../data/portfolio.js";
import { DESK_W, MESSY_H, messyLabels, organize, restoreHome } from "../utils/layout.js";
import { DeskObject } from "./DeskObject.jsx";
import { ObjectFace } from "./ObjectFace.jsx";
import { Drawer, Toolbar, TourBar } from "./Toolbar.jsx";
import { ViewerBody, viewerKind, viewerTitle } from "./Viewers.jsx";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Desk({ dark, onToggleTheme }) {
  const itemsRef = useRef(null);
  if (!itemsRef.current) itemsRef.current = createDesk();
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const scaleRef = useRef(1);
  const arrangeRef = useRef(false);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const [version, setVersion] = useState(0);
  const [scale, setScale] = useState(1);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 720);
  const [height, setHeight] = useState(MESSY_H);
  const heightRef = useRef(MESSY_H);
  heightRef.current = height;
  const toastTimer = useRef(0);
  const [labels, setLabels] = useState(() => messyLabels());
  const [organized, setOrganized] = useState(false);
  const [arrange, setArrange] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Everything");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [binOpen, setBinOpen] = useState(false);
  const [tour, setTour] = useState(-1);
  const [toast, setToast] = useState("");
  const [spills, setSpills] = useState([]);
  const [resumeNote, setResumeNote] = useState("");
  const basis = DESK_W;

  function refresh() {
    setVersion((value) => value + 1);
  }

  function say(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }

  function syncLamp() {
    const lamp = itemsRef.current.find((item) => item.themeLamp);
    if (!lamp || !stageRef.current) return;
    stageRef.current.style.setProperty("--lamp-x", `${lamp.x + lamp.w * 0.5}px`);
    stageRef.current.style.setProperty("--lamp-y", `${lamp.y + lamp.h * 0.28}px`);
  }

  useEffect(() => {
    arrangeRef.current = arrange;
    document.body.classList.toggle("arrange", arrange);
  }, [arrange]);

  useEffect(() => {
    const fit = () => {
      const nextNarrow = window.innerWidth < 720;
      setNarrow(nextNarrow);
      document.body.classList.toggle("m", nextNarrow);
      const width = wrapRef.current?.clientWidth || window.innerWidth;
      const nextScale = width / DESK_W;
      scaleRef.current = nextScale;
      setScale(nextScale);
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (wrapRef.current) observer.observe(wrapRef.current);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hour = (now.getHours() % 12) * 30 + now.getMinutes() / 2;
      const minute = now.getMinutes() * 6;
      const second = now.getSeconds() * 6;
      document.querySelectorAll(".clk").forEach((clock) => {
        clock.querySelector(".hh")?.setAttribute("transform", `rotate(${hour} 50 50)`);
        clock.querySelector(".mh")?.setAttribute("transform", `rotate(${minute} 50 50)`);
        clock.querySelector(".sh")?.setAttribute("transform", `rotate(${second} 50 50)`);
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [version]);

  useEffect(() => {
    if (!openId && !binOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [openId, binOpen]);

  useEffect(() => {
    if (!browseOpen) return undefined;
    const onClick = (event) => {
      if (event.target.closest("#drw") || event.target.closest("#bMenu")) return;
      setBrowseOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [browseOpen]);

  useEffect(() => {
    const onKey = (event) => {
      const typing = ["INPUT", "TEXTAREA"].includes(event.target.tagName);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        document.getElementById("q")?.focus();
      }
      if (event.key === "Escape" && !openId && !binOpen) {
        event.preventDefault();
        if (typing) {
          setQuery("");
          applyFilter("", category);
          event.target.blur();
          return;
        }
        setQuery("");
        setCategory("Everything");
        setBrowseOpen(false);
        applyFilter("", "Everything");
        return;
      }
      if (typing || openId || binOpen) return;
      if (event.key === "r" || event.key === "R") resetDesk();
      if ((event.key === "o" || event.key === "O") && !narrow) toggleOrganize();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  function applyFilter(nextQuery, nextCategory) {
    const needle = nextQuery.trim().toLowerCase();
    const active = Boolean(needle) || nextCategory !== "Everything";
    itemsRef.current.forEach((item) => {
      const matches = (nextCategory === "Everything" || item.cat === nextCategory) && (!needle || item.text.includes(needle) || item.name.toLowerCase().includes(needle));
      item.dim = active && !matches;
      item.hit = active && matches && item.cat !== "Decor";
    });
    refresh();
  }

  function clearFilter() {
    setQuery("");
    setCategory("Everything");
    setBrowseOpen(false);
    applyFilter("", "Everything");
  }

  function scrollToItem(item) {
    if (!item || !wrapRef.current) return;
    const top = wrapRef.current.getBoundingClientRect().top + window.scrollY + item.y * scaleRef.current - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }

  function openItem(item) {
    if (item.themeLamp) {
      onToggleTheme();
      return;
    }
    if (item.isDustbin) {
      openerRef.current = document.activeElement;
      setBinOpen(true);
      setOpenId(null);
      return;
    }
    openerRef.current = document.activeElement;
    setOpenId(item.id);
    setBinOpen(false);
  }

  function closeDialog() {
    setOpenId(null);
    setBinOpen(false);
    openerRef.current?.focus?.();
  }

  function onBinHover(item, active) {
    const bin = itemsRef.current.find((entry) => entry.isDustbin);
    const node = document.getElementById("obj-dustbin");
    if (!bin || !node || item.isDustbin || item.themeLamp) return;
    const centerX = item.x + item.w / 2;
    const centerY = item.y + item.h / 2;
    const over = active && centerX > bin.x && centerX < bin.x + bin.w && centerY > bin.y && centerY < bin.y + bin.h;
    node.classList.toggle("bin-target", over);
    if (active) item.overBin = over;
  }

  function onDrop(item) {
    document.getElementById("obj-dustbin")?.classList.remove("bin-target");
    syncLamp();
    if (!item.overBin || item.isDustbin || item.themeLamp) {
      item.overBin = false;
      return;
    }
    item.inBin = true;
    item.overBin = false;
    item.x = item.placeX ?? item.x0;
    item.y = item.placeY ?? item.y0;
    item.r = item.placeR ?? item.r0;
    refresh();
  }

  function restore(item) {
    item.inBin = false;
    item.swept = false;
    refresh();
  }

  function onShake(item) {
    if (item.id === "mug") {
      setSpills((current) => current.length ? [] : [
        { id: "s1", x: item.x - 30, y: item.y + item.h - 10, w: 120, h: 70 },
        { id: "s2", x: item.x + 40, y: item.y + item.h + 16, w: 70, h: 46 }
      ]);
      if (spills.length) setToast("");
      else say("Coffee on the desk. Shake the mug again to wipe it.");
      return;
    }
    if (!item.isDustbin || item.shaking) return;
    const loose = itemsRef.current.filter((entry) => !entry.inBin && !entry.off && !entry.isDustbin && !entry.themeLamp);
    if (loose.length) sweepIntoBin(item, loose);
    else vomitFromBin(item, itemsRef.current.filter((entry) => entry.inBin));
  }

  function binArt() {
    return document.querySelector("#obj-dustbin .dustbin");
  }

  function sweepIntoBin(bin, list) {
    bin.shaking = true;
    binArt()?.classList.add("rattle");
    let left = list.length;
    const done = (entry, el) => {
      if (entry._gone) return;
      entry._gone = true;
      entry.inBin = true;
      entry.swept = true;
      if (el) {
        el.style.display = "none";
        el.style.transform = `rotate(${entry.r}deg)`;
      }
      left -= 1;
      if (left > 0) return;
      bin.shaking = false;
      binArt()?.classList.remove("rattle");
      say("Everything went into the dustbin. Shake it again to bring it back.");
      refresh();
    };
    list.forEach((entry, index) => {
      const el = document.getElementById(`obj-${entry.id}`);
      const dx = bin.x + bin.w / 2 - (entry.x + entry.w / 2);
      const dy = bin.y + bin.h / 2 - (entry.y + entry.h / 2);
      if (reduceMotion || !el?.animate) {
        done(entry, el);
        return;
      }
      const animation = el.animate(
        [
          { transform: `rotate(${entry.r}deg)`, opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${entry.r + (index % 2 ? -200 : 200)}deg) scale(.08)`, opacity: 0.12 }
        ],
        { duration: 520, delay: Math.min(index * 14, 650), easing: "cubic-bezier(.55,0,.85,.35)", fill: "forwards" }
      );
      animation.onfinish = () => {
        animation.cancel();
        done(entry, el);
      };
    });
  }

  function vomitFromBin(bin, list) {
    if (!list.length) return;
    bin.shaking = true;
    binArt()?.classList.add("rattle");
    list.forEach((entry, index) => {
      entry.inBin = false;
      entry.swept = false;
      entry._gone = false;
      const el = document.getElementById(`obj-${entry.id}`);
      if (!el) return;
      el.style.display = "";
      el.style.left = `${entry.x}px`;
      el.style.top = `${entry.y}px`;
      const dx = bin.x + bin.w / 2 - (entry.x + entry.w / 2);
      const dy = bin.y + bin.h / 2 - (entry.y + entry.h / 2);
      if (reduceMotion || !el.animate) return;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) rotate(${entry.r - 180}deg) scale(.08)`, opacity: 0.12 },
          { transform: `rotate(${entry.r}deg)`, opacity: 1 }
        ],
        { duration: 620, delay: Math.min(index * 14, 650), easing: "cubic-bezier(.2,.8,.25,1)", fill: "backwards" }
      );
    });
    say("The dustbin put everything back.");
    refresh();
    window.setTimeout(() => {
      bin.shaking = false;
      binArt()?.classList.remove("rattle");
    }, reduceMotion ? 0 : Math.min(list.length * 14, 650) + 640);
  }

  function resetDesk() {
    const keepOrganized = organized && window.innerWidth >= 720;
    itemsRef.current.forEach((item) => {
      item.inBin = item.id === "j1";
      item.swept = false;
      item._gone = false;
      item.dim = false;
      item.hit = false;
    });
    restoreHome(itemsRef.current);
    setQuery("");
    setCategory("Everything");
    setBrowseOpen(false);
    setSpills([]);
    if (keepOrganized) {
      const laid = organize(itemsRef.current, false);
      setLabels(laid.labels);
      setHeight(laid.height);
    } else {
      setLabels(messyLabels());
      setHeight(MESSY_H);
      setOrganized(false);
    }
    refresh();
    syncLamp();
  }

  function toggleOrganize() {
    if (window.innerWidth < 720) return;
    if (organized) {
      restoreHome(itemsRef.current);
      itemsRef.current.forEach((item) => { item.off = false; });
      setLabels(messyLabels());
      setHeight(MESSY_H);
      setOrganized(false);
    } else {
      const laid = organize(itemsRef.current, false);
      setLabels(laid.labels);
      setHeight(laid.height);
      setOrganized(true);
    }
    refresh();
    syncLamp();
  }

  async function downloadResume() {
    try {
      const response = await fetch(portfolio.resumePath, { method: "HEAD" });
      if (!response.ok) throw new Error("missing");
      const link = document.createElement("a");
      link.href = portfolio.resumePath;
      link.download = "Prithiviraj-B-Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setResumeNote("The resume download should start.");
    } catch {
      setResumeNote("The PDF is not in the project yet. Save it as public/resume/Prithiviraj-B-Resume.pdf.");
    }
  }

  function showTour(index) {
    const stop = tourStops[index];
    if (!stop) {
      setTour(-1);
      closeDialog();
      return;
    }
    const item = itemsRef.current.find((entry) => entry.id === stop[0]);
    if (item?.inBin) item.inBin = false;
    setTour(index);
    refresh();
    if (item) {
      scrollToItem(item);
      openItem(item.themeLamp || item.isDustbin ? item : item);
    }
  }

  const categories = ["Everything", "Documents", "Projects", "Experience", "Education", "Personal", "Contact", "Skills"]
    .map((name) => ({
      name,
      count: name === "Everything"
        ? itemsRef.current.filter((item) => item.cat !== "Decor").length
        : itemsRef.current.filter((item) => item.cat === name).length
    }))
    .filter((entry) => entry.name === "Everything" || entry.count);

  const openItemData = itemsRef.current.find((item) => item.id === openId) || null;
  const openProject = openItemData?.kind === "project"
    ? activeProjects.find((entry) => entry.id === openItemData.id)
    : null;
  const binned = itemsRef.current.filter((item) => item.inBin);
  const binCount = binned.length;

  return (
    <>
      <div id="wrap" ref={wrapRef} style={{ height: height * scale }} onPointerDown={(event) => {
        if (event.target.closest(".obj") || event.target.closest("#hero")) return;
        if (!query && category === "Everything") return;
        clearFilter();
      }}>
        <div id="hero">
          <b>{portfolio.name}</b>
          <span>{portfolio.shortRole}</span>
          <button type="button" className="p" onClick={() => {
            const resume = itemsRef.current.find((entry) => entry.id === "resume");
            if (!resume) return;
            if (resume.inBin) restore(resume);
            openItem(resume);
          }}>Resume</button>
          <button type="button" onClick={() => showTour(0)}>Quick tour</button>
        </div>
        <div id="stage" ref={stageRef} style={{ width: basis, height, transform: `scale(${scale})` }}>
          {labels.map((label) => (
            <div key={label.id} className={label.kind} style={{ left: label.x, top: label.y }}>{label.text}</div>
          ))}
          {spills.map((spill) => <i key={spill.id} className="spill" style={{ left: spill.x, top: spill.y, width: spill.w, height: spill.h }} />)}
          {itemsRef.current.map((item) => (
            <DeskObject
              key={item.id}
              item={item}
              dark={dark}
              binCount={binCount}
              scaleRef={scaleRef}
              heightRef={heightRef}
              arrangeRef={arrangeRef}
              layoutVersion={version}
              onOpen={openItem}
              onBinHover={onBinHover}
              onShake={onShake}
              onDrop={onDrop}
            />
          ))}
        </div>
      </div>

      <Toolbar
        query={query}
        onQuery={(value) => { setQuery(value); applyFilter(value, category); }}
        onClearQuery={() => { setQuery(""); applyFilter("", category); }}
        browseOpen={browseOpen}
        filtering={category !== "Everything"}
        onBrowse={() => setBrowseOpen((value) => !value)}
        organized={organized}
        onOrganize={toggleOrganize}
        onReset={resetDesk}
        onSkills={() => { const card = itemsRef.current.find((item) => item.id === "skillcard"); if (card?.inBin) restore(card); scrollToItem(card); }}
        onTour={() => showTour(0)}
        showMove={narrow || window.matchMedia("(pointer: coarse)").matches}
        arrange={arrange}
        onArrange={() => setArrange((value) => !value)}
        narrow={narrow}
      />
      <Drawer
        open={browseOpen}
        categories={categories}
        active={category}
        onPick={(name) => {
          const next = category === name ? "Everything" : name;
          setCategory(next);
          setBrowseOpen(false);
          applyFilter(query, next);
          const hit = itemsRef.current.find((item) => item.hit);
          if (hit) scrollToItem(hit);
        }}
      />
      {tour >= 0 && (
        <TourBar
          index={tour}
          total={tourStops.length}
          text={tourStops[tour][1]}
          onBack={() => showTour(tour - 1)}
          onNext={() => showTour(tour + 1)}
          onSkip={() => { setTour(-1); closeDialog(); }}
        />
      )}
      <div id="binToast" className={toast ? "on" : ""} role="status">{toast}</div>
      <div id="veil" className={openId || binOpen ? "on" : ""} onClick={closeDialog} />
      <div
        id="panel"
        className={`${openId || binOpen ? "open" : ""}${binOpen ? " bin-open" : ""}${openProject ? " project-open" : ""}`}
        style={openProject ? { "--sheet-tint": openProject.tint, "--sheet-accent": openProject.accent } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        hidden={!openId && !binOpen}
      >
        {binOpen && (
          <div className="bin-panel">
            <div className="bin-head">
              <div>
                <h2 id="dialog-title">Dustbin</h2>
                <p>{binned.length ? `${binned.length} item${binned.length === 1 ? "" : "s"} stored here` : "Nothing is in the dustbin"}</p>
              </div>
              <button type="button" className="btn" ref={closeRef} onClick={closeDialog}>Close</button>
            </div>
            {binned.length === 0 && <div className="bin-empty">The bin is empty. Drag something here when you want it off the desk.</div>}
            <div className="bin-grid">
              {binned.map((item) => {
                const preview = Math.min(120 / item.w, 74 / item.h);
                return (
                  <div className="bin-item" key={item.id}>
                    <div className="thumb">
                      <div style={{ position: "absolute", left: "50%", top: "50%", width: item.w, height: item.h, marginLeft: -item.w / 2, marginTop: -item.h / 2, transform: `scale(${preview})` }}>
                        <ObjectFace item={item} dark={dark} binCount={0} />
                      </div>
                    </div>
                    <span className="bn">{item.name}</span>
                    <span className="bc">{item.cat}</span>
                    <button type="button" className="restore" onClick={() => restore(item)}>Put back on desk</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {openItemData && (
          <>
            <div className="vh">
              <div>
                <small>{viewerKind(openItemData)}</small>
                <h2 id="dialog-title">{viewerTitle(openItemData)}</h2>
              </div>
              <button type="button" id="x" ref={closeRef} onClick={closeDialog}>Close</button>
            </div>
            <ViewerBody item={openItemData} dark={dark} onDownload={downloadResume} />
            {openItemData.viewer === "resume" && resumeNote && <p className="fine resume-note">{resumeNote}</p>}
          </>
        )}
      </div>
    </>
  );
}


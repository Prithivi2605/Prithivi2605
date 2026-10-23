import { useLayoutEffect, useRef } from "react";
import { DESK_W, MESSY_H } from "../utils/layout.js";
import { playDrop, playHover, playLift, slideMove, slideStart, slideStop, unlockSound } from "../utils/sfx.js";
import { ObjectFace } from "./ObjectFace.jsx";

export function DeskObject({ item, dark, binCount, scaleRef, stageWidthRef, heightRef, arrangeRef, layoutVersion, stains = [], onOpen, onBinHover, onShake, onDrop }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const shakeRef = useRef({ ax: { d: 0, seg: 0, opp: 0 }, ay: { d: 0, seg: 0, opp: 0 }, last: null, rev: [], cool: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || drag.current?.moved) return;
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;
    el.style.width = `${item.w}px`;
    el.style.height = `${item.h}px`;
    el.style.transform = `rotate(${item.r}deg)`;
    el.style.zIndex = String(item.z);
    el.style.display = item.inBin ? "none" : "";
  }, [layoutVersion, item.inBin, item.off, item.x, item.y, item.r, item.z, item.w, item.h]);

  function paint(x, y, rotation, lift) {
    const el = ref.current;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `rotate(${rotation}deg) scale(${lift ? 1.04 : 1})`;
  }

  function onPointerDown(event) {
    unlockSound();
    if (item.off) return;
    const touch = event.pointerType === "touch" || event.pointerType === "pen";
    if (touch && !arrangeRef.current && item.id !== "mug" && !item.isDustbin) {
      drag.current = { tap: true, x: event.clientX, y: event.clientY };
      return;
    }
    if (item.isDustbin || item.id === "mug") {
      shakeRef.current.last = { x: event.clientX, y: event.clientY };
      shakeRef.current.rev = [];
      shakeRef.current.ax = { d: 0, seg: 0, opp: 0 };
      shakeRef.current.ay = { d: 0, seg: 0, opp: 0 };
    }
    item.placeX = item.x;
    item.placeY = item.y;
    item.placeR = item.r;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      tap: false,
      x: event.clientX,
      y: event.clientY,
      ox: item.x,
      oy: item.y,
      moved: false,
      pid: event.pointerId,
      flips: 0,
      lastDx: 0
    };
  }

  function onPointerMove(event) {
    const state = drag.current;
    if (!state || state.tap || state.pid !== event.pointerId) return;
    if (item.isDustbin) noteShake(event, state, { seg: 45, opp: 14, count: 6, window: 1000 });
    if (item.id === "mug") noteShake(event, state, { seg: 40, opp: 12, count: 5, window: 900 });
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.moved && Math.hypot(dx, dy) < 5) return;
    if (!state.moved) {
      state.moved = true;
      playLift(item);
      slideStart(item);
      ref.current.classList.add("drag");
      ref.current.style.zIndex = "9000";
    }
    slideMove(Math.hypot(dx, dy));
    const scale = scaleRef.current || 1;
    const limitW = stageWidthRef?.current || DESK_W;
    const limitH = heightRef.current || MESSY_H;
    const x = Math.max(-20, Math.min(limitW - item.w + 20, state.ox + dx / scale));
    const y = Math.max(-20, Math.min(limitH - item.h + 20, state.oy + dy / scale));
    item.x = x;
    item.y = y;
    paint(x, y, item.r, true);
    if (!item.isDustbin && !item.themeLamp) onBinHover(item, true);
    state.x = event.clientX;
    state.y = event.clientY;
    state.ox = x;
    state.oy = y;
  }

  function finish(event) {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    if (state.tap) {
      if (Math.hypot(event.clientX - state.x, event.clientY - state.y) < 12) onOpen(item);
      return;
    }
    slideStop();
    ref.current.classList.remove("drag");
    paint(item.x, item.y, item.r, false);
    ref.current.style.zIndex = String(item.z);
    if (!state.moved) {
      onOpen(item);
      return;
    }
    const droppedIn = item.overBin;
    onBinHover(item, false);
    onDrop(item);
    if (!droppedIn) playDrop(item);
  }

  function noteShake(event, state, limits) {
    const sh = shakeRef.current;
    if (!sh.last) return;
    const now = performance.now();
    feed(sh.ax, event.clientX - sh.last.x, now, sh, limits);
    feed(sh.ay, event.clientY - sh.last.y, now, sh, limits);
    sh.last = { x: event.clientX, y: event.clientY };
    sh.rev = sh.rev.filter((time) => now - time <= limits.window);
    if (sh.rev.length >= limits.count && now > sh.cool) {
      sh.rev = [];
      sh.cool = now + 1200;
      state.moved = true;
      onShake(item);
    }
  }

  const label = item.themeLamp
    ? `Desk lamp, ${dark ? "turn the light on" : "turn the light off"}`
    : item.isDustbin
      ? "Dustbin, click to open or drag items here"
      : `${item.name}, open`;

  return (
    <div
      id={`obj-${item.id}`}
      ref={ref}
      className={`obj lv${item.lv}${item.themeLamp ? " lamp-object" : ""}${item.dim ? " dim" : ""}${item.hit ? " hit" : ""}${item.off ? " off" : ""}${item.concealed ? " hide" : ""}`}
      role="button"
      tabIndex={item.inBin || item.off ? -1 : 0}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={() => { slideStop(); drag.current = null; ref.current?.classList.remove("drag"); onBinHover(item, false); }}
      onMouseEnter={() => playHover(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item);
        }
      }}
    >
      <ObjectFace item={item} dark={dark} binCount={binCount} />
      {stains.map((stain) => (
        <i key={stain.id} className="spill" style={{ left: stain.x, top: stain.y, width: stain.w, height: stain.h, transform: `rotate(${stain.rotate}deg)`, borderRadius: stain.radius }} />
      ))}
      <div className="tip">{item.name}</div>
    </div>
  );
}

function feed(axis, delta, now, shake, limits) {
  if (!delta) return;
  const sign = delta > 0 ? 1 : -1;
  const amount = Math.abs(delta);
  if (!axis.d) {
    axis.d = sign;
    axis.seg = amount;
    return;
  }
  if (sign === axis.d) {
    axis.seg += amount;
    axis.opp = 0;
    return;
  }
  axis.opp += amount;
  if (axis.opp >= limits.opp) {
    if (axis.seg >= limits.seg) shake.rev.push(now);
    axis.d = sign;
    axis.seg = axis.opp;
    axis.opp = 0;
  }
}

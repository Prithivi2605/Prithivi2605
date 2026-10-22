import { useLayoutEffect, useRef } from "react";
import { DESK_W, MESSY_H } from "../utils/layout.js";
import { ObjectFace } from "./ObjectFace.jsx";

export function DeskObject({ item, dark, binCount, scaleRef, heightRef, arrangeRef, layoutVersion, onOpen, onBinHover, onShake, onDrop }) {
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
    if (item.off) return;
    const touch = event.pointerType === "touch" || event.pointerType === "pen";
    if (touch && !arrangeRef.current) {
      drag.current = { tap: true, x: event.clientX, y: event.clientY };
      return;
    }
    if (item.isDustbin) {
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
    if (item.isDustbin) noteShake(event, state);
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.moved && Math.hypot(dx, dy) < 5) return;
    if (!state.moved) {
      state.moved = true;
      ref.current.classList.add("drag");
      ref.current.style.zIndex = "9000";
    }
    const scale = scaleRef.current || 1;
    const limitH = heightRef.current || MESSY_H;
    const x = Math.max(-20, Math.min(DESK_W - item.w + 20, state.ox + dx / scale));
    const y = Math.max(-20, Math.min(limitH - item.h + 20, state.oy + dy / scale));
    item.x = x;
    item.y = y;
    paint(x, y, item.r, true);
    if (!item.isDustbin && !item.themeLamp) onBinHover(item, true);
    if (item.id === "mug") {
      const sign = Math.sign(dx) || state.lastDx;
      if (state.lastDx && sign !== state.lastDx) state.flips += 1;
      state.lastDx = sign;
    }
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
    ref.current.classList.remove("drag");
    paint(item.x, item.y, item.r, false);
    ref.current.style.zIndex = String(item.z);
    if (!state.moved) {
      onOpen(item);
      return;
    }
    onBinHover(item, false);
    onDrop(item);
    if (item.id === "mug" && state.flips >= 4) onShake(item);
  }

  function noteShake(event, state) {
    const sh = shakeRef.current;
    if (!sh.last) return;
    const now = performance.now();
    feed(sh.ax, event.clientX - sh.last.x, now, sh);
    feed(sh.ay, event.clientY - sh.last.y, now, sh);
    sh.last = { x: event.clientX, y: event.clientY };
    sh.rev = sh.rev.filter((time) => now - time <= 1000);
    if (sh.rev.length >= 6 && now > sh.cool) {
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
      className={`obj lv${item.lv}${item.themeLamp ? " lamp-object" : ""}${item.dim ? " dim" : ""}${item.hit ? " hit" : ""}${item.off ? " off" : ""}`}
      role="button"
      tabIndex={item.inBin || item.off ? -1 : 0}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={() => { drag.current = null; ref.current?.classList.remove("drag"); onBinHover(item, false); }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item);
        }
      }}
    >
      <ObjectFace item={item} dark={dark} binCount={binCount} />
      <div className="tip">{item.name}</div>
    </div>
  );
}

function feed(axis, delta, now, shake) {
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
  if (axis.opp >= 14) {
    if (axis.seg >= 45) shake.rev.push(now);
    axis.d = sign;
    axis.seg = axis.opp;
    axis.opp = 0;
  }
}

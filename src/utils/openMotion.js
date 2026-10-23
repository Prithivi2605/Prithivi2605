function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function frames(item, tx, ty, scale) {
  const spin = (hash(item.id) % 15) - 7;
  const hop = 14 + (hash(item.id) % 16);
  const tilt = item.r || 0;
  if (item.kind === "project") {
    return [
      { transform: `translate(0px, 0px) rotate(${tilt}deg) scale(1)` },
      { transform: `translate(${tx * 0.18}px, ${-hop}px) rotate(${spin}deg) scale(1.14)`, offset: 0.32 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg) scale(${scale})` }
    ];
  }
  if (item.kind === "postcard") {
    return [
      { transform: `translate(0px, 0px) rotate(${tilt + spin}deg) scale(0.96)` },
      { transform: `translate(${tx * 0.45}px, ${ty * 0.15 - hop}px) rotate(${-spin}deg) scale(1.08)`, offset: 0.46 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg) scale(${scale})` }
    ];
  }
  if (item.kind === "laptop") {
    return [
      { transform: `translate(0px, 0px) rotate(${tilt}deg) scale(1)` },
      { transform: `translate(${tx * 0.55}px, ${ty * 0.08}px) rotate(0deg) scale(1.05)`, offset: 0.34 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg) scale(${scale})` }
    ];
  }
  if (item.kind === "cert") {
    return [
      { transform: `translate(0px, 0px) rotate(${tilt}deg) scale(1)` },
      { transform: `translate(${tx * 0.12}px, ${-hop}px) rotate(${tilt + spin}deg) scale(1.1)`, offset: 0.3 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg) scale(${scale})` }
    ];
  }
  if (item.kind === "sticky" || item.kind === "notes" || item.kind === "field" || item.kind === "folded") {
    return [
      { transform: `translate(0px, 0px) rotate(${tilt}deg) scale(1)` },
      { transform: `translate(${tx * 0.06}px, ${-hop}px) rotate(${tilt + spin}deg) scale(1.16)`, offset: 0.24 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${spin / 3}deg) scale(${scale})` }
    ];
  }
  if (item.kind === "resume" || item.kind === "education" || item.kind === "experience") {
    return [
      { transform: `translate(0px, 0px) rotate(${tilt}deg) scale(1)` },
      { transform: `translate(0px, ${-hop}px) rotate(0deg) scale(1.05)`, offset: 0.22 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg) scale(${scale})` }
    ];
  }
  return [
    { transform: `translate(0px, 0px) rotate(${tilt}deg) scale(1)` },
    { transform: `translate(${tx * 0.08}px, ${ty * 0.08 - hop}px) rotate(${tilt + spin / 2}deg) scale(1.07)`, offset: 0.2 },
    { transform: `translate(${tx}px, ${ty}px) rotate(${tilt / 2}deg) scale(${scale})` }
  ];
}

export function flyDuration(item) {
  if (item.kind === "postcard") return 680;
  if (item.kind === "project") return 620;
  if (item.kind === "laptop") return 520;
  if (item.kind === "sticky" || item.kind === "notes" || item.kind === "field" || item.kind === "folded") return 480;
  return 560;
}

export function flyOpen(item) {
  const node = document.getElementById(`obj-${item.id}`);
  const face = node?.querySelector(".face");
  if (!node || !face) return null;
  const rect = node.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  const flyer = document.createElement("div");
  flyer.className = `flyer lv${item.lv || 2}`;
  flyer.style.left = `${rect.left}px`;
  flyer.style.top = `${rect.top}px`;
  flyer.style.width = `${rect.width}px`;
  flyer.style.height = `${rect.height}px`;
  const inner = document.createElement("div");
  inner.style.width = `${item.w}px`;
  inner.style.height = `${item.h}px`;
  inner.style.transform = `scale(${rect.width / item.w})`;
  inner.style.transformOrigin = "0 0";
  inner.appendChild(face.cloneNode(true));
  flyer.appendChild(inner);
  document.body.appendChild(flyer);
  const tx = window.innerWidth / 2 - (rect.left + rect.width / 2);
  const ty = window.innerHeight / 2 - (rect.top + rect.height / 2);
  const scale = Math.min(window.innerWidth * 0.34 / rect.width, window.innerHeight * 0.4 / rect.height, 2.6);
  const motion = frames(item, tx, ty, scale);
  const animation = flyer.animate(motion, { duration: flyDuration(item), easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
  animation.onfinish = () => {
    flyer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" }).onfinish = () => flyer.remove();
  };
  return flyer;
}

export function flyHome(item, done) {
  const node = document.getElementById(`obj-${item.id}`);
  const face = node?.querySelector(".face");
  if (!node || !face) return null;
  const rect = node.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  const flyer = document.createElement("div");
  flyer.className = `flyer lv${item.lv || 2}`;
  flyer.style.left = `${rect.left}px`;
  flyer.style.top = `${rect.top}px`;
  flyer.style.width = `${rect.width}px`;
  flyer.style.height = `${rect.height}px`;
  const inner = document.createElement("div");
  inner.style.width = `${item.w}px`;
  inner.style.height = `${item.h}px`;
  inner.style.transform = `scale(${rect.width / item.w})`;
  inner.style.transformOrigin = "0 0";
  inner.appendChild(face.cloneNode(true));
  flyer.appendChild(inner);
  document.body.appendChild(flyer);
  const tx = window.innerWidth / 2 - (rect.left + rect.width / 2);
  const ty = window.innerHeight / 2 - (rect.top + rect.height / 2);
  const scale = Math.min(window.innerWidth * 0.34 / rect.width, window.innerHeight * 0.4 / rect.height, 2.6);
  const motion = frames(item, tx, ty, scale).map(({ offset, ...frame }) => frame).reverse();
  const animation = flyer.animate(motion, { duration: Math.round(flyDuration(item) * 0.9), easing: "cubic-bezier(.4,.1,.3,1)", fill: "forwards" });
  animation.onfinish = () => {
    item.concealed = false;
    node.classList.remove("hide");
    flyer.remove();
    done?.();
  };
  return flyer;
}

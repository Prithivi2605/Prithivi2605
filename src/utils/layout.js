export const DESK_W = 1400;
export const MESSY_H = 2140;

export function place(item, x, y, r) {
  item.x = x;
  item.y = y;
  item.r = r;
}

export function rememberHome(item) {
  item.x0 = item.x;
  item.y0 = item.y;
  item.r0 = item.r;
}

export function restoreHome(items) {
  items.forEach((item) => {
    item.x = item.x0;
    item.y = item.y0;
    item.r = item.r0;
    item.off = false;
  });
}

export function organize(items, narrow) {
  const order = ["Documents", "Projects", "Experience", "Education", "Personal", "Contact", "Skills"];
  const width = narrow ? 580 : 1300;
  const gap = narrow ? 16 : 24;
  const x0 = narrow ? 30 : 50;
  let y = narrow ? 156 : 70;
  const labels = [];

  order.forEach((category) => {
    const group = items.filter((item) => item.cat === category && !item.isDustbin);
    if (!group.length) return;
    labels.push({ id: category, text: category, x: x0, y, kind: "olabel" });
    y += 44;
    let x = x0;
    let rowHeight = 0;
    group.forEach((item) => {
      if (x + item.w > x0 + width) {
        x = x0;
        y += rowHeight + gap;
        rowHeight = 0;
      }
      item.x = x;
      item.y = y;
      item.r = 0;
      item.off = false;
      x += item.w + gap;
      rowHeight = Math.max(rowHeight, item.h);
    });
    y += rowHeight + 50;
  });

  const lamp = items.find((item) => item.themeLamp);
  if (lamp && !narrow) {
    lamp.off = false;
    lamp.r = 0;
    lamp.x = 1110;
    lamp.y = 72;
  }

  const bin = items.find((item) => item.isDustbin);
  let bottom = y + 48;
  if (bin) {
    bin.off = false;
    bin.r = 0;
    bin.x = x0 + width - bin.w;
    bin.y = y + 12;
    bottom = bin.y + bin.h + (narrow ? 210 : 72);
  }

  items.forEach((item) => {
    if (item.id === "mug") return;
    if (item.cat === "Decor" && !item.themeLamp && !item.isDustbin) item.off = true;
  });

  const mug = items.find((item) => item.id === "mug");
  if (mug) {
    mug.off = false;
    if (narrow && bin) {
      mug.r = -6;
      mug.x = Math.max(x0, bin.x - mug.w - 16);
      mug.y = bin.y + 16;
    } else {
      mug.r = 8;
      mug.x = 1288;
      mug.y = 72;
    }
  }
  if (lamp && narrow && bin) {
    lamp.off = false;
    lamp.r = 0;
    lamp.x = x0;
    lamp.y = bin.y;
  }

  return { labels, height: Math.max(bottom, narrow ? y + 220 : 1510) };
}

export function messyLabels() {
  return [];
}

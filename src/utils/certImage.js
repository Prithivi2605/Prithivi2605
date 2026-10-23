const files = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,gif,avif}", { eager: true, import: "default" });

function slug(value) {
  return String(value).toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fileName(path) {
  return slug(path.split("/").pop());
}

export function certImage(cert) {
  if (!cert) return "";
  if (cert.image && /^(https?:|data:|\/)/.test(cert.image)) return cert.image;
  const wanted = new Set([cert.id, cert.image, cert.title].filter(Boolean).map(slug));
  const match = Object.entries(files).find(([path]) => wanted.has(fileName(path)));
  return match ? match[1] : "";
}

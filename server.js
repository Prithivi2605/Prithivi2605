import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, "dist");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";
const asset = /\.(?:js|css|map|svg|png|jpe?g|gif|webp|ico|woff2?|pdf|txt|json)$/i;

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.static(dist, { index: false, fallthrough: true, maxAge: "1h" }));

app.get("/", (_req, res, next) => {
  const index = path.join(dist, "index.html");
  if (!fs.existsSync(index)) {
    res.status(500).type("text/plain").send("Build the site first: npm run build");
    return;
  }
  res.sendFile(index, next);
});

app.use((req, res) => {
  if (req.path.startsWith("/assets/") || asset.test(req.path)) {
    res.status(404).type("text/plain").send("Not found");
    return;
  }
  const missing = path.join(dist, "404.html");
  if (fs.existsSync(missing)) {
    res.status(404).sendFile(missing);
    return;
  }
  res.status(404).type("text/plain").send("Not found");
});

const server = app.listen(port, host, () => {
  console.log(`Portfolio at http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

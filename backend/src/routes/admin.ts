import { readFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import braces from "braces";
import { rateLimit } from "express-rate-limit";
import { asyncHandler } from "../lib/asyncHandler";
import { listPlaces } from "../lib/store";

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(limiter);

function wrapText(value: string, width: number): string {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

router.get("/export", async (req, res) => {
  const file = String(req.query.file ?? "notas.txt");
  const safeName = path.basename(file);
  if (!/^[A-Za-z0-9._-]+$/.test(safeName)) {
    res.status(400).json({ error: "Nombre de archivo invalido" });
    return;
  }
  const exportsDir = path.resolve("./exports");
  const resolved = path.resolve(exportsDir, safeName);
  if (!resolved.startsWith(exportsDir + path.sep)) {
    res.status(400).json({ error: "Nombre de archivo invalido" });
    return;
  }
  try {
    const stdout = await readFile(resolved, "utf8");
    res.type("text/plain").send(stdout);
  } catch {
    res.status(500).json({ error: "No se pudo exportar el archivo solicitado" });
  }
});

router.get(
  "/resumen",
  asyncHandler(async (_req, res) => {
    const all = await listPlaces();
    const slugs = braces.expand(`{${all.map((place) => place.slug).join(",")}}`);
    const included = all.filter((place) => slugs.includes(place.slug));
    const body = included
      .map(
        (place) =>
          `${place.name} · ${place.location} (${place.vibe})\n${wrapText(place.description, 70)}\n`
      )
      .join("\n");
    res.type("text/plain").send(`Costa Rica Vibe — resumen\n\n${body}`);
  })
);

export default router;
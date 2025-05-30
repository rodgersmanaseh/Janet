import type { Express } from "express";
import fs from "fs/promises";
import path from "path";

const ARTICLES_FILE = path.join(process.cwd(), "data/articles.json");

// Ensure file exists
async function ensureArticlesFile() {
  try {
    await fs.access(ARTICLES_FILE);
  } catch {
    await fs.mkdir(path.dirname(ARTICLES_FILE), { recursive: true });
    await fs.writeFile(ARTICLES_FILE, "[]");
  }
}

// Read and write helpers
async function readArticles() {
  await ensureArticlesFile();
  const data = await fs.readFile(ARTICLES_FILE, "utf-8");
  return JSON.parse(data);
}
async function writeArticles(data: any) {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(data, null, 2));
}

export async function registerRoutes(app: Express) {
  // Dummy login
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "cedarmond2024") {
      return res.json({
        user: { id: 1, username: "admin", role: "admin" },
        token: "admin-token"
      });
    }
    res.status(401).json({ error: "Invalid credentials" });
  });

  // List articles
  app.get("/api/articles", async (_req, res) => {
    const articles = await readArticles();
    res.json(articles);
  });

  // Create new article
  app.post("/api/articles", async (req, res) => {
    const articles = await readArticles();
    const newArticle = { id: Date.now(), ...req.body };
    articles.push(newArticle);
    await writeArticles(articles);
    res.status(201).json(newArticle);
  });

  // Update article
  app.put("/api/articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const articles = await readArticles();
    const index = articles.findIndex((a: any) => a.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    articles[index] = { ...articles[index], ...req.body };
    await writeArticles(articles);
    res.json(articles[index]);
  });

  // Delete article
  app.delete("/api/articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const articles = await readArticles();
    const filtered = articles.filter((a: any) => a.id !== id);
    await writeArticles(filtered);
    res.status(204).send();
  });
}

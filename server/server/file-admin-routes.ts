import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";

// Hardcoded admin credentials
const ADMIN_USER = {
  username: "admin",
  password: "cedarmond2024", // use env variables in production
  role: "admin",
};

// File where articles will be stored
const ARTICLES_FILE = path.join(__dirname, "articles.json");

// Helper to read and write articles from file
function readArticles() {
  if (!fs.existsSync(ARTICLES_FILE)) return [];
  return JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
}

function writeArticles(articles: any[]) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      return res.json({
        user: { username: ADMIN_USER.username, role: ADMIN_USER.role },
        token: "admin-token-static",
      });
    }

    res.status(401).json({ error: "Invalid credentials" });
  });

  // Get all articles
  app.get("/api/articles", (req, res) => {
    const articles = readArticles();
    res.json(articles);
  });

  // Create a new article
  app.post("/api/articles", (req, res) => {
    const articles = readArticles();
    const newArticle = {
      id: Date.now(),
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };
    articles.push(newArticle);
    writeArticles(articles);
    res.status(201).json(newArticle);
  });

  // Delete article by ID
  app.delete("/api/articles/:id", (req, res) => {
    const id = parseInt(req.params.id);
    let articles = readArticles();
    const initialLength = articles.length;
    articles = articles.filter((a) => a.id !== id);
    writeArticles(articles);
    if (articles.length === initialLength) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.status(204).send();
  });

  const server = createServer(app);
  return server;
}

import express from "express";
import { registerRoutes } from "./file-admin-routes";

const app = express();
app.use(express.json());

registerRoutes(app).then((server) => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});

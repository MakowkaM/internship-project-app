const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { analyzeNote } = require("./llm");
const config = require("./config");

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json());

const router = express.Router();

// healthcheck (ważne pod k8s / AWS)
app.get("/health", (req, res) => res.send("OK"));

// GET
router.get("/notes", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(result.rows);
});

// POST
router.post("/notes", async (req, res) => {
  const { content } = req.body;

  const ai = await analyzeNote(content);

  const result = await pool.query(
    "INSERT INTO notes(content, summary, title) VALUES($1,$2,$3) RETURNING *",
    [content, ai.summary, ai.title]
  );

  res.json(result.rows[0]);
});

// PUT
router.put("/notes/:id", async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;

  const ai = await analyzeNote(content);

  const result = await pool.query(
    "UPDATE notes SET content=$1, summary=$2, title=$3 WHERE id=$4 RETURNING *",
    [content, ai.summary, ai.title, id]
  );

  res.json(result.rows[0]);
});

// DELETE
router.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM notes WHERE id=$1", [id]);
  res.sendStatus(204);
});

app.use("/api", router);

app.listen(config.port, () =>
  console.log(`API running on ${config.port}`)
);
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./db");
const { analyzeNote } = require("./llm");
const config = require("./config");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const router = express.Router();

// healthcheck
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
  const note = result.rows[0];
  io.emit("note:created", note);
  res.json(note);
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
  const note = result.rows[0];
  io.emit("note:updated", note);
  res.json(note);
});

// DELETE
router.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM notes WHERE id=$1", [id]);
  io.emit("note:deleted", { id: Number(id) });
  res.sendStatus(204);
});

app.use("/api", router);

server.listen(config.port, () =>
  console.log(`API running on ${config.port}`)
);

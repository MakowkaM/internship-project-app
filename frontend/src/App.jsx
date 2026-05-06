import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const s = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#0f0f13",
    color: "#e8e8f0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: "40px 20px",
  },
  container: { maxWidth: "680px", margin: "0 auto" },
  heading: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "32px",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  form: {
    backgroundColor: "#1a1a24",
    border: "1px solid #2a2a3a",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "32px",
  },
  textarea: {
    width: "100%",
    backgroundColor: "#0f0f13",
    border: "1px solid #2a2a3a",
    borderRadius: "8px",
    color: "#e8e8f0",
    fontSize: "0.95rem",
    padding: "12px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },
  row: { display: "flex", gap: "10px", marginTop: "12px" },
  btn: (color = "#6c63ff") => ({
    backgroundColor: color,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    opacity: 1,
  }),
  btnOutline: (color = "#ff5c5c") => ({
    backgroundColor: "transparent",
    color: color,
    border: `1px solid ${color}`,
    borderRadius: "6px",
    padding: "5px 14px",
    fontSize: "0.8rem",
    cursor: "pointer",
  }),
  noteCard: {
    backgroundColor: "#1a1a24",
    border: "1px solid #2a2a3a",
    borderRadius: "12px",
    padding: "18px 20px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "0.7rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#555570",
    marginBottom: "3px",
  },
  noteTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#ffffff",
  },
  noteContent: {
    fontSize: "0.9rem",
    color: "#b0b0c8",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  noteSummary: {
    fontSize: "0.85rem",
    color: "#9d97e8",
    lineHeight: "1.4",
    marginBottom: "4px",
  },
  divider: {
    borderTop: "1px solid #2a2a3a",
    margin: "12px 0",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#6c63ff",
    fontSize: "0.9rem",
    padding: "14px 0",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #2a2a3a",
    borderTop: "2px solid #6c63ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center",
    color: "#555570",
    marginTop: "60px",
    fontSize: "0.95rem",
  },
};

function Spinner({ text }) {
  return (
    <div style={s.loading}>
      <div style={s.spinner} />
      {text}
    </div>
  );
}

function NoteCard({ note, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.trim() || draft === note.content) { setEditing(false); return; }
    setSaving(true);
    await onUpdate(note.id, draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={s.noteCard}>
      {note.title && (
        <>
          <div style={s.label}>Title</div>
          <div style={s.noteTitle}>{note.title}</div>
        </>
      )}

      <div style={s.label}>Content</div>
      {editing ? (
        <>
          <textarea
            style={{ ...s.textarea, marginBottom: "10px" }}
            value={draft}
            rows={4}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          {saving ? (
            <Spinner text="Generating title & summary..." />
          ) : (
            <div style={s.row}>
              <button style={s.btn()} onClick={handleSave}>Save</button>
              <button style={s.btnOutline("#888")} onClick={() => { setEditing(false); setDraft(note.content); }}>
                Cancel
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={s.noteContent}>{note.content}</div>
      )}

      {note.summary && !editing && (
        <>
          <div style={s.divider} />
          <div style={s.label}>Summary</div>
          <div style={s.noteSummary}>{note.summary}</div>
        </>
      )}

      {!editing && !saving && (
        <div style={{ ...s.row, marginTop: "14px" }}>
          <button style={s.btn("#3a3a50")} onClick={() => setEditing(true)}>Edit</button>
          <button style={s.btnOutline()} onClick={() => onDelete(note.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchNotes = async () => {
    const res = await axios.get(`${API}/notes`);
    setNotes(res.data);
  };

  useEffect(() => { fetchNotes(); }, []);

  const addNote = async () => {
    if (!content.trim()) return;
    setAdding(true);
    await axios.post(`${API}/notes`, { content });
    setContent("");
    await fetchNotes();
    setAdding(false);
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/notes/${id}`);
    fetchNotes();
  };

  const updateNote = async (id, newContent) => {
    await axios.put(`${API}/notes/${id}`, { content: newContent });
    await fetchNotes();
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={s.root}>
        <div style={s.container}>
          <h1 style={s.heading}>📝 Notes</h1>

          <div style={s.form}>
            <textarea
              style={s.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write a new note..."
              disabled={adding}
            />
            {adding ? (
              <Spinner text="Generating title & summary..." />
            ) : (
              <button style={s.btn()} onClick={addNote}>Add note</button>
            )}
          </div>

          {notes.length === 0 ? (
            <p style={s.empty}>No notes yet. Add your first one above.</p>
          ) : (
            notes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onDelete={deleteNote}
                onUpdate={updateNote}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

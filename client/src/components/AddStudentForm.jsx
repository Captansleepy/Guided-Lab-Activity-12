import { useState } from "react";

function AddStudentForm({ onAdd, disabled }) {
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [score, setScore] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (name.trim() === "" || major.trim() === "" || score === "") {
      return;
    }

    const added = await onAdd({
      name: name.trim(),
      major: major.trim(),
      score: Number(score)
    });

    if (!added) return;

    setName("");
    setMajor("");
    setScore("");
  }

  return (
    <section className="panel">
      <h2>Add Student</h2>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="Name"
          aria-label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />

        <input
          type="text"
          placeholder="Major"
          aria-label="Major"
          required
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          disabled={disabled}
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Score"
          aria-label="Score"
          required
          value={score}
          onChange={(e) => setScore(e.target.value)}
          disabled={disabled}
        />

        <button type="submit" disabled={disabled}>
          Add
        </button>
      </form>

      {disabled && (
        <p className="note">Login first to add students.</p>
      )}
    </section>
  );
}

export default AddStudentForm;

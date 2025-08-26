import { useState } from "react";
import { api } from "../lib/api";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
];

export default function AddPartner() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
    forgot_key: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.username || !form.password || !form.role || !form.forgot_key) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createUser(form);
      const status = (res as any)?.status ?? 'success';
      const message = (res as any)?.message;
      if (status === 'success') {
        setSuccess(message || "Partner added successfully!");
        setForm({ username: "", password: "", role: "user", forgot_key: "" });
      } else {
        setError(message || "Failed to add partner.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add Partner</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Username</label>
          <input
            type="text"
            name="username"
            className="w-full border px-3 py-2 rounded"
            value={form.username}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border px-3 py-2 rounded"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Role</label>
          <select
            name="role"
            className="w-full border px-3 py-2 rounded"
            value={form.role}
            onChange={handleChange}
            required
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Forgot Key</label>
          <input
            type="text"
            name="forgot_key"
            className="w-full border px-3 py-2 rounded"
            value={form.forgot_key}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Partner"}
        </button>
      </form>
    </div>
  );
}
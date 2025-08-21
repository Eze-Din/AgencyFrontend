import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Simple postData helper for demonstration
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [forgotKey, setForgotKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const backendForgotUrl = import.meta.env.VITE_BACKEND_FORGOT_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await postData(backendForgotUrl, {
        username,
        forgot_key: forgotKey,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (result.status === "success") {
        setSuccess(result.message || "Password reset successful!");
        setUsername('');
        setForgotKey('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message || "Password reset failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Forgot Key</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={forgotKey}
            onChange={e => setForgotKey(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Confirm Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className="mt-4 text-center">
            <Link to="/" className="text-blue-600 hover:underline">
            Back to Login
            </Link>
        </div>
      </form>
    </div>
  );
}
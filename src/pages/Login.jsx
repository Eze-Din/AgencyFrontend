// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postData } from "../services/api"; // make sure you create this file

const Login: React.FC = () => {
  const backendLoginUrl = import.meta.env.VITE_BACKEND_LOGIN_URL;
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const data = await postData(backendLoginUrl, { username, password });

      switch (data.status) {
        case 200:
          setMessageColor("text-green-600");
          setMessage(data.message || "Login successful");
          setTimeout(() => navigate("/dashboard"), 1000);
          break;

        case 400:
        case 401:
        case 404:
        case 500:
          setMessageColor("text-red-600");
          setMessage(data.message || "Something went wrong");
          break;

        default:
          setMessageColor("text-red-600");
          setMessage(data.message || `Error: ${data.status}`);
          break;
      }
    } catch (error: unknown) {
      setMessageColor("text-red-600");
      if (error instanceof Error) setMessage("Network error: " + error.message);
      else setMessage("Network error: Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back!</h1>

        {message && (
          <div className={`text-center mb-4 ${messageColor}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="loginForm">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/forgot"
            className="text-purple-600 hover:underline font-medium"
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

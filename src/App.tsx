import React, { useState } from "react";

interface ApiResponse {
  status?: string;
  code?: number;
  message?: string;
  [key: string]: any;
}

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let json: ApiResponse = {};
  try {
    json = await response.json();
  } catch {
    // No JSON response
  }

  return { status: response.status, ...json };
}

const Login: React.FC = () => {
  const backendLoginUrl = process.env.REACT_APP_BACKEND_LOGIN_URL;
  console.log("Backend URL:", backendLoginUrl);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const data = await postData(backendLoginUrl, {
        username,
        password,
      });

      switch (data.status) {
        case 200:
          setMessageColor("text-green-600");
          setMessage(data.message || "Login successful");
          // Redirect after successful login
          window.location.href = "/dashboard";
          break;

        case 400:
          setMessageColor("text-red-600");
          setMessage(data.message || "Bad Request");
          break;

        case 401:
          setMessageColor("text-red-600");
          setMessage(data.message || "Unauthorized: Invalid credentials");
          break;

        case 404:
          setMessageColor("text-red-600");
          setMessage(data.message || "Not Found");
          break;

        case 500:
          setMessageColor("text-red-600");
          setMessage(data.message || "Server error, try again later");
          break;

        default:
          setMessageColor("text-red-600");
          setMessage(data.message || `Error: ${data.status}`);
          break;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("Network error: " + error.message);
      } else {
        setMessage("Network error: Unknown error");
      }
      setMessageColor("text-red-600");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome</h1>

        {message && (
          <div className={`text-center mb-4 ${messageColor}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="loginForm">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Login
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

import { useState } from "react";
import "./App.css";

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add CSRF token here if your backend requires it
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}

function App() {
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const data = await postData( 
        "https://agency-tmh2.onrender.com/api/login",
        { username, password }
      );

      if (data.status === "success") {
        setMessageColor("text-green-600");
        setMessage(data.message);
        // Redirect after successful login
        window.location.href = "/dashboard";
      } else {
        setMessageColor("text-red-600");
        setMessage(data.message || "Login failed");
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
}

export default App;

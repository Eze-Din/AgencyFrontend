//import React from "react";

export default function CvLists() {
  // You can use the role from localStorage to customize the view if needed
  const role = localStorage.getItem("role");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">CV Lists</h1>
      <p>
        {role === "admin"
          ? "You are viewing all CVs as Admin."
          : "You are viewing CVs as a Partner."}
      </p>
      {/* Render CV list here */}
    </div>
  );
}
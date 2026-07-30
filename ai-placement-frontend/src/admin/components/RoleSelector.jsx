import React from "react";

export default function RoleSelector({ role, setRole }) {
  return (
    <div className="flex justify-center gap-6 mb-6">
      <div
        onClick={() => setRole("user")}
        className={`cursor-pointer w-44 h-36 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
          role === "user"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white border-gray-300 hover:border-blue-500"
        }`}
      >
        <span className="text-5xl">👤</span>
        <h2 className="mt-2 font-bold text-lg">USER</h2>
      </div>

      <div
        onClick={() => setRole("admin")}
        className={`cursor-pointer w-44 h-36 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
          role === "admin"
            ? "bg-red-600 text-white border-red-600"
            : "bg-white border-gray-300 hover:border-red-500"
        }`}
      >
        <span className="text-5xl">🛡️</span>
        <h2 className="mt-2 font-bold text-lg">ADMIN</h2>
      </div>
    </div>
  );
}
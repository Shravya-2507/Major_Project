import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = role === "admin" ? "/auth/admin/signup" : "/auth/signup";
      const payload = role === "admin" ? { full_name: form.name, email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);

      if (data.success) {
        alert(role === "admin" ? "Admin account created" : "Account created successfully");
        navigate(role === "admin" ? "/login" : "/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[420px]">
        <h1 className="text-3xl font-bold text-center mb-6">Signup</h1>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setRole("user")} className={`flex-1 p-3 rounded ${role === "user" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
            User
          </button>
          <button onClick={() => setRole("admin")} className={`flex-1 p-3 rounded ${role === "admin" ? "bg-red-600 text-white" : "bg-gray-200"}`}>
            Admin
          </button>
        </div>

        <form onSubmit={handleSignup}>
          <input placeholder="Name" className="border p-3 rounded w-full mb-4" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" className="border p-3 rounded w-full mb-4" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" className="border p-3 rounded w-full mb-4" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="bg-green-600 text-white w-full p-3 rounded" disabled={loading}>{loading ? "Please wait..." : "Signup"}</button>
        </form>
      </div>
    </div>
  );
}
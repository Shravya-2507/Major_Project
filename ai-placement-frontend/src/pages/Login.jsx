import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = role === "admin" ? "/auth/admin/login" : "/auth/login";
      const { data } = await api.post(endpoint, { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user || data.admin));

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[400px]">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setRole("user")} className={`flex-1 p-3 rounded ${role === "user" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
            User
          </button>
          <button onClick={() => setRole("admin")} className={`flex-1 p-3 rounded ${role === "admin" ? "bg-red-600 text-white" : "bg-gray-200"}`}>
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" className="border p-3 w-full rounded mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="border p-3 w-full rounded mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-3 rounded" disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
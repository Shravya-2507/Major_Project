import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser({ email, password });

      // 1. Save credentials to stay logged in
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 2. Go to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2rem] shadow-xl w-96 border border-gray-50">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Welcome Back 👋
        </h2>

        <input 
          className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all" 
          placeholder="Email" 
          type="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          className="w-full p-4 mb-6 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all" 
          placeholder="Password" 
          type="password" 
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition disabled:bg-gray-400 shadow-lg shadow-purple-100"
        >
          {loading ? "Checking..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <span onClick={() => navigate("/signup")} className="text-purple-600 cursor-pointer font-bold">Sign Up</span>
        </p>
      </form>
    </div>
  );
}

export default Login;
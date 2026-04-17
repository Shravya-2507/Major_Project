import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupUser(formData);
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.message || "Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-[2rem] shadow-xl w-96 border border-gray-50">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Create Account ✨
        </h2>

        <input 
          className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all" 
          placeholder="Full Name" 
          required
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input 
          className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all" 
          placeholder="Email" 
          type="email"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input 
          className="w-full p-4 mb-6 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all" 
          placeholder="Password" 
          type="password" 
          required
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition disabled:bg-gray-400 shadow-lg shadow-purple-100"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <span onClick={() => navigate("/login")} className="text-purple-600 cursor-pointer font-bold">Login</span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
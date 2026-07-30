import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser, signupAdmin } from "../services/api";

function Signup() {

  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);


  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      let response;


      if (role === "admin") {

        response = await signupAdmin({
          full_name: formData.name,
          email: formData.email,
          password: formData.password
        });

      } else {

        response = await signupUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

      }


      alert(
        role === "admin"
          ? "Admin account created successfully! Please login."
          : "Account created successfully! Please login."
      );


      navigate("/login");


    } catch (err) {

      console.error("Signup error:", err);

      alert(
        err.message ||
        "Signup failed. Try a different email."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">

      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-[2rem] shadow-xl w-96 border border-gray-50"
      >

        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Create Account
        </h2>


        {/* Role Selection */}

        <div className="flex gap-3 mb-6">

          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex-1 py-3 rounded-xl font-bold ${
              role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            User
          </button>


          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-3 rounded-xl font-bold ${
              role === "admin"
                ? "bg-red-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Admin
          </button>

        </div>



        <input
          className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={(e)=>
            setFormData({
              ...formData,
              name:e.target.value
            })
          }
        />


        <input
          className="w-full p-4 mb-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none"
          placeholder="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e)=>
            setFormData({
              ...formData,
              email:e.target.value
            })
          }
        />


        <input
          className="w-full p-4 mb-6 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none"
          placeholder="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e)=>
            setFormData({
              ...formData,
              password:e.target.value
            })
          }
        />


        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-4 rounded-xl font-bold transition ${
            role === "admin"
              ? "bg-red-600"
              : "bg-purple-600"
          }`}
        >

          {
            loading
              ? "Creating Account..."
              : role === "admin"
                ? "Create Admin"
                : "Sign Up"
          }

        </button>


        <p className="text-center text-sm text-gray-500 mt-4">

          Already have an account?

          <span
            onClick={() => navigate("/login")}
            className="text-purple-600 cursor-pointer font-bold ml-1"
          >
            Login
          </span>

        </p>


      </form>

    </div>

  );

}

export default Signup;
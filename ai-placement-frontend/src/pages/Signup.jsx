function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow w-96">

        <h2 className="text-2xl font-bold text-purple-700 mb-6">
          Create Account ✨
        </h2>

        <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Name" />
        <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Email" />
        <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Password" type="password" />

        <button className="w-full bg-purple-600 text-white py-3 rounded-xl hover:scale-105 transition">
          Sign Up
        </button>

      </div>
    </div>
  );
}

export default Signup;
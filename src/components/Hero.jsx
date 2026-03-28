function Hero() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
      
      <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
        Crack Your Placements <br /> Without Stress 🚀
      </h1>

      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Practice interviews, analyze your resume, and improve step by step — 
        no pressure, just progress.
      </p>

      <div className="space-x-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition">
          Start Practicing
        </button>

        <button className="bg-white px-6 py-3 rounded-full shadow hover:scale-105 transition">
          Explore Features
        </button>
      </div>

    </div>
  );
}

export default Hero;
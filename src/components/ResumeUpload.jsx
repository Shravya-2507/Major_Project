function ResumeUpload() {
  return (
    <div className="flex flex-col items-center py-20 bg-gray-50">

      <h2 className="text-3xl font-bold mb-4">
        Upload Your Resume 📤
      </h2>

      <p className="text-gray-600 mb-8 text-center max-w-lg">
        Don’t worry if it's not perfect — we’ll help you improve it step by step.
      </p>

      <div className="bg-white p-10 rounded-2xl shadow-lg text-center border border-gray-200 hover:shadow-xl transition">
        
        <input type="file" className="mb-4" />

        <br />

        <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:scale-105 transition">
          Analyze Resume
        </button>

      </div>

    </div>
  );
}

export default ResumeUpload;
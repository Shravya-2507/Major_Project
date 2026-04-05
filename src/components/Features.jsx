function Features() {
  return (
    <div className="py-20 bg-white text-center">

      <h2 className="text-3xl font-bold mb-12">
        What You Can Do Here ✨
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10">

        {[
          { title: "Resume Analysis 📄", desc: "Understand your resume better." },
          { title: "Syllabus Mapping 📚", desc: "Know what you're missing." },
          { title: "Mock Interviews 🎤", desc: "Practice like real interviews." },
          { title: "Skill Gap 🔍", desc: "Find and fix weak areas." },
          { title: "Feedback 💡", desc: "Get suggestions to improve." },
          { title: "Ranking 🏆", desc: "Track your progress." },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow hover:shadow-xl hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Features;
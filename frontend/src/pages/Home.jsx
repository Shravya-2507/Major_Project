import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Sparkles
} from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "AI Resume Analysis",
      desc: "ATS scoring and skill matching"
    },
    {
      icon: MessageSquare,
      title: "Smart Interviews",
      desc: "AI-powered interview evaluation"
    }
  ];

  return (
    <div
      className="
      min-h-screen
      w-full
      relative
      overflow-hidden
      bg-gradient-to-br
      from-purple-100
      via-blue-50
      to-indigo-100
      flex
      flex-col
      items-center
      justify-center
      px-6
      "
    >

      {/* Background Glow */}

      <div
        className="
        absolute
        top-10
        left-10
        w-72
        h-72
        bg-purple-400
        rounded-full
        blur-3xl
        opacity-30
        "
      />

      <div
        className="
        absolute
        bottom-10
        right-10
        w-80
        h-80
        bg-blue-400
        rounded-full
        blur-3xl
        opacity-30
        "
      />


      {/* Hero Section */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
        text-center
        max-w-4xl
        z-10
        "
      >

        <div
          className="
          inline-flex
          items-center
          gap-2
          px-5
          py-2
          rounded-full
          bg-white/70
          backdrop-blur
          shadow-md
          text-purple-700
          font-semibold
          mb-5
          "
        >
          <Sparkles size={18}/>
          AI Powered Career Assistant
        </div>


        <h1
          className="
          text-5xl
          md:text-6xl
          font-extrabold
          bg-gradient-to-r
          from-purple-700
          via-blue-600
          to-indigo-700
          bg-clip-text
          text-transparent
          "
        >
          Evalora
        </h1>


        <h2
          className="
          mt-3
          text-2xl
          md:text-3xl
          font-bold
          text-gray-800
          "
        >
        </h2>


        <p
          className="
          mt-4
          text-gray-600
          text-lg
          max-w-2xl
          mx-auto
          "
        >
          Practice interviews, analyze resumes, improve coding skills,
          and get AI-powered career insights.
        </p>



        {/* Buttons */}

        <div
          className="
          mt-8
          flex
          justify-center
          gap-5
          "
        >

          <button
            onClick={() => navigate("/signup")}
            className="
            px-8
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-purple-600
            to-blue-600
            text-white
            font-bold
            shadow-xl
            hover:scale-105
            transition
            "
          >
            Get Started
          </button>


          <button
            onClick={() => navigate("/login")}
            className="
            px-8
            py-3
            rounded-2xl
            bg-white
            text-gray-800
            font-bold
            shadow-xl
            hover:scale-105
            transition
            "
          >
            Login
          </button>

        </div>


      </motion.div>



      {/* Feature Cards */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="
        grid
        md:grid-cols-2
        gap-6
        mt-10
        max-w-3xl
        z-10
        "
      >

        {features.map((feature,index)=>{

          const Icon = feature.icon;

          return (

            <div
              key={index}
              className="
              bg-white/70
              backdrop-blur-xl
              rounded-3xl
              p-6
              shadow-xl
              border
              border-white
              hover:-translate-y-2
              transition
              "
            >

              <Icon
                size={35}
                className="text-purple-600 mb-4"
              />


              <h3
                className="
                font-bold
                text-xl
                text-gray-800
                "
              >
                {feature.title}
              </h3>


              <p
                className="
                mt-2
                text-gray-600
                "
              >
                {feature.desc}
              </p>


            </div>

          );

        })}


      </motion.div>


    </div>
  );
}

export default Home;
import { useEffect, useState } from "react";
import background from "../assets/background.png";
import { motion } from "framer-motion";

const banners = [
  {
    // quoteBn: "📖 কঠোর পরিশ্রমই ভর্তি যুদ্ধে জয়ী হওয়ার চাবিকাঠি।",
    // quoteEn: "Hard work always beats talent.",
  },
  {
    // quoteBn: "🎓 যারা চেষ্টা করে, তারাই স্বপ্ন পূরণ করে।",
    // quoteEn: "Dreams come true for those who hustle.",
  },
  {
    // quoteBn: "🔥 প্রতিদিন ছোট ছোট প্রচেষ্টা বড় সাফল্য আনে।",
    // quoteEn: "Small efforts every day build success.",
  }
]

const notices = [
  "📢 Dedicated Medical Exam Batch আসছে শীঘ্রই!",
  "🎯 University Wise Admission Batch শুরুর প্রস্তুতি চলছে...",
  "🔥 Limited Seats Available – Register Now!",
  "📚 Question Bank এ 2000+ Dedicated MCQ যুক্ত হয়েছে ✅",
  "📝 প্রতিদিন নতুন Practice Test – আপনার প্রস্তুতি হবে আরও শক্তিশালী!",
  "🎓 Expert Faculty Team আপনাকে দিচ্ছে ১-১ গাইডলাইন",
  "⏳ ভর্তি যুদ্ধের কাউন্টডাউন শুরু – আজই যোগ দিন Trikon Academy তে!",
  "💡 Regular Mock Exams + Detailed Analysis – জানুন আপনার দুর্বল দিকগুলো",
  "🏆 গত বছরের 80% শিক্ষার্থী তাদের পছন্দের ক্যাম্পাসে ভর্তি হয়েছে!",
  "🚀 Trikon Academy – Admission Success Starts Here!",
]

function Home() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔥 Hero Banner */}
      <div className="relative w-[90%] md:w-[85%] mx-auto h-[250px] md:h-[320px] mt-6 rounded-3xl overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/5 to-transparent"></div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 h-full flex flex-col justify-center items-center px-6 text-center"
        >
          <h2 className="text-lg md:text-xl font-light text-white mb-2 tracking-wide">
            🚀 Welcome to <span className="font-bold">Trikon Academy</span>
          </h2>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg leading-snug mb-3">
            {banners[active].quoteBn}
          </h1>
          <p className="text-xs md:text-base text-white/9 font-light italic">
            {banners[active].quoteEn}
          </p>
        </motion.div>

        {/* Indicators */}
        <div className="absolute bottom-4 flex gap-2 justify-center w-full z-20">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                active === i ? "bg-white scale-110" : "bg-white/40"
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* 🎯 Notice Marquee */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-2 overflow-hidden mt-6 rounded-md shadow-md">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
          {[...notices, ...notices].map((notice, i) => (
            <span
              key={i}
              className="font-semibold text-sm md:text-base mx-10 tracking-wide"
            >
              {notice}
            </span>
          ))}
        </div>
      </div>

      {/* 🚀 Features Section */}
      <div className="py-14 px-6 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10">
          ✨ Why Choose <span className="text-indigo-600">Trikon Academy</span>?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: "📚",
              title: "Unlimited Question Bank",
              desc: "অসংখ্য MCQ + Practice Session – যতবার খুশি চেষ্টা করুন। 🚀 ভর্তি যুদ্ধের জন্য প্রস্তুত হোন।",
              color: "from-green-400 to-emerald-500",
            },
            {
              icon: "🎯",
              title: "Dedicated Exam Batches",
              desc: "Expert Faculty + Mock Test 🔥 Real Exam Experience & Detailed Analysis।",
              color: "from-red-500 to-pink-600",
            },
            {
              icon: "🏆",
              title: "Success Stories",
              desc: "গত বছর 80% শিক্ষার্থী তাদের স্বপ্নের ক্যাম্পাসে ভর্তি হয়েছে! 🌟",
              color: "from-indigo-500 to-purple-600",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-md p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all"
            >
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r ${f.color} text-white text-2xl mb-4 shadow-md`}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🎓 Mission */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-14 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Admission Success Starts Here 🎯
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 text-base md:text-lg">
          At <span className="font-semibold">Trikon Academy</span>, we prepare
          students smartly for Medical & University admission exams with proper
          guidance, daily practice & motivation 🚀
        </p>
      </div>

       {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6">
        <a
          href="/courses"
          className="px-6 py-3 w-64 rounded-full bg-white/90 text-blue-700 font-semibold shadow-lg 
          hover:bg-blue-600 hover:text-white transform hover:scale-105 transition-all duration-300 text-center"
        >
          🎓 Explore Our Courses
        </a>
        <a
          href="https://www.youtube.com/@trikonacademyedu"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 w-64 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow-lg 
          hover:from-red-600 hover:to-red-800 transform hover:scale-105 transition-all duration-300 text-center"
        >
          ▶ Visit Our YouTube
        </a>
      </div> 

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center text-sm py-4 mt-auto">
        © {new Date().getFullYear()} Trikon Academy. All Rights Reserved. Designed & Developed by Joy Sarkar
      </footer>

      <style> {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;

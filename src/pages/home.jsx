import { useEffect, useState } from "react";
import background from "../assets/background.png"; // ✅ ঠিক path

const banners = [
  {
    quoteBn: "📖 কঠোর পরিশ্রমই ভর্তি যুদ্ধে জয়ী হওয়ার চাবিকাঠি।",
    quoteEn: "Hard work always beats talent.",
    gradient: "from-pink-400 via-red-300 to-yellow-300",
  },
  {
    quoteBn: "🎓 যারা চেষ্টা করে, তারাই স্বপ্ন পূরণ করে।",
    quoteEn: "Dreams come true for those who hustle.",
    gradient: "from-indigo-400 via-purple-400 to-pink-300",
  },
  {
    quoteBn: "🔥 প্রতিদিন ছোট ছোট প্রচেষ্টা বড় সাফল্য আনে।",
    quoteEn: "Small efforts every day build success.",
    gradient: "from-blue-400 via-cyan-300 to-green-300",
  },
];

// ✅ Notice messages
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
  " 📖কোর্স সেকশন – চেক করে এখনি ভর্তি হয়ে যাও তোমার পছন্দের কোর্সে ,!",

];

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
      {/* 🔥 Banner Section with Background Image */}
      <div
        className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="relative z-10 text-center px-4 md:px-8">
          <h2 className="text-lg md:text-xl font-light text-white mb-2 tracking-wide">
            🚀 Welcome to <span className="font-bold">Trikon Academy</span>
          </h2>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-3">
            {banners[active].quoteBn}
          </h1>
          <p className="text-sm md:text-lg text-white/90 font-light mb-4">
            {banners[active].quoteEn}
          </p>
        </div>

        <div className="absolute bottom-3 flex gap-2 justify-center w-full">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition ${
                active === i ? "bg-white" : "bg-white/50"
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* 🎯 Notice Ticker Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-2 overflow-hidden">
        {/* gradient overlay left/right */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-red-600 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-red-800 to-transparent z-10"></div>

        <div className="whitespace-nowrap flex gap-12 animate-marquee hover:[animation-play-state:paused]">
          {notices.map((notice, i) => (
            <span key={i} className="font-semibold text-sm md:text-base">
              {notice}
            </span>
          ))}
        </div>
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

      {/* Mission / Intro Section */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-10 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Admission Success Starts Here 🎯
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 text-sm md:text-base">
          At <span className="font-semibold">Trikon Academy</span>, we help
          students prepare smartly for Medical & University admission exams.
          Hard work, the right guidance, and consistency will lead you to your
          dream campus. 🌟
        </p>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center text-sm py-4 mt-auto">
        © {new Date().getFullYear()} Trikon Academy. All Rights Reserved.
      </footer>

      {/* 🔥 Inline CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          min-width: 100%;
          animation: marquee 190s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;

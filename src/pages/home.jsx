import { useEffect, useState } from "react";
import background from "../assets/background.png";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseclient";

// ✅ Banner slides
const banners = [
  {
    id: 0,
    image: background,
    quoteBn: "স্বপ্ন পূরণের সঠিক প্রস্তুতি এখান থেকেই শুরু ✨",
    quoteEn: "Your success begins here!",
    duration: 7000,
    repeatDuration: 10000,
  },
  {
    id: 1,
    image: "https://picsum.photos/1200/400?random=1",
    quoteBn: "প্রতিদিন Practice Test দিয়ে নিজেকে আরও শক্তিশালী করুন 📚",
    quoteEn: "Daily practice makes you perfect.",
    duration: 4000, 
  },
  {
    id: 2,
    image: "https://picsum.photos/1200/400?random=2",
    quoteBn: "Trikon Academy – Admission Success Starts Here 🚀",
    quoteEn: "We guide you to your dream campus.",
    duration: 4000, 
  },
];

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
];

// 🚀 Features with glossy gradient background
const features = [
  {
    title: "Unlimited Question Bank",
    desc: "অসংখ্য MCQ + Practice Session – যতবার খুশি চেষ্টা করুন। 🚀 ভর্তি যুদ্ধে জন্য প্রস্তুত হোন।",
    icon: "📚",
    bg: "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600",
  },
  {
    title: "Dedicated Exam Batches",
    desc: "Expert Faculty + Mock Test 🔥 Real Exam Experience & Detailed Analysis।",
    icon: "🎯",
    bg: "bg-gradient-to-br from-pink-400 via-red-500 to-orange-500",
  },
  {
    title: "Success Stories",
    desc: "গত বছর 80% শিক্ষার্থী তাদের স্বপ্নের ক্যাম্পাসে ভর্তি হয়েছে! 👏",
    icon: "🏆",
    bg: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
  },
];

function Home() {
  const [active, setActive] = useState(0);
  const [firstCycle, setFirstCycle] = useState(true);

  // 🔥 Live Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  // ✅ Fetch quizzes
  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("live_quiz")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data.length > 0) {
      const formatted = data.map((q) => ({
        id: q.id,
        text: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        answer: q[`option_${q.correct_answer.toLowerCase()}`],
        solution: q.solution,
      }));
      setQuestions(formatted);
      setCurrentIndex(0);
      setSelected(null);
    }
  };

  // ✅ Answer select
  const handleClick = (opt) => {
    if (!selected) {
      setSelected(opt);
    }
  };

  // ✅ Auto next
  useEffect(() => {
    if (questions.length === 0) return;
    let timer;
    if (selected) {
      timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % questions.length);
        setSelected(null);
      }, 3000);
    } else {
      timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % questions.length);
        setSelected(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [selected, currentIndex, questions]);

  // ✅ Banner auto slide
  useEffect(() => {
    const currentBanner = banners[active];
    const duration =
      active === 0
        ? firstCycle
          ? currentBanner.duration
          : currentBanner.repeatDuration
        : currentBanner.duration;

    const timer = setTimeout(() => {
      setActive((prev) => {
        const next = (prev + 1) % banners.length;
        if (next === 0) setFirstCycle(false);
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [active, firstCycle]);

  // ✅ Initial fetch
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔥 Hero Banner */}
      <div className="relative w-[94%] sm:w-[90%] md:w-[85%] mx-auto h-[180px] sm:h-[220px] md:h-[300px] mt-4 rounded-2xl overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${banners[active].image})` }}
            ></div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] shadow-inner"></div>

            <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 text-center text-white">
              <h2 className="text-xs sm:text-sm md:text-xl font-light mb-1 tracking-wide drop-shadow-lg">
                🚀 Welcome to <span className="font-bold">Trikon Academy</span>
              </h2>
              <h1 className="text-base sm:text-lg md:text-3xl font-extrabold drop-shadow-xl leading-snug mb-2">
                {banners[active].quoteBn}
              </h1>
              <p className="text-[10px] sm:text-xs md:text-base text-white/90 font-light italic drop-shadow">
                {banners[active].quoteEn}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-2 flex gap-2 justify-center w-full z-20">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                active === i ? "bg-white scale-125" : "bg-white/40"
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* 🎯 Notice Marquee */}
      <div className="relative bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 text-white py-2 overflow-hidden mt-6 rounded-md shadow-md">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
          {[...notices, ...notices].map((notice, i) => (
            <span
              key={i}
              className="font-semibold text-xs sm:text-sm md:text-base mx-8 md:mx-10 tracking-wide"
            >
              {notice}
            </span>
          ))}
        </div>
      </div>

      {/* 📝 Live Quiz Section */}
      <div className="w-[94%] sm:w-[90%] md:w-[85%] mx-auto mt-6 p-4 sm:p-6 
        rounded-2xl shadow-2xl 
        bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 
        backdrop-blur-lg 
        relative overflow-hidden 
        border border-indigo-200">
        
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 text-indigo-900 flex items-center gap-2">
          📝 Live Quiz
        </h2>

        <AnimatePresence mode="wait">
          {!currentQuestion ? (
            <motion.p
              key="noquiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-gray-600 italic text-sm sm:text-base"
            >
              ⏳ No active quiz available...
            </motion.p>
          ) : (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-4 text-gray-700 font-medium text-sm sm:text-base">
                প্রশ্নঃ {currentQuestion.text}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, i) => {
                  const isCorrect = opt === currentQuestion.answer;
                  const isSelected = opt === selected;

                  let btnStyle =
                    "p-3 text-xs sm:text-sm md:text-base rounded-xl border transition-all shadow-md ";

                  if (!selected) {
                    btnStyle +=
                      "bg-white/70 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 border-gray-200";
                  } else if (isSelected && isCorrect) {
                    btnStyle +=
                      "bg-green-200 border-green-500 text-green-800 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle +=
                      "bg-red-200 border-red-500 text-red-800 font-semibold";
                  } else if (isCorrect) {
                    btnStyle +=
                      "bg-green-100 border-green-400 text-green-700";
                  } else {
                    btnStyle += "bg-gray-50 opacity-70";
                  }

                  return (
                    <button
                      key={i}
                      className={btnStyle}
                      onClick={() => handleClick(opt)}
                      disabled={!!selected}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  );
                })}
              </div>

              {/* ✅ Solution */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 p-3 rounded-md bg-indigo-50 border border-indigo-200 text-xs sm:text-sm text-indigo-800 shadow-inner"
                >
                  💡 Solution: {currentQuestion.solution}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🚀 Features Section */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-10">
          ✨ Why Choose <span className="text-indigo-600">Trikon Academy</span>?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`${f.bg} rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col items-center text-center text-white transition-all relative overflow-hidden`}
            >
              {/* Glossy Effect */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white/30 text-2xl sm:text-3xl mb-4 shadow-md">
                  {f.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 drop-shadow-lg">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-white/90 font-light leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🎓 Mission */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-10 sm:py-14 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Admission Success Starts Here 🎯
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 text-sm sm:text-base md:text-lg">
          At <span className="font-semibold">Trikon Academy</span>, we prepare
          students smartly for Medical & University admission exams with proper
          guidance, daily practice & motivation 🚀
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center py-6">
        <a
          href="/courses"
          className="px-5 py-3 w-56 sm:w-64 rounded-full bg-white/90 text-blue-700 font-semibold shadow-lg 
          hover:bg-blue-600 hover:text-white transform hover:scale-105 transition-all duration-300 text-center text-sm sm:text-base"
        >
          🎓 Explore Our Courses
        </a>
        <a
          href="https://www.youtube.com/@trikonacademyedu"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 w-56 sm:w-64 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow-lg 
          hover:from-red-600 hover:to-red-800 transform hover:scale-105 transition-all duration-300 text-center text-sm sm:text-base"
        >
          ▶ Visit Our YouTube
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center text-xs sm:text-sm py-3 sm:py-4 mt-auto">
        © {new Date().getFullYear()} Trikon Academy. All Rights Reserved. Designed & Developed by Joy Sarkar
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );

  

}

export default Home;

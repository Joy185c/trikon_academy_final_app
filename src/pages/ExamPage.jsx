import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function ExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      // ✅ Exam details
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) {
        console.error("Exam fetch error:", examError.message);
        setLoading(false);
        return;
      }
      setExam(examData);

      // ✅ Exam questions
      const { data: questionData, error: questionError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId);

      if (questionError) {
        console.error("Questions fetch error:", questionError.message);
        setLoading(false);
        return;
      }

      setQuestions(questionData || []);
      setLoading(false);
    };

    fetchExamData();
  }, [examId]);

  if (loading) return <p className="text-center mt-10">Loading exam...</p>;
  if (!exam) return <p className="text-center mt-10">Exam not found ❌</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">📝 {exam.title}</h1>
      <p className="text-gray-700 mb-2">{exam.description}</p>
      <p className="text-sm text-gray-500 mb-6">
        {exam.start_time && new Date(exam.start_time).toLocaleString()} →{" "}
        {exam.end_time && new Date(exam.end_time).toLocaleString()}
      </p>

      <h2 className="text-lg font-semibold mb-3">Questions</h2>
      {questions.length === 0 ? (
        <p>No questions added yet.</p>
      ) : (
        <ol className="list-decimal pl-6 space-y-4">
          {questions.map((q) => {
            const opts = q.options || {};
            return (
              <li key={q.id}>
                <p className="font-medium">{q.question}</p>
                <ul className="list-disc pl-6">
                  {opts.a && <li>A) {opts.a}</li>}
                  {opts.b && <li>B) {opts.b}</li>}
                  {opts.c && <li>C) {opts.c}</li>}
                  {opts.d && <li>D) {opts.d}</li>}
                </ul>
                <p className="text-green-600">✅ Correct: {q.correct_answer}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default ExamPage;

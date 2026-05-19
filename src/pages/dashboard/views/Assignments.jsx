import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

const API = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

const Assignments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptLoading, setAttemptLoading] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ================= GET USER =================
  useEffect(() => {
      setQuestions([]);
      setAnswers({});
      setResult(null);
      setAttempt(null);
      setAttemptLoading(true);

    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (studentData) {
        setStudent(studentData);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
  if (student?.year) {

    const currentSemester =
      Number(student.year) === 1
        ? "1st Year"
        : `${student.year}-${student.semester}`;

    setSemesterFilter(currentSemester);
  }
}, [student]);

  // ================= LOAD ASSIGNMENTS =================
  useEffect(() => {
    if (!student?.id) return;

    const loadAssignments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/assignments/${student.id}`);
        const data = await res.json();

        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [student?.id]);

  // ================= LOAD QUIZ =================
  useEffect(() => {
    if (!id || !student?.id) return;

    const loadData = async () => {

      // RESET OLD STATE
      setQuestions([]);
      setAnswers({});
      setResult(null);
      setAttempt(null);

      setAttemptLoading(true);

      try {


        // ALWAYS FETCH FRESH DATA
        const [qRes, aRes] = await Promise.all([
          fetch(`${API}/assessment/${id}`),
          fetch(`${API}/attempt/${id}/${student.id}`),
        ]);

        const qData = await qRes.json();
        const aData = await aRes.json();

        // ✅ CLEAN QUESTIONS
        if (Array.isArray(qData)) {
          const cleaned = qData
            .filter((q) => q && q.question)
            .map((q, index) => ({
              ...q,

              // FORCE STABLE STRING ID
              id: String(q.id || index + 1).trim(),

              // FIX ORDER STABILITY
              order: index + 1,

              // FORCE CLEAN CORRECT FORMAT
              correct:
                q.correct?.toString().trim().toUpperCase() || "",
          }));

          setQuestions(cleaned);
        } else {
          setQuestions([]);
        }

        // EXISTING ATTEMPT
        if (aData && Object.keys(aData).length > 0) {
          setAttempt(aData);
          setAnswers(aData.answers_json || {});
          setResult({
          score: aData.score,
          total: aData.total,
          correctAnswers:
            aData.correctAnswers ||
            aData.correct_answers ||
            {},
        });

        }
      } catch (err) {
        console.error(err);
      } finally {
        setAttemptLoading(false);
      }
    };

    loadData();
  }, [id, student?.id]);

  // ================= SELECT =================
  const handleSelect = (qid, option) => {
    if (attempt) return;

    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
  if (!student) return;

  // ✅ CHECK ALL QUESTIONS ANSWERED
  const unanswered = questions.filter(
    (q) => !answers[q.id]
  );

  // ❌ BLOCK SUBMIT
  if (unanswered.length > 0) {
    alert("Please answer all questions before submitting.");
    return;
  }

  try {

    // ✅ NORMALIZE ANSWERS
    const normalizedAnswers = {};

    Object.keys(answers).forEach((key) => {
      normalizedAnswers[String(key).trim()] =
        String(answers[key]).trim().toUpperCase();
    });

    // ✅ SEND TO BACKEND
    const res = await fetch(`${API}/submit/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        student_id: student.id,
        answers: normalizedAnswers,
      }),
    });

    const data = await res.json();

    // ✅ HANDLE BACKEND ERROR
    if (!res.ok) {
      alert(data.detail || "Submission failed");
      return;
    }

    // ✅ SAVE ATTEMPT
    const newAttempt = {
      answers_json: normalizedAnswers,
      score: data.score,
      total: data.total,
      correct_answers: data.correctAnswers,
    };

    setAttempt(newAttempt);

    setResult({
      score: data.score,
      total: data.total,
      correctAnswers: data.correctAnswers,
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    alert("Something went wrong while submitting");
  }
};

  // ================= UI =================
  if (loading) return <h2 style={{ padding: 20 }}>Loading assignments...</h2>;

  // ================= LIST =================
  const filteredAssignments = assignments.filter((a) => {

  // ===== SEARCH =====
  const searchMatch =
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject?.toLowerCase().includes(searchTerm.toLowerCase());

  // ===== SEMESTER FILTER =====
  let semesterMatch = true;

  if (semesterFilter !== "All Semesters") {

    // 1st Year
    if (semesterFilter === "1st Year") {

      semesterMatch = Number(a.year) === 1;

    } else {

      // Example: "2-1"
      const [filterYear, filterSem] =
        semesterFilter.split("-").map(Number);

      semesterMatch =
        Number(a.year) === filterYear &&
        Number(a.semester) === filterSem;
    }
  }

  return searchMatch && semesterMatch;
});
      
  if (!id) {
  return (

    <div className="p-6">

    <div className="mb-8">

  <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
    Assignments
  </h1>

  <p className="text-slate-500 text-lg">
    View and attempt your semester assignments.
  </p>

</div>

<div className="flex flex-col md:flex-row gap-4 mb-8">

  {/* SEARCH */}
  <div className="flex-1">
    <input
      type="text"
      placeholder="Search assignments..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full border border-slate-200 rounded-2xl px-5 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* FILTER */}
  <select
    value={semesterFilter}
    onChange={(e) => setSemesterFilter(e.target.value)}
    className="border border-slate-200 rounded-2xl px-5 py-3 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option>All Semesters</option>
    <option>1st Year</option>
    <option>2-1</option>
    <option>2-2</option>
    <option>3-1</option>
    <option>3-2</option>
    <option>4-1</option>
    <option>4-2</option>
  </select>

</div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {filteredAssignments.map((a) => (
        <div
          key={a.id}
          onClick={() => navigate(`/dashboard/assignments/${a.id}`)}
          className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
        >

          {/* HEADER */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">

            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

            <div className="relative z-10">

              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                📘
              </div>

              <h3 className="font-bold text-lg leading-tight line-clamp-2">
                {a.title}
              </h3>

            </div>
          </div>

          {/* BODY */}
          <div className="p-5 flex flex-col gap-4">

            <div>
              <p className="text-sm text-slate-500 mb-1">
                Subject
              </p>

              <p className="font-semibold text-slate-700">
                {a.subject}
              </p>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-3 text-sm">

              {a.attempt ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-medium">
                  ✅ Completed
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 font-medium">
                  📝 Not Attempted
                </div>
              )}

            </div>

            {/* SCORE */}
            {a.attempt && (
              <div className="text-sm font-medium text-slate-600">
                Score: {a.attempt.score} / {a.attempt.total}
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">

              <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">
                Open assignment
              </span>

              <span className="text-slate-400 group-hover:text-orange-600 transition-colors">
                →
              </span>

            </div>
          </div>
        </div>
      ))}

    </div>
  </div>
  );
}
  // ================= QUIZ =================
if (attemptLoading)
  return <h2 style={{ padding: 20 }}>Loading quiz...</h2>;

if (!questions.length && !attempt)
  return <h2 style={{ padding: 20 }}>No questions available</h2>;

return (
  <div className="max-w-5xl mx-auto p-6">

  {/* HEADER */}
  <div className="mb-8">

    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
      <span>
        {assignments.find((a) => a.id === id)?.subject}
      </span>

      <span>•</span>

      <span>
        {assignments.find((a) => a.id === id)?.unit}
      </span>
    </div>

    <h1 className="text-3xl font-bold text-slate-900">
      {assignments.find((a) => a.id === id)?.title || "Quiz"}
    </h1>

    <p className="text-slate-500 mt-2">
      Answer all questions and submit your assessment.
    </p>

  </div>

    {questions.map((q) => {
      const userAns = answers[q.id];
      const correct = 
        result?.correctAnswers?.[String(q.id).trim()];

      return (
        <div key={q.id} style={{ marginBottom: 15 }}>
          <h4>
            {q.order}. {q.question}
          </h4>

          {["A", "B", "C", "D"].map((opt) => {
            const raw = q[`option_${opt.toLowerCase()}`];

            // ✅ SKIP EMPTY OPTIONS (IMPORTANT)
            if (
              !raw ||
              raw === "nan" ||
              raw === "undefined" ||
              raw.toString().trim() === ""
            ) {
              return null;
            }

            let bg = "#f5f5f5";

              if (attempt && correct) {

                // correct answer = green
                if (correct === opt) {
                  bg = "#c8f7c5";
                }

                // wrong selected answer = red
                if (userAns === opt && userAns !== correct) {
                  bg = "#ffcccc";
                }

              } else if (userAns === opt) {

                // before submit
                bg = "#d0ebff";
              }

            return (
              <div
                key={opt}
                onClick={() => handleSelect(q.id, opt)}
                className={`
                mt-2 p-4 rounded-xl border transition-all
                ${attempt ? "cursor-not-allowed" : "cursor-pointer hover:scale-[1.01]"}

                ${bg === "#c8f7c5" ? "bg-green-100 border-green-300 text-green-800" : ""}
                ${bg === "#ffcccc" ? "bg-red-100 border-red-300 text-red-800" : ""}
                ${bg === "#d0ebff" ? "bg-blue-100 border-blue-300 text-blue-800" : ""}
                ${bg === "#f5f5f5" ? "bg-white border-slate-200" : ""}
                `}
              >
                {opt}. {raw}
              </div>
            );
          })}
        </div>
      );
    })}

      {!attempt && (
        <div className="flex justify-end mt-10">

          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all"
          >
            Submit Assessment
          </button>

        </div>
      )}

    {result && (
      <h3>
        Score: {result.score} / {result.total}
      </h3>
    )}
  </div>
);

};

export default Assignments;
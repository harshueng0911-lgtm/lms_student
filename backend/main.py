from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv

from drive_service import download_excel
from parser import parse_excel
from cache import get_cached_data, set_cache
import pandas as pd

app = FastAPI()


# ---------------- ENV ----------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing Supabase credentials")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------- APP ----------------
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- MODEL ----------------
class Submission(BaseModel):
    student_id: str
    answers: dict


# ---------------- STUDENT ----------------
@app.get("/student/{student_id}")
def get_student(student_id: str):
    res = supabase.table("students").select("*").eq("id", student_id).execute()
    if not res.data:
        raise HTTPException(404, "Student not found")
    return res.data[0]


# ---------------- HELPERS ----------------
def get_file_id(assessment_id: str):
    res = supabase.table("assessments").select("file_id").eq("id", assessment_id).execute()
    if not res.data:
        raise HTTPException(404, "Assessment not found")
    return res.data[0]["file_id"]


# ---------------- ASSIGNMENTS (FIXED CORE LOGIC) ----------------
@app.get("/assignments/{student_id}")
def get_assignments(student_id: str):
    try:
        # ================= GET STUDENT =================
        stu = supabase.table("students") \
            .select("*") \
            .eq("id", student_id) \
            .execute()

        if not stu.data:
            print("❌ Student not found")
            return []

        student = stu.data[0]

        # ✅ CLEAN VALUES
        student_department = str(
            student.get("department", "")
        ).strip()

        student_year = int(
            student.get("year", 0)
        )

        student_semester = int(
            student.get("semester", 0)
        )

        print("🎓 STUDENT:")
        print(
            student_department,
            student_year,
            student_semester
        )

    # ================= GET ALL ASSESSMENTS =================
        # Fetch all assignments inside student department
        # Frontend will handle semester filtering

        ass_res = supabase.table("assessments") \
            .select("*") \
            .eq("department", student_department) \
            .order("year") \
            .order("semester") \
            .execute()
        

        all_assignments = ass_res.data or []

        print(f"📚 TOTAL ASSESSMENTS: {len(all_assignments)}")

        filtered = all_assignments
        
        print(f"✅ FILTERED ASSIGNMENTS: {len(filtered)}")

        # ================= ATTEMPTS =================
        att_res = supabase.table("student_attempts") \
            .select("assessment_id, score, total") \
            .eq("student_id", student_id) \
            .execute()

        attempts = {
            a["assessment_id"]: a
            for a in (att_res.data or [])
        }

        # ✅ MERGE ATTEMPTS
        for a in filtered:
         a["attempt"] = attempts.get(a["id"], None)

        return filtered

    except Exception as e:
        print("❌ ASSIGNMENT ERROR:", e)
        return []

# ---------------- QUESTIONS ----------------
@app.get("/assessment/{assessment_id}")
def get_assessment(assessment_id: str):
    try:
        cached = get_cached_data(assessment_id)

        if not cached:
            file_id = get_file_id(assessment_id)

            print("📥 Downloading file:", file_id)

            file_stream = download_excel(file_id)

            print("📄 File downloaded")

            cached = parse_excel(file_stream)

            print("📊 Parsed questions:", cached)

            if not cached:
                raise Exception("No questions parsed from Excel")

            set_cache(assessment_id, cached)

        safe = []
        for i, q in enumerate(cached):
            safe.append({
                "id": str(q.get("id")),
                "question": q.get("question", ""),
                "option_a": q.get("option_a", ""),
                "option_b": q.get("option_b", ""),
                "option_c": q.get("option_c", ""),
                "option_d": q.get("option_d", ""),
            })

        return safe

    except Exception as e:
        print("🔥 REAL ERROR:", str(e))   # ← IMPORTANT
        raise HTTPException(500, f"Error: {str(e)}")


# ---------------- SUBMIT ----------------
@app.post("/submit/{assessment_id}")
def submit(assessment_id: str, data: Submission):
    try:
        questions = get_cached_data(assessment_id)

        if not questions:
            file_id = get_file_id(assessment_id)
            file_stream = download_excel(file_id)
            questions = parse_excel(file_stream)
            set_cache(assessment_id, questions)

        questions = sorted(questions, key=lambda x: int(x["id"]))

        existing = supabase.table("student_attempts") \
            .select("id") \
            .eq("student_id", data.student_id) \
            .eq("assessment_id", assessment_id) \
            .execute()

        if existing.data:
            raise HTTPException(400, "Already attempted")

        score = 0
        correct_answers = {}
        # ✅ VALIDATE ALL QUESTIONS ATTEMPTED
        missing_questions = []

        for q in questions:
            qid = str(q["id"]).strip()

            user_answer = str(
                data.answers.get(qid, "")
            ).strip()

            if not user_answer:
                missing_questions.append(qid)

        # ❌ BLOCK SUBMISSION
        if missing_questions:
            raise HTTPException(
                status_code=400,
                detail=f"Please answer all questions before submitting. Missing: {', '.join(missing_questions)}"
            )

        for q in questions:
            qid = str(q["id"]).strip()

            # ✅ CLEAN CORRECT ANSWER
            correct = str(
                q.get("correct", "")
            ).strip().upper()

            # ✅ CLEAN USER ANSWER
            user = str(
                data.answers.get(qid, "")
            ).strip().upper()

            print("------------")
            print("QUESTION ID:", qid)
            print("USER:", user)
            print("CORRECT:", correct)

            correct_answers[qid] = correct

            if user == correct:
                score += 1

        # student snapshot
        stu = supabase.table("students") \
            .select("department, year, semester") \
            .eq("id", data.student_id) \
            .execute()
        if not stu.data:
            raise HTTPException(404, "Student not found")

        student = stu.data[0]

        ass = supabase.table("assessments") \
            .select("subject") \
            .eq("id", assessment_id) \
            .execute()
        if not ass.data:
            raise HTTPException(404, "Assessment not found")

        assessment = ass.data[0]

        supabase.table("student_attempts").upsert(
            {
                "student_id": data.student_id,
                "assessment_id": assessment_id,
                "department": student.get("department"),
                "year": student.get("year"),
                "semester": student.get("semester"),
                "subject": assessment.get("subject"),
                "answers_json": data.answers,
                "score": score,
                "total": len(questions)
            },
            on_conflict="student_id,assessment_id"
        ).execute()

        return {
            "score": score,
            "total": len(questions),
            "correctAnswers": correct_answers
        }

    except HTTPException as he:
        raise he

    except Exception as e:
        print("SUBMIT ERROR:", e)
        raise HTTPException(500, f"Submission failed: {str(e)}")


# ---------------- ATTEMPT ----------------
@app.get("/attempt/{assessment_id}/{student_id}")
def get_attempt(assessment_id: str, student_id: str):

    try:
        res = supabase.table("student_attempts") \
            .select("*") \
            .eq("assessment_id", assessment_id) \
            .eq("student_id", student_id) \
            .limit(1) \
            .execute()

        if not res.data:
            return None

        attempt = res.data[0]

        # ✅ LOAD QUESTIONS FROM CACHE
        questions = get_cached_data(assessment_id)

        # ✅ CACHE EMPTY → RELOAD FROM EXCEL
        if not questions:
            file_id = get_file_id(assessment_id)

            file_stream = download_excel(file_id)

            questions = parse_excel(file_stream)

            set_cache(assessment_id, questions)

        correct_answers = {
            str(q["id"]): str(q.get("correct", "")).upper()
            for q in questions
        }

        return {
            **attempt,
            "correctAnswers": correct_answers
        }

    except Exception as e:
        print("❌ ATTEMPT ERROR:", e)
        raise HTTPException(500, "Failed to fetch attempt")


# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"message": "LMS Backend Running 🚀"}
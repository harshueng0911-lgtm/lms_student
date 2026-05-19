-- =======================================================
-- 1. Create the 'students' profile table
-- =======================================================
CREATE TABLE public.students (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hall_ticket TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =======================================================
-- 2. Enable Row Level Security (RLS)
-- =======================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- 3. Create RLS Policies
-- =======================================================

-- Policy: Students can view their own profile
CREATE POLICY "Students can view own profile" 
    ON public.students 
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy: Students can update their own profile
CREATE POLICY "Students can update own profile" 
    ON public.students 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Policy: Allow inserts during registration trigger
CREATE POLICY "Allow system to create student profiles" 
    ON public.students 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- =======================================================
-- 4. Create an Auth Trigger to auto-create profiles
-- =======================================================
-- This function automatically creates a record in the 'students' table
-- whenever a new user signs up via Supabase Auth.
-- It pulls the custom data we sent in the options.data payload.

CREATE OR REPLACE FUNCTION public.handle_new_student_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (
    id, 
    email, 
    full_name, 
    hall_ticket, 
    course, 
    department, 
    year, 
    semester
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'hall_ticket',
    NEW.raw_user_meta_data->>'course',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'semester'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_signup();

-- =======================================================
-- 5. Create the 'assessments' table
-- =======================================================
CREATE TABLE public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    file_id TEXT NOT NULL, -- Google Drive file ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =======================================================
-- 6. Enable RLS for assessments
-- =======================================================
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view assessments for their department/year/semester
CREATE POLICY "Students can view relevant assessments" 
    ON public.assessments 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = auth.uid() 
            AND department = assessments.department 
            AND year = assessments.year 
            AND semester = assessments.semester
        )
    );

-- =======================================================
-- 7. Create the 'student_attempts' table
-- =======================================================
CREATE TABLE public.student_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    subject TEXT NOT NULL,
    answers_json JSONB NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, assessment_id) -- Prevent duplicate attempts
);

-- =======================================================
-- 8. Enable RLS for student_attempts
-- =======================================================
ALTER TABLE public.student_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own attempts
CREATE POLICY "Students can view own attempts" 
    ON public.student_attempts 
    FOR SELECT 
    USING (auth.uid() = student_id);

-- Policy: Students can insert their own attempts
CREATE POLICY "Students can insert own attempts" 
    ON public.student_attempts 
    FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

-- =======================================================
-- 9. Insert sample assessments (optional - remove if not needed)
-- =======================================================
-- Note: Replace 'your_google_drive_file_id_here' with actual Google Drive file IDs for Excel files containing questions
-- The file should have columns: id, question, option_a, option_b, option_c, option_d, correct

INSERT INTO public.assessments (title, subject, department, year, semester, file_id) VALUES
('Mathematics Quiz 1', 'Mathematics', 'Computer Science', '1', '1', '1BxiMVs0XRA5nFMdKvBdBZ13szp3xI'),
('Physics Test', 'Physics', 'Computer Science', '1', '1', '1BxiMVs0XRA5nFMdKvBdBZ13szp3xI'),
('Data Structures Assignment', 'Computer Science', 'Computer Science', '2', '1', '1BxiMVs0XRA5nFMdKvBdBZ13szp3xI');

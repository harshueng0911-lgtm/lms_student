import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail,Lock,ArrowRight,User,CreditCard,Building,Calendar,BookOpen } from 'lucide-react';
import hero3d from '../assets/hero-3d.png';
import logo from '../assets/osmania-logo-1.jpg';
import { supabase } from '../lib/supabase';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    hallTicket: '',
    course: 'B.E',
    department: '',
    year: '',
    semester: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const departments = [
    "Biomedical Engineering",
    "Civil Engineering",
    "Computer Science & Engg.",
    "Electronics & Communication Engg.",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Mining Engineering",
    "Chemistry",
    "Physics",
    "English",
    "Mathematics",
    "Physical Education"
  ];

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMsg('');
  setSuccessMsg('');

  try {
    // 1. SIGNUP
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        }
      }
    });

    if (authError) throw authError;

    const user = authData?.user;
    if (!user) throw new Error("User not created");

   const semesterValue =
  formData.year === "1"
    ? null
    : parseInt(formData.semester.split("-")[1], 10);

    // 3. INSERT INTO students TABLE
    const { error: dbError } = await supabase.from("students").insert([
      {
        id: user.id,
        full_name: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        hall_ticket: formData.hallTicket,
        course: formData.course,
        department: formData.department,
        year: parseInt(formData.year),
        semester: semesterValue,
      },
    ]);

    if (dbError) throw dbError;

    // 4. SUCCESS
    setSuccessMsg("Registration successful! Redirecting to login...");

    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } catch (error) {
    console.error("Registration failed:", error.message);
    setErrorMsg(error.message || "Registration failed");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left Form Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white overflow-y-auto">
        <div className="mx-auto w-full max-w-md lg:w-96 my-auto">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-8">
                <img src={logo} alt="Osmania University Logo" className="h-12 w-auto object-contain"/>
                <span className="font-bold text-2xl text-slate-800 tracking-tight">
                    LMS
                </span>
            </Link>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
              {successMsg}
            </div>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50"
                    placeholder="e.g. Aarav Reddy"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Osmania Mail ID</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50"
                    placeholder="student@osmania.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hallTicket" className="block text-sm font-medium text-slate-700">Hall Ticket Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="hallTicket"
                    type="text"
                    required
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50"
                    placeholder="e.g. 100519733001"
                    value={formData.hallTicket}
                    onChange={(e) => setFormData({...formData, hallTicket: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-slate-700">Course</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="course"
                    type="text"
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50 text-slate-700"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="department"
                    required
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50 appearance-none text-slate-700"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-slate-700">Year</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      id="year"
                      required
                      className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50 appearance-none text-slate-700"
                      value={formData.year}
                      onChange={(e) => {
                        const newYear = e.target.value;
                        setFormData({
                          ...formData, 
                          year: newYear,
                          semester: newYear === '1' ? '' : formData.semester
                        });
                      }}
                    >
                      <option value="" disabled>Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                {formData.year && formData.year !== '1' && (
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-slate-700">Semester</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <select
                        id="semester"
                        required
                        className="block w-full sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50 appearance-none text-slate-700"
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      >
                        <option value="" disabled>Select Sem</option>
                        <option value={`${formData.year}-1`}>{formData.year}-1</option>
                        <option value={`${formData.year}-2`}>{formData.year}-2</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border p-2.5 bg-slate-50"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors mt-2 ${
                    isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? 'Creating Account...' : (
                    <>
                      Create Account <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Branding Side */}
      <div className="hidden lg:block relative w-0 flex-1 bg-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 flex flex-col items-center justify-center p-12">
          <div className="text-center max-w-lg z-10 relative mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Start your journey</h2>
            <p className="text-slate-600 text-lg">Join thousands of students accessing premium learning materials.</p>
          </div>
          <div className="relative w-full max-w-xl z-10">
            <img src={hero3d} alt="LMS Interface" className="w-full h-auto object-cover drop-shadow-2xl" />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;

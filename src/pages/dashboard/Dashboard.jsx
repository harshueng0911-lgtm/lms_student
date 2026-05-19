import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard-ui/Sidebar';
import Header from '../../components/dashboard-ui/Header';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          navigate('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setStudentInfo({
          name: profile.full_name,
          department: profile.department,
          email: profile.email,
          hallTicket: profile.hall_ticket,
          year: profile.year,
          semester: profile.semester,
          profilePic: profile.profile_pic
        });

      } catch (err) {
        console.error(err.message);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden transition-colors duration-300">
        <Header 
          studentName={studentInfo?.name} 
          studentRole={studentInfo?.department}
          profilePic={studentInfo?.profilePic}
        />

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ studentInfo }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
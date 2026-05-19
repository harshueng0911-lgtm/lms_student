import React from 'react';
import { BookOpen, Users, LayoutDashboard, Clock } from 'lucide-react';

import vcImage from '../assets/vice-chanceller.jpg';
import principalImage from '../assets/principal.jpg';
import campusImage from '../assets/osmania.jpg';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/layout/Hero';
import StatCard from '../components/common/StatCard';
import Accordion from '../components/common/Accordion';

import { faqData } from '../constants/faqData';

const Home = () => {
  const stats = [
    { id: 1, title: 'Departments', value: '8+', icon: LayoutDashboard },
    { id: 2, title: 'Academic Years', value: '4', icon: Users },
    { id: 3, title: 'Study Materials', value: '24/7', icon: Clock },
    { id: 4, title: 'Assignments', value: 'Tracked', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">

        {/* Hero Section */}
        <Hero />

        {/* Stats Section */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.id}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">

            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Government of Telangana Initiative
            </p>

            <h2 className="mt-4 text-4xl font-bold text-slate-900">
              Prajapala Palana Pragati Pranalika:
              <span className="text-blue-600"> The 99-Day Action Plan</span>
            </h2>

            <p className="mt-6 text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Guided by a visionary roadmap for the digitalization of student services,
              Osmania University is proud to lead the implementation of this Learning
              Management System platform for all departments.
            </p>

          </div>
        </section>
        <section className="py-20 bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">

    <div>
      <p className="text-green-600 font-semibold uppercase tracking-wide">
        For Students
      </p>

      <h2 className="mt-4 text-5xl font-bold text-slate-900 leading-tight">
        Learn anywhere.
        <br />
        Grow forever.
      </h2>

      <p className="mt-6 text-slate-600 leading-relaxed">
        Access assignments, PDFs, study materials, quizzes,
        and recorded content anytime from anywhere.
      </p>

      <div className="mt-8 space-y-4">

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <p className="text-slate-700">
            Department-wise materials
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <p className="text-slate-700">
            Online assignments & quizzes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <p className="text-slate-700">
            24/7 learning access
          </p>
        </div>

      </div>
    </div>

    <div>
      <img
        src={campusImage}
        alt="Campus"
        className="rounded-3xl shadow-2xl h-full w-full object-cover"
      />
    </div>

  </div>
</section>

<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">

    <img
      src={vcImage}
      alt="Vice Chancellor"
      className="rounded-3xl shadow-xl"
    />

    <div>

      <p className="text-blue-600 font-semibold uppercase tracking-wide">
        Leadership
      </p>

      <h2 className="mt-4 text-4xl font-bold text-slate-900">
        Message from the Vice Chancellor
      </h2>

      <p className="mt-6 text-slate-600 leading-relaxed">
        Our vision is to provide every student with accessible,
        modern, and department-focused digital learning resources
        through this LMS ecosystem.
      </p>

    </div>

  </div>
</section>

<section className="py-20 bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">

    <div>

      <p className="text-blue-600 font-semibold uppercase tracking-wide">
        Academic Vision
      </p>

      <h2 className="mt-4 text-4xl font-bold text-slate-900">
        Message from the Principal
      </h2>

      <p className="mt-6 text-slate-600 leading-relaxed">
        This LMS bridges the gap between faculty and students
        by providing centralized access to assignments,
        PDFs, assessments, and academic content.
      </p>

    </div>

    <img
      src={principalImage}
      alt="Principal"
      className="rounded-3xl shadow-xl"
    />

  </div>
</section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <Accordion items={faqData} />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
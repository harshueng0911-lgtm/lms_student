import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseCard = ({ course, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index ? Math.min(index * 0.08, 0.4) : 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col"
    >
      {/* Thumbnail */}
      <Link to={`/courses/${course.id}`} className="relative overflow-hidden block" style={{ paddingBottom: '56.25%' }}>
        <img
          src={course.image}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-blue-600 tracking-wide uppercase shadow-sm">
          {course.category}
        </div>
        {/* Level badge */}
        <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-medium text-white">
          {course.level}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        {/* Instructor row */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
            {course.instructor.charAt(0)}
          </span>
          <span className="text-xs font-medium text-slate-500 truncate">{course.instructor}</span>
        </div>

        {/* Title */}
        <Link to={`/courses/${course.id}`} className="flex-grow">
          <h3 className="font-bold text-[15px] text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(course.rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700">{course.rating}</span>
          <span className="text-xs text-slate-400">({(course.students / 1000).toFixed(0)}k)</span>
        </div>

        {/* Footer stats */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{course.students.toLocaleString()} students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

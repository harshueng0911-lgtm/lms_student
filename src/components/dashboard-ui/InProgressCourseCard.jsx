import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

const InProgressCourseCard = ({ course }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
      <div className="w-full sm:w-48 h-28 flex-shrink-0 rounded-lg overflow-hidden relative">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center py-2 w-full">
        <h4 className="font-bold text-slate-800 mb-1">{course.title}</h4>
        <p className="text-sm text-slate-500 mb-4">{course.instructor} • {course.lessons} lessons</p>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-semibold text-slate-500">{course.progress}%</span>
        </div>
      </div>

      <div className="sm:ml-4 mt-4 sm:mt-0">
        <Link 
          to={`/courses/${course.id}`} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          Resume
        </Link>
      </div>
    </div>
  );
};

export default InProgressCourseCard;

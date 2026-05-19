import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, PauseCircle, CheckCircle, Clock, FileText, ChevronLeft, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { courseData } from '../../constants/courseData';

// Award SVG icon defined at module level so it's not recreated on each render
const Award = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courseData.find(c => c.id === parseInt(courseId)) || courseData[0];

  // Flat list of all lessons for easy navigation
  const courseCurriculum = [
    {
      id: 1,
      title: "Module 1: Getting started",
      duration: "1h 45m",
      isOpen: true,
      lessons: [
        { id: 101, title: "Welcome & course overview", duration: "12 min", isCompleted: true, type: "video", videoUrl: null },
        { id: 102, title: "Setting up your environment", duration: "25 min", isCompleted: true, type: "video", videoUrl: null },
        { id: 103, title: "Project files & resources", duration: "5 min", isCompleted: true, type: "document", videoUrl: null }
      ]
    },
    {
      id: 2,
      title: "Module 2: Core concepts",
      duration: "3h 20m",
      isOpen: true,
      lessons: [
        { id: 201, title: "Fundamentals deep dive", duration: "45 min", isCompleted: false, type: "video", videoUrl: null },
        { id: 202, title: "Hands-on workshop", duration: "1h 15m", isCompleted: false, type: "video", videoUrl: null },
        { id: 203, title: "Common pitfalls", duration: "20 min", isCompleted: false, type: "video", videoUrl: null }
      ]
    },
    {
      id: 3,
      title: "Module 3: Real-world project",
      duration: "4h 10m",
      isOpen: false,
      lessons: [
        { id: 301, title: "Architecture walkthrough", duration: "35 min", isCompleted: false, isLocked: true, type: "video", videoUrl: null },
        { id: 302, title: "Building the UI", duration: "1h 45m", isCompleted: false, isLocked: true, type: "video", videoUrl: null },
        { id: 303, title: "Shipping & deploying", duration: "50 min", isCompleted: false, isLocked: true, type: "video", videoUrl: null }
      ]
    }
  ];

  // First unlocked, incomplete lesson as default
  const firstActiveLesson = courseCurriculum.flatMap(m => m.lessons).find(l => !l.isCompleted && !l.isLocked)
    || courseCurriculum[0].lessons[0];

  // State
  const [selectedLesson, setSelectedLesson] = useState(firstActiveLesson);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openModules, setOpenModules] = useState(
    courseCurriculum.reduce((acc, m) => ({ ...acc, [m.id]: m.isOpen }), {})
  );
  const [completedIds, setCompletedIds] = useState(
    new Set(courseCurriculum.flatMap(m => m.lessons).filter(l => l.isCompleted).map(l => l.id))
  );

  const allLessons = courseCurriculum.flatMap(m => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = completedIds.size;
  const progress = Math.round((completedCount / totalLessons) * 100);

  const handleSelectLesson = (lesson) => {
    if (lesson.isLocked) return;
    setSelectedLesson(lesson);
    setIsPlaying(false); // reset play state when switching lessons
  };

  const handleTogglePlay = () => {
    if (selectedLesson.isLocked) return;
    // If lesson has a real videoUrl, playback would happen here.
    // For now, toggle the visual state.
    setIsPlaying(prev => !prev);
  };

  const handleMarkComplete = () => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.add(selectedLesson.id);
      return next;
    });
    // Auto-advance to next lesson
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
    const nextLesson = allLessons[currentIndex + 1];
    if (nextLesson && !nextLesson.isLocked) {
      setSelectedLesson(nextLesson);
      setIsPlaying(false);
    }
  };

  const toggleModule = (moduleId) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 w-48">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-bold text-slate-700 w-8">{progress}%</span>
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="text-xs font-medium text-slate-500">
              {completedCount}/{totalLessons} done
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Left: Video + Info ── */}
          <div className="flex-1 w-full flex flex-col gap-6">

            {/* Video Player */}
            <div
              className="w-full aspect-[16/9] bg-slate-900 rounded-xl overflow-hidden relative shadow-sm border border-slate-200 cursor-pointer group"
              onClick={handleTogglePlay}
              title={selectedLesson.isLocked ? 'This lesson is locked' : isPlaying ? 'Pause' : 'Play'}
            >
              {/* Thumbnail / poster */}
              <img
                src={course.image}
                alt="Video thumbnail"
                className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-40' : 'opacity-80'}`}
              />

              {/* When a real videoUrl is available, swap the img above for:
                  <video src={selectedLesson.videoUrl} controls className="w-full h-full object-contain" />
              */}

              {/* Play / Pause overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isPlaying ? (
                  <>
                    <PauseCircle className="w-14 h-14 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                    <span className="mt-3 text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
                      {selectedLesson.title}
                    </span>
                    <p className="mt-1 text-white/60 text-xs">
                      ⚠ No video URL yet — faculty will add one.
                    </p>
                  </>
                ) : (
                  <div className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg border-4 border-blue-400/30">
                    <PlayCircle className="w-6 h-6 ml-1" />
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <div className="h-full bg-blue-500" style={{ width: completedIds.has(selectedLesson.id) ? '100%' : isPlaying ? '40%' : '0%', transition: 'width 0.4s' }}></div>
              </div>
            </div>

            {/* Currently playing lesson info + Mark complete */}
            <div className="bg-white rounded-xl px-6 py-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {selectedLesson.type === 'video' ? (
                  <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{selectedLesson.title}</p>
                  <p className="text-xs text-slate-400">{selectedLesson.duration}</p>
                </div>
              </div>
              {!completedIds.has(selectedLesson.id) && !selectedLesson.isLocked ? (
                <button
                  onClick={handleMarkComplete}
                  className="flex-shrink-0 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Mark complete
                </button>
              ) : completedIds.has(selectedLesson.id) ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium flex-shrink-0">
                  <CheckCircle className="w-4 h-4" /> Completed
                </span>
              ) : null}
            </div>

            {/* Course Info Card */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                  {course.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 mb-4 leading-tight">{course.title}</h1>
              <p className="text-slate-600 mb-6 text-sm">
                Study development with hands-on lessons, documents, and assignments. Designed for beginner students.
              </p>

              <div className="flex flex-wrap gap-y-4 gap-x-6 items-center text-sm mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide">Instructor</p>
                    <p className="font-bold text-slate-800 text-sm">{course.instructor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-medium ml-4">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="font-bold">{course.rating}</span> <span className="text-slate-400 font-normal">({(course.students / 1000).toFixed(1)}k ratings)</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-4 h-4" />
                  9h 15m total
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-slate-200 mt-2">
                <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-bold text-sm">Materials</button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">Discussion</button>
              </div>

              <div className="mt-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">What you'll learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {['Build production-ready projects from scratch', 'Master modern tooling and best practices', 'Debug confidently with structured techniques', 'Ship to real users with deployment workflows', 'Pass Interviews with hands-on exercises', 'Earn a verified certificate of completion'].map((item, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div className="mt-0.5 border-2 border-green-500 rounded-full p-0.5">
                        <svg className="w-2.5 h-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-slate-600 text-[13px] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Award className="w-32 h-32 text-white opacity-10" />
              </div>
              <div className="relative z-10">
                <div className="mx-auto w-10 h-10 mb-3 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1.5">Earn a verified certificate</h3>
                <p className="text-blue-50 text-[13px] max-w-sm mx-auto opacity-90">Complete all video modules and assignments to receive your official department certificate.</p>
              </div>
            </div>
          </div>

          {/* ── Right: Course Curriculum Sidebar ── */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-[15px] text-slate-900">Course content</h3>
                <p className="text-[13px] text-slate-500 mt-1">{course.lessons} lessons • {courseCurriculum.length} modules</p>
              </div>

              <div className="overflow-y-auto flex-1">
                {courseCurriculum.map((module) => (
                  <div key={module.id} className="border-b border-slate-100 last:border-0">
                    {/* Module Header — clickable to collapse/expand */}
                    <button
                      className="w-full p-4 bg-slate-50 flex justify-between items-center hover:bg-slate-100 transition-colors text-left"
                      onClick={() => toggleModule(module.id)}
                    >
                      <h4 className="font-bold text-slate-800 text-sm">{module.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-slate-500 font-medium">{module.duration}</span>
                        {openModules[module.id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Lesson list — only shown when module is open */}
                    {openModules[module.id] && (
                      <div className="py-1">
                        {module.lessons.map((lesson) => {
                          const isSelected = selectedLesson.id === lesson.id;
                          const isDone = completedIds.has(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson)}
                              disabled={lesson.isLocked}
                              className={`w-full px-4 py-2.5 flex gap-3 items-start text-left transition-colors border-l-2 ${
                                lesson.isLocked
                                  ? 'cursor-not-allowed opacity-60 border-transparent'
                                  : isSelected
                                    ? 'bg-blue-50 border-blue-500'
                                    : 'hover:bg-slate-50 border-transparent'
                              }`}
                            >
                              {/* Icon */}
                              <div className="mt-0.5 flex-shrink-0">
                                {isDone ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                                    <svg className="w-2 h-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                  </div>
                                ) : lesson.isLocked ? (
                                  <Lock className="w-4 h-4 text-slate-300" />
                                ) : lesson.type === 'document' ? (
                                  <FileText className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                                ) : (
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                  </div>
                                )}
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] truncate ${
                                  isSelected ? 'font-bold text-blue-700' :
                                  isDone ? 'text-slate-500 font-medium' :
                                  lesson.isLocked ? 'text-slate-400' : 'font-medium text-slate-700'
                                }`}>
                                  {lesson.title}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{lesson.duration}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

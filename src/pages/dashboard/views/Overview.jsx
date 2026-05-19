import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, FileText, PlayCircle, ArrowRight, Loader2, Filter, ChevronRight } from 'lucide-react';
import { useStudentMaterials } from '../../../hooks/useStudentMaterials';

const SEMESTER_OPTIONS = [
  { label: 'All Semesters', value: '' },
  { label: '1st Year',      value: '1' },   // 1st year has no semester split
  { label: '2-1', value: '2-1' },
  { label: '2-2', value: '2-2' },
  { label: '3-1', value: '3-1' },
  { label: '3-2', value: '3-2' },
  { label: '4-1', value: '4-1' },
  { label: '4-2', value: '4-2' },
];

/** Filter videos/pdfs by selected semester value */
const filterBySelection = (items, semesterFilter) => {
  if (!semesterFilter) return items;
  const isYearOnly = !semesterFilter.includes('-');
  const filterYear = parseInt(semesterFilter.split('-')[0], 10);
  const filterSem  = isYearOnly ? null : parseInt(semesterFilter.split('-')[1], 10);
  return items.filter(item => {
    if (parseInt(item.year, 10) !== filterYear) return false;
    if (!isYearOnly) return parseInt(item.semester, 10) === filterSem;
    return true;
  });
};

/** Re-group a filtered flat list into subjects */
const groupBySubject = (videos = [], pdfs = []) => {
  const map = {};
  const add = (item, type) => {
    const s = item.subject || 'General';
    const u = item.unit    || 'General';
    if (!map[s]) map[s] = { name: s, videos: [], pdfs: [], units: {} };
    if (!map[s].units[u]) map[s].units[u] = { name: u, videos: [], pdfs: [] };
    if (type === 'video') { map[s].videos.push(item); map[s].units[u].videos.push(item); }
    else                  { map[s].pdfs.push(item);   map[s].units[u].pdfs.push(item); }
  };
  videos.forEach(v => add(v, 'video'));
  pdfs.forEach(p   => add(p, 'pdf'));
  return Object.values(map).map(s => ({ ...s, units: Object.values(s.units) }));
};

const Overview = () => {
  const { studentInfo } = useOutletContext();
  const { subjects, allVideos, allPdfs, isLoading } = useStudentMaterials();
  const [semesterFilter, setSemesterFilter] = useState('');
    useEffect(() => {
      if (!studentInfo?.year) return;

      // 1st year → no semester split
      if (Number(studentInfo.year) === 1) {

        setSemesterFilter('1');

      } else {

        setSemesterFilter(
          `${studentInfo.year}-${studentInfo.semester}`
        );

      }

    }, [studentInfo]);

  // Apply filter to raw material lists
  const filteredVideos   = filterBySelection(allVideos, semesterFilter);
  const filteredPdfs     = filterBySelection(allPdfs,   semesterFilter);
  const filteredSubjects = semesterFilter
    ? groupBySubject(filteredVideos, filteredPdfs)
    : subjects;

  const stats = [
    {
      id: 1, label: 'Subjects',
      value: isLoading ? '—' : filteredSubjects.length,
      icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50'
    },
    {
      id: 2, label: 'Videos',
      value: isLoading ? '—' : filteredVideos.length,
      icon: PlayCircle, color: 'text-emerald-500', bg: 'bg-emerald-50'
    },
    {
      id: 3, label: 'Documents',
      value: isLoading ? '—' : filteredPdfs.length,
      icon: FileText, color: 'text-violet-500', bg: 'bg-violet-50'
    },
    {
      id: 4, label: 'Units',
      value: isLoading ? '—' : filteredSubjects.reduce((n, s) => n + s.units.length, 0),
      icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50'
    },
  ];

  // Recent videos from filtered set — latest 3
  const recentVideos = [...filteredVideos]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  const selectedLabel = SEMESTER_OPTIONS.find(o => o.value === semesterFilter)?.label || 'All Semesters';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {studentInfo?.name} 👋
          </h1>

          <p className="text-slate-500 mt-2 text-[15px] leading-relaxed max-w-2xl">
            Track your academic progress, continue learning,
            and explore newly uploaded content from your faculty.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            {studentInfo?.department}
            {studentInfo?.year     && ` · Year ${studentInfo.year}`}
            {Number(studentInfo?.year) !== 1 && studentInfo?.semester && ` · Sem ${studentInfo.semester}`}
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Semester filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={semesterFilter}
              onChange={e => setSemesterFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-slate-300 shadow-sm"
            >
              {SEMESTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
          </div>

          <Link
            to="/dashboard/materials"
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            Browse materials <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/40 rounded-full blur-3xl"></div>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="mt-auto">
                {isLoading
                  ? <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                  : <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                }
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Videos */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recently added</h2>
            <p className="text-sm text-slate-500">
              Latest content{semesterFilter ? ` for ${selectedLabel}` : ' from your faculty'}.
            </p>
          </div>
          <Link to="/dashboard/materials" className="flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : recentVideos.length === 0 ? (
         <div className="overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <PlayCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-slate-500">No videos{semesterFilter ? ` for ${selectedLabel}` : ' uploaded yet'}</p>
            <p className="text-sm text-slate-400 mt-1">
              {semesterFilter ? 'Try selecting a different semester.' : 'Your faculty will upload content soon.'}
            </p>
            {semesterFilter && (
              <button onClick={() => setSemesterFilter('')} className="mt-3 text-sm text-blue-600 font-medium hover:underline">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
            {recentVideos.map((video) => (
              <Link
                key={video.id}
                to={`/subjects/${encodeURIComponent(video.subject)}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{video.subject} · {video.unit}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Subjects quick access */}
      {!isLoading && filteredSubjects.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your subjects</h2>
              <p className="text-sm text-slate-500">
                {semesterFilter ? `Subjects for ${selectedLabel}.` : 'Jump straight into a subject.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.slice(0, 6).map((subject, i) => {
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-500'];
              return (
                <Link
                  key={subject.name}
                  to={`/subjects/${encodeURIComponent(subject.name)}`}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className={`w-9 h-9 ${colors[i % colors.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{subject.name}</p>
                    <p className="text-xs text-slate-400">{subject.videos.length}v · {subject.pdfs.length}p</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;

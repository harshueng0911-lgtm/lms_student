import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, FileText, PlayCircle, Search, ChevronRight, AlertCircle, Filter } from 'lucide-react';
import { useStudentMaterials } from '../../../hooks/useStudentMaterials';

const SEMESTER_OPTIONS = [
  { label: 'All Semesters', value: '' },
  { label: '1st Year', value: '1' },   // 1st year has no semester split
  { label: '2-1', value: '2-1' },
  { label: '2-2', value: '2-2' },
  { label: '3-1', value: '3-1' },
  { label: '3-2', value: '3-2' },
  { label: '4-1', value: '4-1' },
  { label: '4-2', value: '4-2' },
];

// ── Subject Card ─────────────────────────────────────────────────────────────
const SubjectCard = ({ subject, index }) => {
  const totalItems = subject.videos.length + subject.pdfs.length +(subject.assignments?.length || 0);
  const colors = [
    { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 text-blue-600' },
    { bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 text-emerald-600' },
    { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-600' },
    { bg: 'from-orange-500 to-amber-500', light: 'bg-orange-50 text-orange-600' },
    { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 text-rose-600' },
    { bg: 'from-cyan-500 to-sky-600', light: 'bg-cyan-50 text-cyan-600' },
  ];
  const color = colors[index % colors.length];

  return (
    <Link
      to={`/subjects/${encodeURIComponent(subject.name)}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${color.bg} p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:underline decoration-white/50">
            {subject.name}
          </h3>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 flex-grow flex flex-col gap-4">
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${color.light}`}>
            <PlayCircle className="w-3.5 h-3.5" />
            {subject.videos.length} Videos
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-slate-50 text-slate-600">
            <FileText className="w-3.5 h-3.5" />
            {subject.pdfs.length} PDFs
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-orange-50 text-orange-600">
            📝 {subject.assignments?.length || 0} Assessments
          </div>
        </div>

        <div className="text-xs text-slate-400">{subject.units.length} unit{subject.units.length !== 1 ? 's' : ''} · {totalItems} materials</div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">Open subject</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-28 bg-slate-200"></div>
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
      <div className="h-3 bg-slate-100 rounded w-1/3"></div>
    </div>
  </div>
);

// ── Main view ─────────────────────────────────────────────────────────────────
const MyMaterials = () => {
  const { studentInfo } = useOutletContext();
  const { subjects, allVideos, allPdfs, isLoading, error } = useStudentMaterials();
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
    useEffect(() => {
      if (!studentInfo?.year) return;

      if (Number(studentInfo.year) === 1) {

        setSemesterFilter('1');

      } else {

        setSemesterFilter(
          `${studentInfo.year}-${studentInfo.semester}`
        );

      }

    }, [studentInfo]);

  // When a semester is selected, rebuild subjects from only those materials
  const visibleSubjects = (() => {
    if (!semesterFilter) return subjects;

    const isYearOnly = !semesterFilter.includes('-'); // e.g. "1" → 1st year, no sem split
    const filterYear = isYearOnly
      ? parseInt(semesterFilter, 10)
      : parseInt(semesterFilter.split('-')[0], 10);
    const filterSem = isYearOnly
      ? null
      : parseInt(semesterFilter.split('-')[1], 10);

    const matchItem = (item) => {
      const itemYear = parseInt(item.year, 10);
      if (itemYear !== filterYear) return false;
      if (!isYearOnly) {
        return parseInt(item.semester, 10) === filterSem;
      }
      return true; // 1st year: match all content for year=1, ignore semester
    };

    const filteredVideos = allVideos.filter(matchItem);
    const filteredPdfs   = allPdfs.filter(matchItem);

    // Re-group filtered materials
    const subjectMap = {};
    const addItem = (item, type) => {
      const subject = item.subject || 'General';
      const unit    = item.unit    || 'General';
      if (!subjectMap[subject]) subjectMap[subject] = { name: subject, videos: [], pdfs: [], units: {} };
      if (!subjectMap[subject].units[unit]) subjectMap[subject].units[unit] = { name: unit, videos: [], pdfs: [] };
      if (type === 'video') {
        subjectMap[subject].videos.push(item);
        subjectMap[subject].units[unit].videos.push(item);
      } else {
        subjectMap[subject].pdfs.push(item);
        subjectMap[subject].units[unit].pdfs.push(item);
      }
    };
    filteredVideos.forEach(v => addItem(v, 'video'));
    filteredPdfs.forEach(p   => addItem(p, 'pdf'));
    return Object.values(subjectMap).map(s => ({ ...s, units: Object.values(s.units) }));
  })();

  const filtered = visibleSubjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Materials</h2>
        <p className="text-slate-500 mt-1">
          Showing content for <span className="font-semibold text-slate-700">{studentInfo?.department}</span>
          {studentInfo?.year && ` · Year ${studentInfo.year}`}
          {Number(studentInfo?.year) !== 1 && studentInfo?.semester && ` · Semester ${studentInfo.semester}`}
        </p>
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Semester filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-slate-300"
          >
            {SEMESTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p><strong>Error loading materials:</strong> {error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Subject grid */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((subject, index) => (
            <SubjectCard key={subject.name} subject={subject} index={index} />
          ))}
        </div>
      )}

      {/* Empty state — no materials at all */}
      {!isLoading && !error && subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No materials yet</h3>
          <p className="text-slate-400 max-w-sm text-sm">
            Your faculty hasn't uploaded any videos or PDFs for <strong>{studentInfo?.department}</strong> yet. Check back soon!
          </p>
        </div>
      )}

      {/* Empty state — semester filter returned nothing */}
      {!isLoading && !error && subjects.length > 0 && visibleSubjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Filter className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No materials for Semester {semesterFilter}</h3>
          <p className="text-slate-400 max-w-sm text-sm">Try selecting a different semester from the filter.</p>
          <button
            onClick={() => setSemesterFilter('')}
            className="mt-4 text-sm text-blue-600 font-medium hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* No search results */}
      {!isLoading && !error && visibleSubjects.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No subjects match "<strong>{search}</strong>". Try a different name.
        </div>
      )}
    </div>
  );
};

export default MyMaterials;

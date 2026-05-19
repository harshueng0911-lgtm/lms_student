import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  ChevronLeft,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { supabase } from '../../lib/supabase';


// Helpers


const parseSemesterInt = (semValue) => {
  if (!semValue) return null;

  const str = String(semValue);

  if (str.includes('-')) {
    return parseInt(str.split('-').pop(), 10);
  }

  return parseInt(str, 10);
};

const extractDriveFileId = (url) => {
  if (!url) return null;

  const match =
    url.match(/\/file\/d\/([^/]+)/) ||
    url.match(/[?&]id=([^&]+)/);

  return match ? match[1] : null;
};

const convertGoogleDriveUrl = (url) => {
  if (!url) return '';

  const fileId = extractDriveFileId(url);

  if (!fileId) return url;

  // FULL GOOGLE DRIVE VIEWER
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

const groupByUnit = (
  videos = [],
  pdfs = [],
  assessments = []
) => {

  const unitMap = {};

  const add = (item, type) => {

    const unit = item.unit || 'General';

    if (!unitMap[unit]) {
      unitMap[unit] = {
        name: unit,
        videos: [],
        pdfs: [],
        assessments: [],
      };
    }

    if (type === 'video') {
      unitMap[unit].videos.push(item);
    }

    if (type === 'pdf') {
      unitMap[unit].pdfs.push(item);
    }

    if (type === 'assessment') {
      unitMap[unit].assessments.push(item);
    }
  };

  videos.forEach(v => add(v, 'video'));
  pdfs.forEach(p => add(p, 'pdf'));
  assessments.forEach(a => add(a, 'assessment'));

  return Object.values(unitMap);
};


// ─────────────────────────────────────────────────────────────
// Content Player
// ─────────────────────────────────────────────────────────────

const VideoPlayer = ({ lesson }) => {

  // Empty State
  if (!lesson) {
    return (
      <div className="w-full h-[650px] rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">

        <div className="text-center">

          <FileText className="w-14 h-14 text-slate-600 mx-auto mb-4" />

          <h3 className="text-white text-xl font-semibold mb-2">
            No Content Selected
          </h3>

          <p className="text-slate-400">
            Select content from the sidebar
          </p>

        </div>

      </div>
    );
  }


  // ───────────────── VIDEO VIEW ─────────────────

  if (!lesson.embed_url) {

    return (
      <div className="w-full h-[650px] rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">

        <div className="text-center">

          <PlayCircle className="w-14 h-14 text-slate-600 mx-auto mb-4" />

          <h3 className="text-white text-xl font-semibold mb-2">
            Video Unavailable
          </h3>

          <p className="text-slate-400">
            No video URL available
          </p>

        </div>

      </div>
    );
  }

  const driveId = extractDriveFileId(lesson.embed_url);

  const embedUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : lesson.embed_url;

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-950">

        <h2 className="text-2xl font-bold text-white">
          {lesson.title}
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Video Lecture
        </p>

      </div>

      {/* Video */}
      <div className="aspect-video">

        <iframe
          key={lesson.id}
          src={embedUrl}
          title={lesson.title}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ border: 'none' }}
        />

      </div>

    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const SubjectDetail = () => {

  const { subject: encodedSubject } = useParams();


  const subjectName = decodeURIComponent(encodedSubject);

  const [units, setUnits] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [openUnits, setOpenUnits] = useState({});
  const [studentProfile, setStudentProfile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

      setIsLoading(true);

      try {

        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Not authenticated');
        }

        // Student Profile
        const { data: profile, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setStudentProfile(profile);

        const dept = profile.department;
        const year = parseInt(profile.year, 10);
        const sem = parseSemesterInt(profile.semester);

        console.log('📚 SubjectDetail Query:', {
          dept,
          year,
          sem,
          subjectName
        });

        // Fetch helper
        const fetchContent = async (table) => {

          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('department', dept)
            .eq('subject', subjectName)
            .order('year')
            .order('semester')
            .order('unit')
            .order('created_at');

          if (error) {
            throw error;
          }

          return data || [];
        };

        // Fetch all
        const [videos, pdfs, assessments] = await Promise.all([
          fetchContent('videos'),
          fetchContent('pdfs'),
          fetchContent('assessments')
        ]);

        // Tag item types
        const taggedVideos = videos.map(v => ({
          ...v,
          itemType: 'video'
        }));

        const taggedPdfs = pdfs.map(p => ({
          ...p,
          itemType: 'pdf'
        }));

        const taggedAssessments = assessments.map(a => ({
          ...a,
          itemType: 'assessment'
        }));

        // Group by units
        const groupedUnits = groupByUnit(
          taggedVideos,
          taggedPdfs,
          taggedAssessments
        );

        setUnits(groupedUnits);

        // Open all units
        const initialOpenState = groupedUnits.reduce((acc, unit) => {
          acc[unit.name] = true;
          return acc;
        }, {});

        setOpenUnits(initialOpenState);

        // Select first item automatically
        const firstItem =
          taggedVideos[0] ||
          taggedPdfs[0] ||
          taggedAssessments[0] ||
          null;

        setSelectedLesson(firstItem);

      } catch (err) {

        console.error('❌ SubjectDetail Error:', err);

        setError(err.message);

      } finally {

        setIsLoading(false);
      }
    };

    fetchData();

  }, [subjectName]);

  const allItems = units.flatMap(unit => [
    ...unit.videos,
    ...unit.pdfs,
    ...unit.assessments
  ]);

  const totalVideos = units.reduce(
    (n, unit) => n + unit.videos.length,
    0
  );

  const totalPdfs = units.reduce(
    (n, unit) => n + unit.pdfs.length,
    0
  );

  const totalAssessments = units.reduce(
    (n, unit) => n + unit.assessments.length,
    0
  );

  const toggleUnit = (unitName) => {
    setOpenUnits(prev => ({
      ...prev,
      [unitName]: !prev[unitName]
    }));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

          <Link
            to="/dashboard/materials"
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
          >

            <ChevronLeft className="w-5 h-5 mr-1" />

            <span className="font-medium text-sm">
              Back to My Materials
            </span>

          </Link>

          {studentProfile && (

            <div className="flex items-center gap-2 text-xs font-medium bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm text-slate-500">

              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>

              {studentProfile.department}
              {' · '}
              Year {studentProfile.year}
              {' · '}
              Sem {studentProfile.semester}

            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">

            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 mb-6">

            <AlertCircle className="w-5 h-5 mt-0.5" />

            <p>{error}</p>

          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (

          <>
            {/* Subject Header */}
            <div className="mb-6">

              <h1 className="text-3xl font-bold text-slate-900">
                {subjectName}
              </h1>

              <p className="text-slate-500 mt-1">
                {totalVideos} video{totalVideos !== 1 ? 's' : ''}
                {' · '}
                {totalPdfs} PDF{totalPdfs !== 1 ? 's' : ''}
                {' · '}
                {totalAssessments} assessment{totalAssessments !== 1 ? 's' : ''}
              </p>

            </div>

            {/* Empty */}
            {allItems.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">

                <FileText className="w-14 h-14 text-slate-300 mb-4" />

                <h3 className="text-xl font-bold text-slate-600 mb-1">
                  No materials uploaded yet
                </h3>

                <p className="text-slate-400 text-sm">
                  Your faculty hasn't added content for this subject.
                </p>

              </div>

            ) : (

              <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* LEFT */}
                <div className="flex-1 w-full flex flex-col gap-5">

                  <VideoPlayer
                    lesson={
                      selectedLesson?.itemType === 'pdf'
                        ? null
                        : selectedLesson
                    }
                  />

                </div>

                {/* RIGHT SIDEBAR */}
                <div className="w-full lg:w-[360px] flex-shrink-0">

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden flex flex-col max-h-[calc(100vh-5rem)]">

                    {/* Sidebar Header */}
                    <div className="p-5 border-b border-slate-200">

                      <h3 className="font-bold text-[15px] text-slate-900">
                        Content
                      </h3>

                      <p className="text-[13px] text-slate-500 mt-1">
                        {allItems.length} items
                        {' · '}
                        {units.length} units
                      </p>

                    </div>

                    {/* Units */}
                    <div className="overflow-y-auto flex-1">

                      {units.map((unit) => (

                        <div
                          key={unit.name}
                          className="border-b border-slate-100"
                        >

                          {/* Unit Header */}
                          <button
                            onClick={() => toggleUnit(unit.name)}
                            className="w-full p-4 bg-slate-50 flex justify-between items-center hover:bg-slate-100 transition-colors text-left"
                          >

                            <h4 className="font-bold text-sm text-slate-800">
                              {unit.name}
                            </h4>

                            <div className="flex items-center gap-2">

                              <span className="text-xs text-slate-400">
                                {unit.videos.length}v · {unit.pdfs.length}p · {unit.assessments.length}a
                              </span>

                              {openUnits[unit.name]
                                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                : <ChevronDown className="w-4 h-4 text-slate-400" />
                              }

                            </div>

                          </button>

                          {/* Items */}
                          {openUnits[unit.name] && (

                            <div className="py-1">

                              {/* Videos */}
                              {unit.videos.map((video) => {

  const relatedPdf = unit.pdfs[0];
  const relatedAssessment = unit.assessments[0];

  const isSelected =
    selectedLesson?.id === video.id;

  return (

    <div
      key={video.id}
      className={`mx-2 my-2 rounded-xl border transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >

      <div className="flex items-center justify-between px-4 py-3">

        {/* VIDEO */}
        <button
          onClick={() => setSelectedLesson(video)}
          className="flex items-center gap-3 flex-1 text-left"
        >

          <PlayCircle
            className={`w-5 h-5 ${
              isSelected
                ? 'text-blue-600'
                : 'text-slate-500'
            }`}
          />

          <div>

            <p className={`text-sm font-semibold ${
              isSelected
                ? 'text-blue-700'
                : 'text-slate-800'
            }`}>
              {video.title}
            </p>

          </div>

        </button>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-3 ml-4">

          {/* PDF ICON */}
          {relatedPdf && (

            <button
              onClick={() => {
                setSelectedLesson(relatedPdf);
                setShowPdfModal(true);
              }}
              className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
            >

              <FileText className="w-4 h-4 text-red-600" />

            </button>

          )}

          {/* ASSESSMENT ICON */}
          {relatedAssessment && (

            <Link
              to={`/dashboard/assignments/${relatedAssessment.id}`}
              className="w-9 h-9 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors"
            >

              <span className="text-orange-600 text-sm font-bold">
                📝
              </span>

            </Link>

          )}

        </div>

      </div>

    </div>
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
            )}

          </>
        )}

      </div>

      {/* GOOGLE DRIVE PDF MODAL */}
{showPdfModal &&
  selectedLesson?.itemType === 'pdf' && (

    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">

      <div className="w-screen h-screen bg-slate-950 overflow-hidden shadow-2xl flex flex-col">

        {/* TOP BAR */}
        <div className="h-20 px-6 border-b border-slate-700 bg-slate-900 flex items-center justify-between shadow-lg">

          <h2 className="text-2xl font-bold text-white truncate tracking-wide">
            {selectedLesson.title}
          </h2>

          <div className="flex items-center gap-2">

            {/* DOWNLOAD */}
            <a
              href={selectedLesson.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 text-[#06254D] text-sm font-bold hover:bg-yellow-300 transition-all duration-200 shadow-lg"
            >
              Download PDF
            </a>

            {/* CLOSE */}
            <button
              onClick={() => setShowPdfModal(false)}
              className="w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl"
            >
              ✕
            </button>

          </div>
        </div>

        {/* GOOGLE DRIVE VIEWER */}
        <div className="flex-1 bg-slate-950 overflow-hidden">

          <iframe
            src={`https://drive.google.com/file/d/${extractDriveFileId(
              selectedLesson.file_url
            )}/preview`}
            title="PDF Viewer"
            className="w-full h-full"
            allow="autoplay"
            allowFullScreen
            style={{
              border: "none",
              background: "#1f1f1f",
            }}
          />

        </div>

      </div>

    </div>
)}

    </div>
  );
};

export default SubjectDetail;
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';


const groupBySubjectAndUnit = (videos = [], pdfs = [], assignments = []) => {
  const subjectMap = {};

  const addItem = (item, type) => {
    const subject = item.subject || 'General';
    const unit = item.unit || 'General';

    if (!subjectMap[subject]) {
      subjectMap[subject] = { name: subject, videos: [], pdfs: [], assignments: [], units: {} };
    }
    if (!subjectMap[subject].units[unit]) {
      subjectMap[subject].units[unit] = { name: unit, videos: [], pdfs: [], assignments: [] };
    }

    if (type === 'video') {

  subjectMap[subject].videos.push(item);
  subjectMap[subject].units[unit].videos.push(item);

} else if (type === 'pdf') {

  subjectMap[subject].pdfs.push(item);
  subjectMap[subject].units[unit].pdfs.push(item);

} else if (type === 'assignment') {

  subjectMap[subject].assignments.push(item);
  subjectMap[subject].units[unit].assignments.push(item);

}
  };

  videos.forEach(v => addItem(v, 'video'));
  pdfs.forEach(p => addItem(p, 'pdf'));
  assignments.forEach(a => addItem(a, 'assignment'));

  return Object.values(subjectMap).map(s => ({
    ...s,
    units: Object.values(s.units),
  }));
};

/**
 * Fetches all videos and PDFs visible to the currently logged-in student.
 *
 * Matching logic (department + year + semester):
 *   - department : exact match with student profile
 *   - year       : exact match with student profile
 *   - semester   : student "2-2" is parsed to 2, matched against faculty integer
 *
 * Subject is NOT a filter — it is only used to group content for display.
 * Any content uploaded by faculty for the matching dept/year/sem is visible.
 */
export const useStudentMaterials = () => {
  const [subjects, setSubjects] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [allPdfs, setAllPdfs] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Not authenticated');

        const { data: profile, error: profileErr } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileErr) throw profileErr;

        const dept = profile.department;
        const year = parseInt(profile.year, 10);
        const sem = parseInt(profile.semester, 10);

        console.log('📚 Student profile:', { dept, year, sem, rawSem: profile.semester });

        /**
         * Fetch content for a table (videos / pdfs).
         * Match on: department + year only.
         *
         * semester dropdown (Overview / MyMaterials) filters client-side so
         * students can browse any semester within their year.
         */
        const fetchContent = async (table) => {
          const { data, error: qErr } = await supabase
            .from(table)
            .select('*')
            .eq('department', dept)
            .order('subject')
            .order('unit')
            .order('created_at');

          if (qErr) throw qErr;

          console.log(`✅ ${table}: fetched ${data?.length ?? 0} rows`);
          return data || [];
        };

        const [videos, pdfs, assignments] = await Promise.all([
          fetchContent('videos'),
          fetchContent('pdfs'),
          fetchContent('assessments'),
        ]);

        if (!cancelled) {
          setStudentProfile(profile);
          setAllVideos(videos);
          setAllPdfs(pdfs);
          setAllAssignments(assignments);

          setSubjects(
            groupBySubjectAndUnit(
              videos,
              pdfs,
              assignments
            )
          );
        }
      } catch (err) {
        console.error('useStudentMaterials error:', err.message);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return { subjects, allVideos, allPdfs, allAssignments, studentProfile, isLoading, error };
};

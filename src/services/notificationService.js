import { supabase } from '../lib/supabase';

export const createNotification = async ({
  studentIds = [],
  title,
  message,
  type,
  facultyName,
  redirectUrl
}) => {

  try {

    if (!studentIds.length) return;

    const notifications = studentIds.map((studentId) => ({
      student_id: studentId,
      title,
      message,
      type,
      faculty_name: facultyName,
      redirect_url: redirectUrl
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {

      console.error('Notification creation error:', error.message);

    }

  } catch (err) {

    console.error(err.message);

  }
};
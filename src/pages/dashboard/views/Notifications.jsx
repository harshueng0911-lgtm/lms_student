import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ClipboardList,
  PlayCircle
} from 'lucide-react';

import { supabase } from '../../../lib/supabase';

const iconMap = {
  material: BookOpen,
  assignment: ClipboardList,
  announcement: Bell,
  video: PlayCircle
};

const colorMap = {
  material: 'bg-blue-100 text-blue-600',
  assignment: 'bg-orange-100 text-orange-600',
  announcement: 'bg-purple-100 text-purple-600',
  video: 'bg-green-100 text-green-600'
};

const Notifications = () => {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {

    let channel;

    const setupNotifications = async () => {

      await fetchNotifications();

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase.channel(
        `student-notifications-page-${Date.now()}`
      );

      // INSERT EVENTS
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {

          const newNotification = payload.new;

          setNotifications((prev) => {

            const exists = prev.some(
              (item) => item.id === newNotification.id
            );

            if (exists) return prev;

            return [newNotification, ...prev];

          });

        }
      );

      // UPDATE EVENTS
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {

          const updatedNotification = payload.new;

          setNotifications((prev) =>
            prev.map((item) =>
              item.id === updatedNotification.id
                ? updatedNotification
                : item
            )
          );

        }
      );

      // subscribe ONLY ONCE at end
      channel.subscribe();

    };

    setupNotifications();

    return () => {

      if (channel) {
        supabase.removeChannel(channel);
      }

    };

  }, []);

  const fetchNotifications = async () => {

    try {

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);

    } catch (err) {

      console.error('Notification fetch error:', err.message);

    } finally {

      setLoading(false);

    }
  };

  const handleNotificationClick = async (notification) => {

  try {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id)
      .eq('student_id', user.id);

    if (error) {
      console.error('Read update failed:', error);
      return;
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id
          ? { ...item, is_read: true }
          : item
      )
    );

    if (notification.redirect_url) {

      navigate(notification.redirect_url);

    }

  } catch (err) {

    console.error(err.message);

  }
};
const markAllAsRead = async () => {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return;

  const unreadIds = notifications
    .filter(item => !item.is_read)
    .map(item => item.id);

  if (unreadIds.length === 0) return;

  const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('student_id', user.id)
  .in('id', unreadIds);

  if (error) {
    console.error('Error marking all as read:', error);
    return;
  }

  // instant local UI update
  setNotifications(prev =>
    prev.map(item => ({
      ...item,
      is_read: true
    }))
  );

};

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const filteredNotifications = notifications.filter((item) => {

    if (activeFilter === 'all') return true;

    if (activeFilter === 'unread') return !item.is_read;

    return item.type === activeFilter;
  });

  const formatTime = (date) => {

    const now = new Date();

    const notificationDate = new Date(date);

    const diffInSeconds = Math.floor(
      (now - notificationDate) / 1000
    );

    const minutes = Math.floor(diffInSeconds / 60);

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';

    if (minutes < 60) return `${minutes} mins ago`;

    if (hours < 24) return `${hours} hours ago`;

    return `${days} days ago`;
  };

  if (loading) {

    return (
      <div className="bg-white rounded-2xl border border-slate-200 min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 min-h-[80vh] overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-slate-200">

        <div className="flex items-start justify-between flex-wrap gap-4">

          <div className="flex items-center gap-3">

            <h2 className="text-3xl font-bold text-slate-900">
              Notifications
            </h2>

            {unreadCount > 0 && (
              <div className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {unreadCount} unread
              </div>
            )}

          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">

            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'assignment', label: 'Assignments' },
              { key: 'material', label: 'Materials' },
              { key: 'announcement', label: 'Announcements' },
              { key: 'video', label: 'Videos' }
            ].map((filter) => (

              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>

              

            ))}

          </div>

          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-100 transition"
          >
            Mark All Read
          </button>

        </div>

      </div>

      {/* Notification List */}
      <div className="divide-y divide-slate-100">

        {filteredNotifications.length > 0 ? (

          filteredNotifications.map((item) => {

            const Icon = iconMap[item.type] || Bell;

            return (

              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-5 hover:bg-slate-50 transition cursor-pointer ${
                  !item.is_read ? 'bg-blue-50/40' : ''
                }`}
              >

                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      colorMap[item.type] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-base font-semibold text-slate-800">
                          {item.title}
                        </h3>
                        {item.faculty_name && (
                          <p className="text-xs text-slate-400 mt-2">
                            Uploaded by {item.faculty_name}
                          </p>
                        )}

                        <p className="text-sm text-slate-500 mt-1">
                          {item.message}
                        </p>

                      </div>

                      <div className="flex items-center gap-2 shrink-0">

                        {!item.is_read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        )}

                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatTime(item.created_at)}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            );
          })

        ) : (

          <div className="flex flex-col items-center justify-center py-24 text-center">

            <Bell className="w-14 h-14 text-slate-200 mb-4" />

            <h3 className="text-xl font-bold text-slate-700">
              No notifications found
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              There are no notifications in this category.
            </p>

          </div>

        )}

      </div>

    </div>
  );
};

export default Notifications;
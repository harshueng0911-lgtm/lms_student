import React, { useEffect, useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Header = ({ studentName, studentRole, profilePic }) => {

  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {

    let channel;

    const setupNotifications = async () => {

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      // UNREAD COUNT
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);

      // RECENT UNREAD NOTIFICATIONS
      const { data: latestNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentNotifications(
        (latestNotifications || []).filter(
          (item) => !item.is_read
        )
      );

      // REALTIME CHANNEL
      channel = supabase.channel(
        `header-notifications-${Date.now()}`
      );

      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `student_id=eq.${user.id}`
        },

        async () => {

          // UPDATE UNREAD COUNT
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id)
            .eq('is_read', false);

          setUnreadCount(count || 0);

          // UPDATE RECENT NOTIFICATIONS
          const { data: updatedNotifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          setRecentNotifications(
            (updatedNotifications || []).filter(
              (item) => !item.is_read
            )
          );

        }
      );

      channel.subscribe();

    };

    setupNotifications();

    return () => {

      if (channel) {
        supabase.removeChannel(channel);
      }

    };

  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">

      {/* Search */}
      <div className="flex-1 max-w-xl">

        <div className="relative">

          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>

          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search courses, lessons, documents..."
          />

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 relative">

        {/* BELL */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >

          <div className="relative">

            <Bell
              className={`w-5 h-5 text-slate-600 transition-all duration-300 ${
                unreadCount > 0
                  ? 'animate-pulse scale-110'
                  : ''
              }`}
            />

            {unreadCount > 0 && (
              <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></span>
            )}

          </div>

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}

        </button>

        {/* DROPDOWN */}
        {showDropdown && (

          <div className="absolute top-16 right-0 w-[400px] z-50 overflow-hidden rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.18)]">

            {/* HEADER */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">

              <h3 className="font-bold text-slate-800">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  {unreadCount} unread
                </span>
              )}

            </div>

            {/* LIST */}
            <div className="max-h-[400px] overflow-y-auto">

              {recentNotifications.length > 0 ? (

                recentNotifications.map((item) => (

                  <div
                    key={item.id}
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/dashboard/notifications');
                    }}
                    className="p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition bg-blue-50/40"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {item.message}
                        </p>

                        {item.faculty_name && (
                          <p className="text-[11px] text-slate-400 mt-2">
                            {item.faculty_name}
                          </p>
                        )}

                      </div>

                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1"></div>

                    </div>

                  </div>

                ))

              ) : (

                <div className="p-10 text-center text-slate-400 text-sm">
                  No notifications
                </div>

              )}

            </div>

            {/* FOOTER */}
            <div className="p-3 border-t border-slate-100">

              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/dashboard/notifications');
                }}
                className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                View All Notifications
              </button>

            </div>

          </div>

        )}

        {/* PROFILE */}
        <div className="flex items-center gap-3 border border-slate-200 rounded-full py-1.5 px-2 hover:bg-slate-50 cursor-pointer transition-colors">

          <img
            src={
              profilePic ||
              `https://ui-avatars.com/api/?name=${studentName}`
            }
            alt="Profile"
            className="w-11 h-11 rounded-full object-cover object-top border-2 border-white shadow-sm transition-all duration-300 hover:scale-110"
          />

          <div className="flex flex-col">

            <span className="text-sm font-bold text-slate-700 leading-none">
              {studentName}
            </span>

            <span className="text-xs text-slate-500 mt-0.5">
              {studentRole}
            </span>

          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 ml-1 mr-1" />

        </div>

      </div>

    </header>
  );
};

export default Header;
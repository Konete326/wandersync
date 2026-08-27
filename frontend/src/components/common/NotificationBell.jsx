import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, UserPlus, Sparkles, ChevronRight, CheckCircle2, Clock, X, AtSign } from 'lucide-react';
import { fetchUserNotifications, markNotificationReadAsSeen } from '@/services/friendService';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    totalUnreadCount: 0,
    unreadMessages: [],
    incomingRequests: [],
    mentionNotifications: []
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async (silent = true) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetchUserNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications(false);
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const totalCount = notifications.totalUnreadCount || 0;
  const unreadMessages = notifications.unreadMessages || [];
  const incomingRequests = notifications.incomingRequests || [];
  const mentionNotifications = notifications.mentionNotifications || [];

  const handleOpenMessage = (senderId) => {
    setIsOpen(false);
    navigate(`/community?tab=friends_chat&friendId=${senderId}`);
  };

  const handleOpenRequests = () => {
    setIsOpen(false);
    navigate('/community?tab=find_friends');
  };

  const handleOpenMention = async (notif) => {
    setIsOpen(false);
    try {
      await markNotificationReadAsSeen(notif._id);
    } catch {}
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/community');
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(true);
        }}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary border border-border/80 transition-all cursor-pointer shadow-xs"
        title="Notifications, Mentions & Messages"
      >
        <Bell className="size-4 text-foreground/80" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse border-2 border-background shadow-xs">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#141418]/95 backdrop-blur-xl border border-border/90 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between bg-[#18181c]/80">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-orange-400" />
              <h3 className="text-xs font-bold text-foreground">Notifications</h3>
              {totalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  {totalCount} New
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-border/40">
            {totalCount === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="size-8 text-emerald-400/60 mx-auto" />
                <h4 className="text-xs font-bold text-foreground">All Caught Up!</h4>
                <p className="text-[11px] text-muted-foreground">
                  You have no unread messages, mentions, or pending requests right now.
                </p>
              </div>
            ) : (
              <>
                {/* Mentions Notifications */}
                {mentionNotifications.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="px-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AtSign className="size-3" />
                      <span>Mentions ({mentionNotifications.length})</span>
                    </span>
                    {mentionNotifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleOpenMention(notif)}
                        className="p-2.5 rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer flex items-start gap-3 group"
                      >
                        <div className="relative size-9 rounded-xl border border-amber-500/40 overflow-hidden bg-secondary shrink-0 mt-0.5">
                          <img
                            src={
                              notif.sender?.avatar?.url ||
                              notif.sender?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={notif.sender?.name || 'Traveler'}
                            className="size-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 size-3 bg-amber-500 rounded-tl-md flex items-center justify-center text-[7px] text-black font-extrabold">
                            @
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-foreground truncate group-hover:text-amber-400 transition-colors">
                              {notif.title || 'Mentioned You'}
                            </h5>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className="text-[11px] text-amber-200/90 line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                        </div>

                        <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-amber-400 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Unread Direct Messages */}
                {unreadMessages.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="px-2 text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      <span>Unread Messages ({unreadMessages.length})</span>
                    </span>
                    {unreadMessages.map((msg) => (
                      <div
                        key={msg._id}
                        onClick={() => handleOpenMessage(msg.sender?._id)}
                        className="p-2.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/30 transition-all cursor-pointer flex items-start gap-3 group"
                      >
                        <div className="relative size-9 rounded-xl border border-border overflow-hidden bg-secondary shrink-0 mt-0.5">
                          <img
                            src={
                              msg.sender?.avatar?.url ||
                              msg.sender?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={msg.sender?.name || 'Friend'}
                            className="size-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-foreground truncate group-hover:text-orange-400 transition-colors">
                              {msg.sender?.name || 'Travel Friend'}
                            </h5>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {msg.sharedTrip ? (
                              <span className="text-orange-400 font-semibold flex items-center gap-1">
                                <span>✈️ Shared an itinerary:</span>
                                <span className="truncate">{msg.sharedTrip.title}</span>
                              </span>
                            ) : msg.images?.length > 0 ? (
                              '📷 Shared an image'
                            ) : (
                              msg.text || 'Sent you a message'
                            )}
                          </p>
                        </div>

                        <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-orange-400 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Incoming Friend Requests */}
                {incomingRequests.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="px-2 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <UserPlus className="size-3" />
                      <span>Friend Requests ({incomingRequests.length})</span>
                    </span>
                    {incomingRequests.map((req) => (
                      <div
                        key={req._id}
                        onClick={handleOpenRequests}
                        className="p-2.5 rounded-xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-8 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                            <img
                              src={
                                req.requester?.avatar?.url ||
                                req.requester?.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={req.requester?.name || 'User'}
                              className="size-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-foreground truncate group-hover:text-cyan-400 transition-colors">
                              {req.requester?.name || 'Traveler'}
                            </h5>
                            <p className="text-[10px] text-muted-foreground truncate">
                              Sent you a friend request
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold shrink-0">
                          Review
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-[#18181c] border-t border-border/80 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/community');
              }}
              className="w-full py-1.5 rounded-lg text-xs font-bold text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
            >
              Open Community Hub &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

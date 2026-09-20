import React, { useState } from 'react';
import { Challenge, NotificationItem, User, CollaborationComment, UserRole } from '../types';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Send, 
  Filter, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  User as UserIcon, 
  ExternalLink, 
  RefreshCw,
  Phone,
  Mail,
  AlertCircle,
  Tag,
  Check
} from 'lucide-react';

interface CommunicationHubViewProps {
  challenges: Challenge[];
  notifications: NotificationItem[];
  currentUser: User | null;
  onSelectChallenge: (c: Challenge) => void;
  onUpdateChallenge: (c: Challenge) => void;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onAddNotification?: (notif: NotificationItem) => void;
}

export const CommunicationHubView: React.FC<CommunicationHubViewProps> = ({
  challenges,
  notifications,
  currentUser,
  onSelectChallenge,
  onUpdateChallenge,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onAddNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'discussions' | 'directory'>('notifications');
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>('all');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challenges[0]?.id || '');
  
  // Discussion composer state
  const [newMessage, setNewMessage] = useState('');
  const [isOfficialDirective, setIsOfficialDirective] = useState(false);
  const [customAuthorRole, setCustomAuthorRole] = useState<UserRole>(currentUser?.role || 'citizen');
  const [isPosting, setIsPosting] = useState(false);

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (selectedNotifFilter === 'all') return true;
    if (selectedNotifFilter === 'unread') return !n.isRead;
    if (selectedNotifFilter === 'submission') return n.type === 'submission';
    if (selectedNotifFilter === 'ai_routing') return n.type === 'ai_routing';
    if (selectedNotifFilter === 'team') return n.type === 'team';
    if (selectedNotifFilter === 'pledge') return n.type === 'pledge';
    if (selectedNotifFilter === 'approval') return n.type === 'approval';
    if (selectedNotifFilter === 'patent') return n.type === 'patent';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle posting a cross-stakeholder message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChallenge) return;

    setIsPosting(true);
    const authorName = currentUser?.name || (
      customAuthorRole === 'government' ? 'State Innovation Officer' :
      customAuthorRole === 'university' ? 'Lead Faculty PI' :
      customAuthorRole === 'industry' ? 'Corporate CSR Mentor' :
      'Community Citizen Submitter'
    );
    const authorOrg = currentUser?.organization || (
      customAuthorRole === 'government' ? 'Dept of Higher & Technical Education' :
      customAuthorRole === 'university' ? (selectedChallenge.assignedUniversity?.name || 'Higher Education Institution') :
      customAuthorRole === 'industry' ? 'Industry CSR Cell' :
      'Gram Panchayat Stakeholder'
    );

    const newComment: CollaborationComment = {
      id: `c-${Date.now()}`,
      authorId: currentUser?.id || `user-${Date.now()}`,
      authorName,
      authorRole: customAuthorRole,
      authorOrg,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isOfficialNote: isOfficialDirective,
    };

    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.challenge) {
          onUpdateChallenge(data.challenge);
        }
      } else {
        // Fallback update
        const updatedChallenge: Challenge = {
          ...selectedChallenge,
          comments: [...selectedChallenge.comments, newComment],
        };
        onUpdateChallenge(updatedChallenge);
      }

      // Also trigger a notification if onAddNotification is provided
      if (onAddNotification) {
        onAddNotification({
          id: `notif-${Date.now()}`,
          title: `New Discussion on ${selectedChallenge.code}`,
          message: `${authorName} (${authorOrg}): "${newMessage.trim().slice(0, 70)}..."`,
          timestamp: new Date().toISOString(),
          type: 'submission',
          challengeId: selectedChallenge.id,
          challengeCode: selectedChallenge.code,
          targetRole: 'all',
          isRead: false,
          actorName: authorName,
          actorOrg: authorOrg,
        });
      }

      setNewMessage('');
      setIsOfficialDirective(false);
    } catch (err) {
      console.warn('Error posting comment:', err);
      // Fallback update
      const updatedChallenge: Challenge = {
        ...selectedChallenge,
        comments: [...selectedChallenge.comments, newComment],
      };
      onUpdateChallenge(updatedChallenge);
      setNewMessage('');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="communication-hub-view">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 rounded-xl border-l-4 border-amber-400 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-stone-950 uppercase tracking-wide mb-2">
              <Bell className="w-3.5 h-3.5" />
              Unified Notification & Multi-Stakeholder Communication System
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Seamless Real-Time Interaction Across Citizens, HEIs, Mentors & Government
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-3xl">
              Connect all key pillars of the Jharkhand innovation ecosystem. Receive instant lifecycle alerts on problem routings, faculty team formations, CSR funding grants, milestone approvals, and patent filings, while collaborating directly in verified project communication threads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Bell className="w-4 h-4" />
              {unreadCount} Unread Notifications
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-white p-1.5 rounded-xl border border-stone-200 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Real-Time Notifications Feed</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('discussions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'discussions'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Cross-Stakeholder Collaboration Threads</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>State Ecosystem Directory & Escalation Matrix</span>
        </button>
      </div>

      {/* TAB 1: NOTIFICATIONS FEED */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'submission', label: 'Citizen Submissions' },
                { id: 'ai_routing', label: 'AI HEI Routings' },
                { id: 'team', label: 'University Teams' },
                { id: 'pledge', label: 'CSR Pledges' },
                { id: 'approval', label: 'Govt Approvals' },
                { id: 'patent', label: 'Patents' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedNotifFilter(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    selectedNotifFilter === f.id
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {onMarkAllNotificationsRead && unreadCount > 0 && (
              <button
                onClick={onMarkAllNotificationsRead}
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer self-start"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const matchedChallenge = challenges.find((c) => c.id === notif.challengeId || c.code === notif.challengeCode);

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      notif.isRead ? 'bg-[#faf8f5] border-stone-200' : 'bg-[#f7f4ec] border-emerald-300 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}

                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          notif.type === 'patent' ? 'bg-purple-100 text-purple-900' :
                          notif.type === 'approval' ? 'bg-emerald-100 text-emerald-900' :
                          notif.type === 'pledge' ? 'bg-amber-100 text-amber-900' :
                          notif.type === 'ai_routing' ? 'bg-teal-100 text-teal-900' :
                          'bg-emerald-100 text-emerald-900'
                        }`}>
                          {notif.type.replace('_', ' ')}
                        </span>

                        {notif.challengeCode && (
                          <span className="font-mono text-xs font-bold text-emerald-900 bg-white border border-stone-200 px-2 py-0.5 rounded">
                            {notif.challengeCode}
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-900">
                          {notif.title}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          • {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700">
                        {notif.message}
                      </p>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                        <span>Dispatched by: <strong>{notif.actorName}</strong> ({notif.actorOrg})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {matchedChallenge && (
                        <button
                          onClick={() => onSelectChallenge(matchedChallenge)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Challenge</span>
                        </button>
                      )}

                      {!notif.isRead && onMarkNotificationRead && (
                        <button
                          onClick={() => onMarkNotificationRead(notif.id)}
                          title="Mark as read"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-sm">No notifications found</p>
                <p className="text-xs text-slate-400">Try changing your filter selection above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DISCUSSIONS & MULTI-STAKEHOLDER THREADS */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Challenge Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Problem Statement / Project Thread
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {challenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChallengeId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedChallengeId === c.id
                      ? 'bg-[#faf6ee] border-emerald-700 ring-1 ring-emerald-700'
                      : 'bg-[#faf8f5] border-stone-200 hover:bg-[#f4efe4]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-900">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                      {c.comments.length} msgs
                    </span>
                  </div>
                  <p className="font-bold text-xs text-stone-900 truncate">
                    {c.title}
                  </p>
                  <span className="text-[11px] text-stone-500">
                    {c.district} • {c.assignedUniversity ? c.assignedUniversity.name.split('(')[0] : 'Unassigned'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right 2-Columns: Discussion Feed & Composer */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 border-b border-stone-200 bg-[#faf8f5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedChallenge.code}
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    {selectedChallenge.title}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Multi-Stakeholder Channel: Citizen Submitter • Faculty Lead • Industry Mentor • State Nodal Officer
                </p>
              </div>

              <button
                onClick={() => onSelectChallenge(selectedChallenge)}
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                Open Details <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {selectedChallenge.comments.length > 0 ? (
                selectedChallenge.comments.map((comment) => {
                  const isOfficial = comment.isOfficialNote;
                  const isGov = comment.authorRole === 'government' || comment.authorRole === 'admin';
                  const isUni = comment.authorRole === 'university';
                  const isInd = comment.authorRole === 'industry';

                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        isOfficial
                          ? 'bg-amber-50/60 border-amber-300'
                          : isGov
                          ? 'bg-[#faf6ee] border-emerald-300'
                          : 'bg-[#faf8f5] border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            isGov ? 'bg-emerald-800 text-white' :
                            isUni ? 'bg-stone-700 text-white' :
                            isInd ? 'bg-amber-700 text-white' :
                            'bg-emerald-600 text-white'
                          }`}>
                            {comment.authorRole}
                          </span>

                          <span className="font-bold text-slate-900">
                            {comment.authorName}
                          </span>

                          <span className="text-slate-500 text-[11px]">
                            ({comment.authorOrg})
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {isOfficial && (
                        <div className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                          Official Government / Technical Committee Minute
                        </div>
                      )}

                      <p className="text-slate-800 leading-relaxed text-xs">
                        {comment.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No messages in this project thread yet.</p>
                </div>
              )}
            </div>

            {/* Composer Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">Send as Role:</span>
                  <select
                    value={customAuthorRole}
                    onChange={(e: any) => setCustomAuthorRole(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-white font-medium"
                  >
                    <option value="citizen">Citizen Submitter / PRI Mukhiya</option>
                    <option value="university">University Faculty Lead / Student</option>
                    <option value="industry">Industry Partner / CSR Mentor</option>
                    <option value="government">Government Department Officer</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isOfficialDirective}
                    onChange={(e) => setIsOfficialDirective(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-700"
                  />
                  <span>Mark as Official Directive / Committee Note</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type clarification, technical advice, or project milestone update for ${selectedChallenge.code}...`}
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />

                <button
                  type="submit"
                  disabled={isPosting || !newMessage.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: STATE ECOSYSTEM DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-800" />
              Yukti Marg State Innovation Coordination Directory
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Official nodal focal points for Higher Education Institutions, Government Departments, CSR Councils, and District Innovation Cells.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'State Innovation Nodal Cell',
                org: 'Directorate of Higher & Technical Education',
                contact: 'Dr. Manoj Kumar, IAS (State Mission Director)',
                email: 'director-hted@jharkhand.gov.in',
                phone: '+91 651 249 0123',
                role: 'Government State Oversight',
              },
              {
                name: 'BIT Mesra Innovation & TBI Hub',
                org: 'Birla Institute of Technology, Mesra, Ranchi',
                contact: 'Prof. Dr. Rajesh K. Verma (Dean R&D / TBI Head)',
                email: 'dean.rnd@bitmesra.ac.in',
                phone: '+91 651 227 5444',
                role: 'HEI Partner (Tech & IDEA Lab)',
              },
              {
                name: 'TexMiN Technology Innovation Hub',
                org: 'IIT (ISM) Dhanbad',
                contact: 'Dr. Dheeraj Kumar (Director TexMiN)',
                email: 'texmin@iitism.ac.in',
                phone: '+91 326 223 5001',
                role: 'HEI Partner (Mining & Clean Energy)',
              },
              {
                name: 'Birsa Agricultural University Tech Cell',
                org: 'BAU Kanke, Ranchi',
                contact: 'Dr. A. Wadood (Director of Research)',
                email: 'research@bauranchi.org',
                phone: '+91 651 245 5002',
                role: 'HEI Partner (Agro & Rural)',
              },
              {
                name: 'Tata Steel CSR & Innovation Council',
                org: 'Tata Steel Corporate Services, Jamshedpur',
                contact: 'Sunil Murmu (Head, Grassroots CSR)',
                email: 'csr.projects@tatasteel.com',
                phone: '+91 657 242 8111',
                role: 'Industry & CSR Partner',
              },
              {
                name: 'Panchayati Raj Nodal Cell',
                org: 'State Institute of Rural Development (SIRD)',
                contact: 'Smt. Vandana Dadel (Secretary PRI)',
                email: 'pri.innovations@jharkhand.gov.in',
                phone: '+91 651 240 1199',
                role: 'Panchayat & Community Intake',
              },
            ].map((d, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-[#faf8f5] space-y-2 text-xs">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 inline-block">
                  {d.role}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{d.name}</h4>
                <p className="text-slate-600 font-medium">{d.org}</p>
                <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-500 text-[11px]">
                  <div><strong>Contact:</strong> {d.contact}</div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {d.email}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {d.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

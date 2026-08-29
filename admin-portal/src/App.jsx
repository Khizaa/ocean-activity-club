import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5001/api';

const ACTIVITIES = ['Swimming', 'Badminton', 'Gym', 'Basketball', 'Football', 'Table Tennis'];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Auth Form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'announcements' | 'groups' | 'competitions' | 'bookings'

  // Admin Data Stores
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  // Form States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('Maintenance');
  const [annImportant, setAnnImportant] = useState(false);

  const [grpName, setGrpName] = useState('');
  const [grpActivity, setGrpActivity] = useState(ACTIVITIES[0]);
  const [grpDesc, setGrpDesc] = useState('');
  const [grpMax, setGrpMax] = useState(12);

  const [compTitle, setCompTitle] = useState('');
  const [compActivity, setCompActivity] = useState(ACTIVITIES[0]);
  const [compDate, setCompDate] = useState('2026-09-05');
  const [compSlot, setCompSlot] = useState('10:00 AM - 04:00 PM');
  const [compLoc, setCompLoc] = useState('Court 1 & Court 2');
  const [compMax, setCompMax] = useState(16);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser, activeTab]);

  const fetchAllData = () => {
    fetchBookings();
    fetchAnnouncements();
    fetchGroups();
    fetchCompetitions();
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const res = await fetch(`${API_BASE}/competitions`);
      const data = await res.json();
      setCompetitions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.user.role !== 'admin') throw new Error('Access denied. Administrator privileges required.');

      setCurrentUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, content: annContent, category: annCategory, important: annImportant })
      });
      if (res.ok) {
        setAnnTitle('');
        setAnnContent('');
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  // Group Actions
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: grpName, activity: grpActivity, description: grpDesc, maxMembers: grpMax })
      });
      if (res.ok) {
        setGrpName('');
        setGrpDesc('');
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondJoinRequest = async (groupId, userId, action) => {
    try {
      const res = await fetch(`${API_BASE}/admin/groups/${groupId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      if (res.ok) fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  // Competition Actions
  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: compTitle, activity: compActivity, date: compDate, timeSlot: compSlot, location: compLoc, maxParticipants: compMax })
      });
      if (res.ok) {
        setCompTitle('');
        fetchCompetitions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Admin: Remove this booking reservation?')) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // ADMIN LOGIN VIEW
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <span className="inline-block p-3 rounded-2xl bg-slate-800 text-slate-300 mb-2 font-bold text-xl">🛡️</span>
            <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
            <p className="text-xs text-slate-400 mt-1">Club Operations & Management</p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs mb-4 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Admin Username</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 font-black rounded-xl text-xs transition shadow-lg mt-2"
            >
              Access Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalPendingRequests = groups.reduce((acc, g) => acc + g.pendingRequests.length, 0);

  // ----------------------------------------------------
  // ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur sticky top-0 z-50 border-b border-slate-800 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
            ⚙️
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wide">Club Admin Control</h1>
            <p className="text-[11px] text-slate-400">Authenticated as: <span className="text-slate-200 font-semibold">{currentUser.username}</span></p>
          </div>
        </div>

        <nav className="flex bg-slate-950 p-1 rounded-xl text-xs font-semibold text-slate-400 border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition ${activeTab === 'overview' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-1.5 rounded-lg transition ${activeTab === 'announcements' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'}`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3.5 py-1.5 rounded-lg transition ${activeTab === 'groups' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'}`}
          >
            Groups {totalPendingRequests > 0 && <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">{totalPendingRequests}</span>}
          </button>
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-3.5 py-1.5 rounded-lg transition ${activeTab === 'competitions' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'}`}
          >
            Competitions
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg transition ${activeTab === 'bookings' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'}`}
          >
            All Reservations ({bookings.length})
          </button>
        </nav>

        <button onClick={() => setCurrentUser(null)} className="text-xs font-bold text-slate-500 hover:text-rose-400 transition">
          Exit Session
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">

        {/* OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-black mt-1 text-slate-100">{bookings.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Squads</p>
                <p className="text-3xl font-black mt-1 text-slate-100">{groups.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Join Requests</p>
                <p className={`text-3xl font-black mt-1 ${totalPendingRequests > 0 ? 'text-amber-400' : 'text-slate-100'}`}>{totalPendingRequests}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tournaments</p>
                <p className="text-3xl font-black mt-1 text-slate-100">{competitions.length}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider">Operations Console</h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button onClick={() => setActiveTab('announcements')} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition font-semibold">
                    📢 Post Announcement
                  </button>
                  <button onClick={() => setActiveTab('groups')} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition font-semibold">
                    👥 Create Activity Group
                  </button>
                  <button onClick={() => setActiveTab('competitions')} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition font-semibold">
                    🏆 Schedule Tournament
                  </button>
                  <button onClick={() => setActiveTab('bookings')} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition font-semibold">
                    📅 Audit Reservations
                  </button>
                </div>
              </div>

              {/* Court Schedule Summary */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider">Court 1 Constraints Status</h2>
                <div className="space-y-3 text-xs text-slate-400">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span>Court 1 Slot Window:</span>
                    <span className="font-mono text-emerald-400 font-bold">15:00 - 17:00 Fixed</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span>Court 1 Allowed Type:</span>
                    <span className="font-mono text-emerald-400 font-bold">Individual Only</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span>Court 2 Policy:</span>
                    <span className="font-mono text-slate-300 font-bold">Flexible / Group Allowed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1">
              <h2 className="font-bold text-sm text-slate-200 mb-4">Post Broadcast Announcement</h2>
              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Event">Event</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Content</label>
                  <textarea
                    required
                    rows="4"
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-slate-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-400">
                  <input type="checkbox" checked={annImportant} onChange={(e) => setAnnImportant(e.target.checked)} />
                  Mark as High Priority / Alert
                </label>
                <button type="submit" className="w-full py-2.5 bg-slate-100 text-slate-950 font-bold rounded-xl hover:bg-white transition">
                  Publish Broadcast
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 space-y-3">
              <h2 className="font-bold text-sm text-slate-200 mb-2">Active Announcements</h2>
              {announcements.map((a) => (
                <div key={a.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-200">{a.title}</span>
                      {a.important && <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">PRIORITY</span>}
                    </div>
                    <p className="text-xs text-slate-400">{a.content}</p>
                    <p className="text-[10px] text-slate-600 mt-2">{a.category} • Published {a.date}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-xs text-rose-400 font-bold hover:underline">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1">
              <h2 className="font-bold text-sm text-slate-200 mb-4">Create Admin Group / Squad</h2>
              <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Group Name</label>
                  <input
                    type="text"
                    required
                    value={grpName}
                    onChange={(e) => setGrpName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Activity</label>
                  <select
                    value={grpActivity}
                    onChange={(e) => setGrpActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  >
                    {ACTIVITIES.map((act) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Max Members</label>
                  <input
                    type="number"
                    value={grpMax}
                    onChange={(e) => setGrpMax(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Description</label>
                  <textarea
                    rows="3"
                    value={grpDesc}
                    onChange={(e) => setGrpDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-100 text-slate-950 font-bold rounded-xl hover:bg-white transition">
                  Create Squad
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 space-y-4">
              <h2 className="font-bold text-sm text-slate-200">Group Approvals & Roster</h2>
              {groups.map((g) => (
                <div key={g.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{g.name} <span className="text-xs font-normal text-slate-500">({g.activity})</span></h3>
                      <p className="text-xs text-slate-400">{g.description}</p>
                    </div>
                    <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                      {g.members.length}/{g.maxMembers} Members
                    </span>
                  </div>

                  {/* Pending Requests Section */}
                  {g.pendingDetails && g.pendingDetails.length > 0 && (
                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                      <p className="text-[11px] font-bold text-amber-400 uppercase mb-2">Pending Member Join Requests:</p>
                      <div className="space-y-2">
                        {g.pendingDetails.map((reqUser) => (
                          <div key={reqUser.id} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">👤 {reqUser.username}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondJoinRequest(g.id, reqUser.id, 'accept')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespondJoinRequest(g.id, reqUser.id, 'reject')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-md"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approved Members Roster */}
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-400">Current Members: </span>
                    {g.memberDetails && g.memberDetails.length > 0
                      ? g.memberDetails.map((m) => m.username).join(', ')
                      : 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPETITIONS TAB */}
        {activeTab === 'competitions' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1">
              <h2 className="font-bold text-sm text-slate-200 mb-4">Create Competition</h2>
              <form onSubmit={handleCreateCompetition} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Match Title</label>
                  <input
                    type="text"
                    required
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Activity</label>
                  <select
                    value={compActivity}
                    onChange={(e) => setCompActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  >
                    {ACTIVITIES.map((act) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    value={compDate}
                    onChange={(e) => setCompDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Time Window</label>
                  <input
                    type="text"
                    value={compSlot}
                    onChange={(e) => setCompSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Location</label>
                  <input
                    type="text"
                    value={compLoc}
                    onChange={(e) => setCompLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase">Max Players</label>
                  <input
                    type="number"
                    value={compMax}
                    onChange={(e) => setCompMax(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-100 text-slate-950 font-bold rounded-xl hover:bg-white transition">
                  Schedule Match
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 space-y-3">
              <h2 className="font-bold text-sm text-slate-200 mb-2">Scheduled Matches</h2>
              {competitions.map((c) => (
                <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm">{c.title}</h3>
                    <span className="text-xs font-mono text-emerald-400">{c.participants.length}/{c.maxParticipants} Registered</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">📍 {c.location} | 🗓 {c.date} ({c.timeSlot})</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS AUDIT TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="font-bold text-sm text-slate-200">System Wide Court Reservations Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Activity</th>
                    <th className="p-3">Court</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Slot</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-950/50">
                      <td className="p-3 font-bold text-slate-200">{b.username}</td>
                      <td className="p-3">{b.activity}</td>
                      <td className="p-3 font-mono">{b.court}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.type === 'Individual' ? 'bg-cyan-950 text-cyan-300' : 'bg-indigo-950 text-indigo-300'}`}>
                          {b.type} {b.skillLevel ? `(${b.skillLevel})` : ''}
                        </span>
                      </td>
                      <td className="p-3">{b.date}</td>
                      <td className="p-3 font-mono">{b.timeSlot}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleCancelBooking(b.id)} className="text-rose-400 hover:text-rose-300 font-bold">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
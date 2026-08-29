import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5001/api';

const ACTIVITIES = ['Swimming', 'Badminton', 'Gym', 'Basketball', 'Football', 'Table Tennis'];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Auth Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Portal State
  const [activeTab, setActiveTab] = useState('home');
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  // Booking Form State
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [court, setCourt] = useState('Court 1');
  const [date, setDate] = useState('2026-08-25');
  const [bookingType, setBookingType] = useState('Individual');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [timeSlot, setTimeSlot] = useState('15:00-17:00');
  const [bookingMsg, setBookingMsg] = useState({ text: '', error: false });

  useEffect(() => {
    if (currentUser) {
      fetchUserBookings();
      fetchAnnouncements();
      fetchGroups();
      fetchCompetitions();
    }
  }, [currentUser, activeTab]);

  const fetchUserBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${currentUser.id}`);
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isSignUp ? '/signup' : '/login';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (isSignUp) {
        setIsSignUp(false);
        setAuthError('Account created successfully! Please sign in.');
      } else {
        setCurrentUser(data.user);
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingMsg({ text: '', error: false });

    const payload = {
      userId: currentUser.id,
      username: currentUser.username,
      activity,
      court,
      date,
      timeSlot,
      type: bookingType,
      skillLevel: bookingType === 'Individual' ? skillLevel : null
    };

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Booking failed');

      setBookingMsg({ text: 'Booking confirmed!', error: false });
      setTimeout(() => {
        setActiveTab('home');
        setBookingMsg({ text: '', error: false });
      }, 1000);
    } catch (err) {
      setBookingMsg({ text: err.message, error: true });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: 'DELETE' });
      if (res.ok) fetchUserBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      alert(data.message);
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterCompetition = async (compId) => {
    try {
      const res = await fetch(`${API_BASE}/competitions/${compId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      alert(data.message);
      fetchCompetitions();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // UNAUTHENTICATED VIEW
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-soft-1">
        <div className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl w-full max-w-md border border-soft-2">
          <div className="text-center mb-6">
            <span className="inline-block p-3 rounded-2xl bg-soft-2 text-soft-5 mb-2 font-bold text-xl">🌊</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Activity Club</h1>
            <p className="text-xs font-semibold text-soft-5 mt-0.5">Member Portal</p>
          </div>

          {authError && (
            <div className={`p-3 rounded-xl text-xs mb-4 font-medium ${authError.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-soft-1/50 border border-soft-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-soft-4"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-3.5 py-2.5 bg-soft-1/50 border border-soft-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-soft-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-soft-4 hover:bg-soft-5 text-white font-bold rounded-xl text-sm shadow transition"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} className="text-soft-5 font-bold underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-soft-1">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur sticky top-0 z-50 border-b border-soft-2 px-6 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-soft-4 flex items-center justify-center text-white font-black text-lg shadow-sm">
            🌊
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">Ocean Club</h1>
            <p className="text-[11px] text-soft-5">Member: <span className="font-semibold text-slate-800">{currentUser.username}</span></p>
          </div>
        </div>

        <nav className="flex bg-soft-2/50 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'home' ? 'bg-white text-soft-5 font-bold shadow-sm' : 'hover:text-slate-900'}`}
          >
            My Weekly Bookings
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'book' ? 'bg-white text-soft-5 font-bold shadow-sm' : 'hover:text-slate-900'}`}
          >
            Book Activity
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'groups' ? 'bg-white text-soft-5 font-bold shadow-sm' : 'hover:text-slate-900'}`}
          >
            Club Groups
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'matches' ? 'bg-white text-soft-5 font-bold shadow-sm' : 'hover:text-slate-900'}`}
          >
            Competitions & Matches
          </button>
        </nav>

        <button
          onClick={() => setCurrentUser(null)}
          className="text-xs font-bold text-slate-400 hover:text-rose-600 transition"
        >
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {announcements.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Club Announcements</h3>
                <div className="grid gap-3">
                  {announcements.map((a) => (
                    <div key={a.id} className={`p-4 rounded-2xl border ${a.important ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-white border-soft-2 text-slate-700'} shadow-sm`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{a.title}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-soft-2 text-slate-700">
                          {a.category}
                        </span>
                      </div>
                      <p className="text-xs opacity-90">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-800">Your Reserved Activity Slots</h2>
                <span className="text-xs font-bold bg-soft-2 text-slate-800 px-3 py-1 rounded-full">
                  {bookings.length} Booked
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-soft-3 rounded-3xl p-12 text-center">
                  <p className="text-slate-500 text-sm mb-4">You have no upcoming bookings for this week.</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-5 py-2.5 bg-soft-4 hover:bg-soft-5 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Reserve an Activity Slot
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white p-5 rounded-2xl border border-soft-2 shadow-sm relative hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-soft-5 bg-soft-1 px-2 py-0.5 rounded-md">
                            {b.activity}
                          </span>
                          <h3 className="font-bold text-slate-800 text-base mt-1">{b.court}</h3>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-soft-2 text-slate-800">
                          {b.type} {b.skillLevel ? `(${b.skillLevel})` : ''}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 mb-4">
                        <p><span className="font-semibold text-slate-800">Date:</span> {b.date}</p>
                        <p><span className="font-semibold text-slate-800">Time:</span> {b.timeSlot}</p>
                      </div>
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKING TAB */}
        {activeTab === 'book' && (
          <div className="bg-white p-6 rounded-3xl border border-soft-2 shadow-sm max-w-xl mx-auto">
            <h2 className="text-lg font-black text-slate-800 mb-4">Book Facility Court / Slot</h2>

            {bookingMsg.text && (
              <div className={`p-3 rounded-xl text-xs mb-4 font-medium ${bookingMsg.error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {bookingMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Select Activity</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-soft-2 rounded-xl bg-soft-1/30 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-soft-4"
                >
                  {ACTIVITIES.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Court Option</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCourt('Court 1');
                      setBookingType('Individual');
                      setTimeSlot('15:00-17:00');
                    }}
                    className={`p-3.5 border rounded-2xl text-left transition ${court === 'Court 1' ? 'border-soft-4 bg-soft-1 shadow-sm' : 'border-soft-2 hover:bg-soft-1/30'}`}
                  >
                    <p className="font-bold text-slate-800">Court 1 / Pool 1</p>
                    <p className="text-[10px] text-soft-5 mt-1 font-medium">Fixed Individual slots (15:00 - 17:00 daily)</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourt('Court 2')}
                    className={`p-3.5 border rounded-2xl text-left transition ${court === 'Court 2' ? 'border-soft-4 bg-soft-1 shadow-sm' : 'border-soft-2 hover:bg-soft-1/30'}`}
                  >
                    <p className="font-bold text-slate-800">Court 2 / Pool 2</p>
                    <p className="text-[10px] text-slate-500 mt-1">Flexible slots (Individual or Group)</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Booking Type</label>
                <div className="flex gap-4 font-semibold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="bType" checked={bookingType === 'Individual'} onChange={() => setBookingType('Individual')} />
                    Individual
                  </label>
                  <label className={`flex items-center gap-1.5 cursor-pointer ${court === 'Court 1' ? 'opacity-40 pointer-events-none' : ''}`}>
                    <input type="radio" name="bType" disabled={court === 'Court 1'} checked={bookingType === 'Group'} onChange={() => setBookingType('Group')} />
                    Group {court === 'Court 1' && '(Court 2 only)'}
                  </label>
                </div>
              </div>

              {bookingType === 'Individual' && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Skill Level</label>
                  <div className="flex gap-4 font-semibold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="sLevel" checked={skillLevel === 'Beginner'} onChange={() => setSkillLevel('Beginner')} />
                      Beginner
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="sLevel" checked={skillLevel === 'Pro'} onChange={() => setSkillLevel('Pro')} />
                      Pro
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-soft-2 rounded-xl bg-soft-1/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">Time Slot</label>
                  {court === 'Court 1' ? (
                    <input type="text" disabled value="15:00 - 17:00 (Fixed)" className="w-full px-3.5 py-2 border border-soft-2 rounded-xl bg-slate-100 text-slate-500 font-medium" />
                  ) : (
                    <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full px-3.5 py-2 border border-soft-2 rounded-xl bg-soft-1/30 font-medium">
                      <option value="09:00-11:00">09:00 AM – 11:00 AM</option>
                      <option value="11:00-13:00">11:00 AM – 01:00 PM</option>
                      <option value="13:00-15:00">01:00 PM – 03:00 PM</option>
                      <option value="17:00-19:00">05:00 PM – 07:00 PM</option>
                    </select>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-soft-4 hover:bg-soft-5 text-white font-bold rounded-xl shadow transition mt-2">
                Confirm Booking
              </button>
            </form>
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4">Official Activity Squads & Groups</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((g) => {
                const isMember = g.members.includes(currentUser.id);
                const isPending = g.pendingRequests.includes(currentUser.id);

                return (
                  <div key={g.id} className="bg-white p-5 rounded-2xl border border-soft-2 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold bg-soft-2 text-slate-800 px-2.5 py-0.5 rounded-full">{g.activity}</span>
                        <span className="text-xs font-semibold text-slate-400">{g.members.length} / {g.maxMembers} Members</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">{g.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">{g.description}</p>
                    </div>

                    <div>
                      {isMember ? (
                        <div className="py-2 bg-emerald-50 text-emerald-700 text-center font-bold text-xs rounded-xl">✓ Active Group Member</div>
                      ) : isPending ? (
                        <div className="py-2 bg-amber-50 text-amber-700 text-center font-bold text-xs rounded-xl">⏱ Join Request Pending Admin Approval</div>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(g.id)}
                          className="w-full py-2 bg-soft-4 hover:bg-soft-5 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Request to Join Group
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4">Club Tournaments & Match Registrations</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {competitions.map((c) => {
                const isRegistered = c.participants.includes(currentUser.id);

                return (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-soft-2 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold bg-soft-2 text-slate-800 px-2.5 py-0.5 rounded-full">{c.activity}</span>
                        <span className="text-xs font-bold text-slate-400">{c.participants.length} / {c.maxParticipants} Registered</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">{c.title}</h3>
                      <p className="text-xs text-slate-600 font-medium mb-1">📍 {c.location}</p>
                      <p className="text-xs text-slate-500 mb-3">🗓 {c.date} | ⏰ {c.timeSlot}</p>
                    </div>

                    <button
                      onClick={() => handleRegisterCompetition(c.id)}
                      className={`w-full py-2.5 text-xs font-bold rounded-xl transition shadow-sm ${isRegistered ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-soft-4 hover:bg-soft-5 text-white'}`}
                    >
                      {isRegistered ? 'Withdraw Registration' : 'Register for Match'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
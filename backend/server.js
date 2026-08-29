const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for both Member Portal (Port 3000) and Admin Portal (Port 3001)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ----------------------------------------------------
// IN-MEMORY DATA STORE
// ----------------------------------------------------

const users = [
  { id: 1, username: 'admin', password: 'password123', role: 'admin' },
  { id: 2, username: 'khine', password: '123', role: 'member' },
  { id: 3, username: 'Jay', password: '123', role: 'member' }
];

const bookings = [
  {
    id: 1,
    userId: 2,
    username: 'khine',
    activity: 'Badminton',
    court: 'Court 1',
    date: '2026-08-25',
    timeSlot: '15:00-17:00',
    type: 'Individual',
    skillLevel: 'Beginner'
  },
  {
    id: 2,
    userId: 2,
    username: 'khine',
    activity: 'Swimming',
    court: 'Court 2',
    date: '2026-08-26',
    timeSlot: '09:00-11:00',
    type: 'Group',
    skillLevel: null
  }
];

const announcements = [
  {
    id: 1,
    title: 'Pool Maintenance Schedule',
    content: 'Swimming Pool 1 will be closed for quarterly cleaning on Friday from 8 AM to 12 PM.',
    category: 'Maintenance',
    date: '2026-08-22',
    important: true
  },
  {
    id: 2,
    title: 'Annual Badminton Singles Championship',
    content: 'Registrations are now open for the Autumn Badminton League. Check out the Matches tab!',
    category: 'Event',
    date: '2026-08-20',
    important: false
  }
];

const groups = [
  {
    id: 1,
    name: 'Ocean Badminton Smashers',
    activity: 'Badminton',
    description: 'Weekly casual and competitive badminton session for intermediate players.',
    maxMembers: 12,
    members: [2], // Approved User IDs (khine)
    pendingRequests: [3] // Pending User IDs (alex)
  },
  {
    id: 2,
    name: 'Sunrise Swimmers Club',
    activity: 'Swimming',
    description: 'Early morning swim training for technique and endurance.',
    maxMembers: 10,
    members: [2, 3],
    pendingRequests: []
  }
];

const competitions = [
  {
    id: 1,
    title: 'Summer Smash Singles Tournament',
    activity: 'Badminton',
    date: '2026-09-05',
    timeSlot: '10:00 AM - 04:00 PM',
    location: 'Court 1 & Court 2',
    maxParticipants: 16,
    participants: [2], // Array of user IDs registered
    status: 'Open'
  },
  {
    id: 2,
    title: '5-a-side Weekend Derby',
    activity: 'Football',
    date: '2026-09-12',
    timeSlot: '03:00 PM - 07:00 PM',
    location: 'Football Field A',
    maxParticipants: 20,
    participants: [],
    status: 'Open'
  }
];

// ----------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken.' });
  }
  const newUser = { id: users.length + 1, username, password, role: 'member' };
  users.push(newUser);
  res.status(201).json({ message: 'Sign up successful!', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  res.json({ message: 'Login successful!', user: { id: user.id, username: user.username, role: user.role } });
});

// ----------------------------------------------------
// 2. BOOKINGS ENDPOINTS
// ----------------------------------------------------

// Get user bookings
app.get('/api/bookings/:userId', (req, res) => {
  const { userId } = req.params;
  const userBookings = bookings.filter(b => b.userId == userId);
  res.json(userBookings);
});

// Get ALL bookings (For Admin View)
app.get('/api/admin/bookings', (req, res) => {
  res.json(bookings);
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const { userId, username, activity, court, date, timeSlot, type, skillLevel } = req.body;

  if (court === 'Court 1') {
    if (type === 'Group') {
      return res.status(400).json({ message: 'Court 1 is reserved exclusively for Individual slots.' });
    }
    if (timeSlot !== '15:00-17:00') {
      return res.status(400).json({ message: 'Court 1 fixed schedule is strictly 15:00 to 17:00 (3-5 PM).' });
    }
  }

  const overlap = bookings.find(
    b => b.activity === activity && b.court === court && b.date === date && b.timeSlot === timeSlot
  );

  if (overlap) {
    return res.status(400).json({ message: 'This slot is already booked!' });
  }

  const newBooking = {
    id: bookings.length + 1,
    userId,
    username: username || 'Member',
    activity,
    court,
    date,
    timeSlot,
    type,
    skillLevel: type === 'Individual' ? skillLevel : null
  };

  bookings.push(newBooking);
  res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
});

// Delete / Cancel Booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const index = bookings.findIndex(b => b.id == id);
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found.' });
  }
  bookings.splice(index, 1);
  res.json({ message: 'Booking canceled successfully.' });
});

// ----------------------------------------------------
// 3. ANNOUNCEMENTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/announcements', (req, res) => {
  res.json(announcements);
});

app.post('/api/announcements', (req, res) => {
  const { title, content, category, important } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }
  const newAnn = {
    id: announcements.length + 1,
    title,
    content,
    category: category || 'General',
    date: new Date().toISOString().split('T')[0],
    important: !!important
  };
  announcements.unshift(newAnn); // Latest first
  res.status(201).json({ message: 'Announcement created!', announcement: newAnn });
});

app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const index = announcements.findIndex(a => a.id == id);
  if (index === -1) {
    return res.status(404).json({ message: 'Announcement not found.' });
  }
  announcements.splice(index, 1);
  res.json({ message: 'Announcement removed.' });
});

// ----------------------------------------------------
// 4. GROUPS ENDPOINTS
// ----------------------------------------------------

// Get all groups with populated usernames
app.get('/api/groups', (req, res) => {
  const enrichedGroups = groups.map(g => ({
    ...g,
    memberDetails: users.filter(u => g.members.includes(u.id)).map(u => ({ id: u.id, username: u.username })),
    pendingDetails: users.filter(u => g.pendingRequests.includes(u.id)).map(u => ({ id: u.id, username: u.username }))
  }));
  res.json(enrichedGroups);
});

// Admin creates a group
app.post('/api/admin/groups', (req, res) => {
  const { name, activity, description, maxMembers } = req.body;
  if (!name || !activity) {
    return res.status(400).json({ message: 'Group name and activity are required.' });
  }
  const newGroup = {
    id: groups.length + 1,
    name,
    activity,
    description: description || '',
    maxMembers: Number(maxMembers) || 10,
    members: [],
    pendingRequests: []
  };
  groups.push(newGroup);
  res.status(201).json({ message: 'Group created successfully!', group: newGroup });
});

// Member applies to join group
app.post('/api/groups/:id/join', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const group = groups.find(g => g.id == id);

  if (!group) return res.status(404).json({ message: 'Group not found.' });
  if (group.members.includes(userId)) return res.status(400).json({ message: 'You are already a member of this group.' });
  if (group.pendingRequests.includes(userId)) return res.status(400).json({ message: 'Join request already pending.' });
  if (group.members.length >= group.maxMembers) return res.status(400).json({ message: 'Group is full.' });

  group.pendingRequests.push(userId);
  res.json({ message: 'Join request sent to admin for approval!' });
});

// Admin responds to join request (accept or reject)
app.post('/api/admin/groups/:id/request', (req, res) => {
  const { id } = req.params;
  const { userId, action } = req.body; // action: 'accept' or 'reject'
  const group = groups.find(g => g.id == id);

  if (!group) return res.status(404).json({ message: 'Group not found.' });

  group.pendingRequests = group.pendingRequests.filter(uid => uid != userId);

  if (action === 'accept') {
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }
    return res.json({ message: 'Member accepted into group!' });
  }

  res.json({ message: 'Request rejected.' });
});

// ----------------------------------------------------
// 5. COMPETITIONS / MATCHES ENDPOINTS
// ----------------------------------------------------

app.get('/api/competitions', (req, res) => {
  res.json(competitions);
});

// Admin creates match/competition
app.post('/api/admin/competitions', (req, res) => {
  const { title, activity, date, timeSlot, location, maxParticipants } = req.body;
  const newComp = {
    id: competitions.length + 1,
    title,
    activity,
    date,
    timeSlot,
    location,
    maxParticipants: Number(maxParticipants) || 16,
    participants: [],
    status: 'Open'
  };
  competitions.push(newComp);
  res.status(201).json({ message: 'Competition created!', competition: newComp });
});

// Member toggles registration for competition
app.post('/api/competitions/:id/register', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const comp = competitions.find(c => c.id == id);

  if (!comp) return res.status(404).json({ message: 'Competition not found.' });

  const registered = comp.participants.includes(userId);

  if (registered) {
    comp.participants = comp.participants.filter(uid => uid != userId);
    return res.json({ message: 'Unregistered from match.', registered: false });
  } else {
    if (comp.participants.length >= comp.maxParticipants) {
      return res.status(400).json({ message: 'This competition is full!' });
    }
    comp.participants.push(userId);
    return res.json({ message: 'Successfully registered for match!', registered: true });
  }
});

// Start Server on Port 5001
app.listen(5001, () => {
  console.log('Activity Club Backend running on http://localhost:5001');
});
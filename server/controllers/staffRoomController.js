import StaffRoom from '../models/StaffRoom.js';
import Faculty from '../models/Faculty.js';

/**
 * Verified Default Faculty Roster matching uploaded architectural screenshot
 */
export const DEFAULT_FACULTY_ROSTER = [
  {
    facultyId: 'fac_shah',
    name: 'Dr. R. Shah',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-01',
    cabinNumber: 'SR-01',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Artificial Intelligence', building: 'E Block', floor: 'First Floor', room: 'EF01', startTime: '11:30 AM', endTime: '12:30 PM' },
      { day: 'Wednesday', subject: 'Neural Networks', building: 'E Block', floor: 'Second Floor', room: 'ES02', startTime: '02:00 PM', endTime: '03:30 PM' },
    ]
  },
  {
    facultyId: 'fac_mehta',
    name: 'Prof. K. Mehta',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-02',
    cabinNumber: 'SR-02',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Data Structures & Algorithms', building: 'E Block', floor: 'First Floor', room: 'EF02', startTime: '02:00 PM', endTime: '03:00 PM' },
    ]
  },
  {
    facultyId: 'fac_faizan',
    name: 'Faizan Anwar Khan',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-03',
    cabinNumber: 'SR-03',
    currentStatus: 'Unavailable',
    currentActivity: 'Taking Lecture',
    currentLocation: 'E Block – EF03',
    currentClassLocation: 'E Block – EF03',
    currentLectureTime: '10:00 AM – 11:00 AM',
    currentSubject: 'Machine Learning',
    nextAvailability: '11:00 AM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Machine Learning', building: 'E Block', floor: 'First Floor', room: 'EF03', startTime: '10:00 AM', endTime: '11:00 AM' },
      { day: 'Tuesday', subject: 'Deep Learning Seminar', building: 'E Block', floor: 'Second Floor', room: 'ES01', startTime: '11:15 AM', endTime: '12:15 PM' },
      { day: 'Thursday', subject: 'Pattern Recognition', building: 'E Block', floor: 'First Floor', room: 'EF04', startTime: '09:00 AM', endTime: '10:00 AM' }
    ]
  },
  {
    facultyId: 'fac_joshi',
    name: 'Prof. P. Joshi',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-04',
    cabinNumber: 'SR-04',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Operating Systems', building: 'E Block', floor: 'Third Floor', room: 'ET01', startTime: '01:30 PM', endTime: '02:30 PM' },
    ]
  },
  {
    facultyId: 'fac_patel',
    name: 'Prof. A. Patel',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-05',
    cabinNumber: 'SR-05',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Computer Networks', building: 'E Block', floor: 'First Floor', room: 'EF05', startTime: '02:30 PM', endTime: '03:30 PM' },
    ]
  },
  {
    facultyId: 'fac_desai',
    name: 'Dr. M. Desai',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-06',
    cabinNumber: 'SR-06',
    currentStatus: 'Unavailable',
    currentActivity: 'Taking Lecture',
    currentLocation: 'E Block – EF01',
    currentClassLocation: 'E Block – EF01',
    currentLectureTime: '10:00 AM – 11:30 AM',
    currentSubject: 'Database Systems',
    nextAvailability: '11:30 AM',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Database Systems', building: 'E Block', floor: 'First Floor', room: 'EF01', startTime: '10:00 AM', endTime: '11:30 AM' },
    ]
  },
  {
    facultyId: 'fac_dinesh',
    name: 'Dinesh Sir',
    designation: 'Senior Faculty / Lab Incharge',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-07',
    cabinNumber: 'SR-07',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Full Stack Web Dev', building: 'E Block', floor: 'Second Floor', room: 'ES03', startTime: '03:00 PM', endTime: '04:30 PM' },
    ]
  },
  {
    facultyId: 'fac_verma',
    name: 'Dr. N. Verma',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-08',
    cabinNumber: 'SR-08',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Cloud Computing Architecture', building: 'E Block', floor: 'Third Floor', room: 'ET04', startTime: '11:30 AM', endTime: '12:30 PM' },
    ]
  },
  {
    facultyId: 'fac_rao',
    name: 'Prof. D. Rao',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-09',
    cabinNumber: 'SR-09',
    currentStatus: 'Available',
    currentActivity: 'In Cabin',
    currentLocation: 'Staff Room 01',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Cyber Security & Cryptography', building: 'E Block', floor: 'Second Floor', room: 'ES05', startTime: '01:00 PM', endTime: '02:00 PM' },
    ]
  },
  {
    facultyId: 'fac_nagma',
    name: 'Nagma Mam',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'SR-10',
    cabinNumber: 'SR-10',
    currentStatus: 'Unavailable',
    currentActivity: 'Taking Lecture',
    currentLocation: 'E Block – EF05',
    currentClassLocation: 'E Block – EF05',
    currentLectureTime: '09:30 AM – 11:00 AM',
    currentSubject: 'Software Engineering',
    nextAvailability: '11:00 AM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Software Engineering', building: 'E Block', floor: 'First Floor', room: 'EF05', startTime: '09:30 AM', endTime: '11:00 AM' },
    ]
  },
  {
    facultyId: 'fac_kulkarni',
    name: 'Dr. V. Kulkarni',
    designation: 'Dean, School of Engineering & Computing',
    department: 'School of CSE & Information Science',
    staffRoomId: 'sr_e_block_01',
    cabinId: 'DEAN-OFFICE',
    cabinNumber: 'Dean Office',
    currentStatus: 'Available',
    currentActivity: 'In Executive Office',
    currentLocation: 'Dean Office (E Block Ground)',
    nextAvailability: 'Available Now',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    timetable: [
      { day: 'Monday', subject: 'Academic Council Meeting', building: 'E Block', floor: 'Ground Floor', room: 'Dean Office', startTime: '03:00 PM', endTime: '04:00 PM' },
    ]
  }
];

export const DEFAULT_STAFF_ROOM_LAYOUT = {
  staffRoomId: 'sr_e_block_01',
  name: 'Staff Room 01',
  buildingId: 'bld_e_block',
  buildingName: 'E Block',
  floorNumber: 0,
  floorName: 'Ground Floor',
  totalCabins: 10,
  cabins: [
    // ROW 1 (Top)
    { cabinId: 'SR-01', cabinNumber: 'SR-01', facultyId: 'fac_shah', facultyName: 'Dr. R. Shah', row: 1, col: 1, type: 'cabin', status: 'Available' },
    { cabinId: 'SR-02', cabinNumber: 'SR-02', facultyId: 'fac_mehta', facultyName: 'Prof. K. Mehta', row: 1, col: 2, type: 'cabin', status: 'Available' },
    { cabinId: 'WALK-01', cabinNumber: 'Walking Area', facultyId: null, facultyName: null, row: 1, col: 3, type: 'walking_area', status: 'Available' },
    { cabinId: 'SR-03', cabinNumber: 'SR-03', facultyId: 'fac_faizan', facultyName: 'Faizan Anwar Khan', row: 1, col: 4, type: 'cabin', status: 'Unavailable' },
    { cabinId: 'SR-04', cabinNumber: 'SR-04', facultyId: 'fac_joshi', facultyName: 'Prof. P. Joshi', row: 1, col: 5, type: 'cabin', status: 'Available' },

    // ROW 2 (Middle)
    { cabinId: 'SR-05', cabinNumber: 'SR-05', facultyId: 'fac_patel', facultyName: 'Prof. A. Patel', row: 2, col: 1, type: 'cabin', status: 'Available' },
    { cabinId: 'SR-06', cabinNumber: 'SR-06', facultyId: 'fac_desai', facultyName: 'Dr. M. Desai', row: 2, col: 2, type: 'cabin', status: 'Unavailable' },
    { cabinId: 'WALK-02', cabinNumber: 'Walking Area', facultyId: null, facultyName: null, row: 2, col: 3, type: 'walking_area', status: 'Available' },
    { cabinId: 'SR-07', cabinNumber: 'SR-07', facultyId: 'fac_dinesh', facultyName: 'Dinesh Sir', row: 2, col: 4, type: 'cabin', status: 'Available' },
    { cabinId: 'SR-08', cabinNumber: 'SR-08', facultyId: 'fac_verma', facultyName: 'Dr. N. Verma', row: 2, col: 5, type: 'cabin', status: 'Available' },

    // ROW 3 (Bottom)
    { cabinId: 'ENTRY-LOUNGE', cabinNumber: 'Entry & Lounge', facultyId: null, facultyName: null, row: 3, col: 1, type: 'lounge_entry', status: 'Available' },
    { cabinId: 'SR-09', cabinNumber: 'SR-09', facultyId: 'fac_rao', facultyName: 'Prof. D. Rao', row: 3, col: 2, type: 'cabin', status: 'Available' },
    { cabinId: 'SR-10', cabinNumber: 'SR-10', facultyId: 'fac_nagma', facultyName: 'Nagma Mam', row: 3, col: 3, type: 'cabin', status: 'Unavailable' },
    { cabinId: 'DEAN-OFFICE', cabinNumber: 'Dean Office', facultyId: 'fac_kulkarni', facultyName: 'Dr. V. Kulkarni', row: 3, col: 4, type: 'dean_office', status: 'Available' },
  ]
};

/**
 * Initialize / Seed Staff Room 01 and Faculty in MongoDB
 */
export async function seedStaffRoomData() {
  try {
    const existingRoom = await StaffRoom.findOne({ staffRoomId: 'sr_e_block_01' });
    if (!existingRoom) {
      await StaffRoom.create(DEFAULT_STAFF_ROOM_LAYOUT);
      console.log('[Seed] E Block Staff Room 01 created successfully');
    }

    for (const fac of DEFAULT_FACULTY_ROSTER) {
      await Faculty.findOneAndUpdate(
        { facultyId: fac.facultyId },
        { $set: fac },
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed] Seeded ${DEFAULT_FACULTY_ROSTER.length} faculty members into database.`);
  } catch (err) {
    console.warn('[Seed] Staff room seed notice:', err.message);
  }
}

/**
 * GET /api/staff-rooms
 */
export async function getStaffRooms(req, res) {
  try {
    let rooms = await StaffRoom.find().lean();
    if (!rooms || rooms.length === 0) {
      rooms = [DEFAULT_STAFF_ROOM_LAYOUT];
    }
    res.json({ success: true, count: rooms.length, staffRooms: rooms });
  } catch (err) {
    res.json({ success: true, count: 1, staffRooms: [DEFAULT_STAFF_ROOM_LAYOUT] });
  }
}

/**
 * GET /api/staff-rooms/:id
 */
export async function getStaffRoomById(req, res) {
  try {
    const { id } = req.params;
    let room = await StaffRoom.findOne({
      $or: [{ staffRoomId: id }, { name: new RegExp(id, 'i') }]
    }).lean();

    if (!room) {
      room = DEFAULT_STAFF_ROOM_LAYOUT;
    }

    // Attach up-to-date faculty info to each cabin
    const facultyList = await Faculty.find({ staffRoomId: room.staffRoomId }).lean();
    const facultyMap = new Map();
    for (const f of facultyList) {
      facultyMap.set(f.cabinId, f);
    }

    const enrichedCabins = room.cabins.map(c => {
      const fac = facultyMap.get(c.cabinId);
      if (fac) {
        return {
          ...c,
          status: fac.currentStatus === 'Available' ? 'Available' : 'Unavailable',
          faculty: fac
        };
      }
      return c;
    });

    const availableCount = enrichedCabins.filter(c => c.type === 'cabin' && c.status === 'Available').length;
    const unavailableCount = enrichedCabins.filter(c => c.type === 'cabin' && c.status === 'Unavailable').length;

    res.json({
      success: true,
      staffRoom: {
        ...room,
        cabins: enrichedCabins,
        stats: {
          available: availableCount,
          unavailable: unavailableCount,
          total: availableCount + unavailableCount
        }
      }
    });
  } catch (err) {
    res.json({
      success: true,
      staffRoom: {
        ...DEFAULT_STAFF_ROOM_LAYOUT,
        stats: { available: 7, unavailable: 3, total: 10 }
      }
    });
  }
}

/**
 * GET /api/faculty
 */
export async function getFacultyList(req, res) {
  try {
    let faculty = await Faculty.find().lean();
    if (!faculty || faculty.length === 0) {
      faculty = DEFAULT_FACULTY_ROSTER;
    }
    res.json({ success: true, count: faculty.length, faculty });
  } catch (err) {
    res.json({ success: true, count: DEFAULT_FACULTY_ROSTER.length, faculty: DEFAULT_FACULTY_ROSTER });
  }
}

/**
 * GET /api/faculty/:id
 */
export async function getFacultyById(req, res) {
  try {
    const { id } = req.params;
    let faculty = await Faculty.findOne({
      $or: [{ facultyId: id }, { cabinId: id }, { name: new RegExp(id, 'i') }]
    }).lean();

    if (!faculty) {
      faculty = DEFAULT_FACULTY_ROSTER.find(f => f.facultyId === id || f.cabinId === id) || DEFAULT_FACULTY_ROSTER[0];
    }

    res.json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/faculty/:id/status
 * Update manual availability override (Available ↔ Unavailable)
 */
export async function updateFacultyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, currentActivity, currentLocation, nextAvailability } = req.body;

    const faculty = await Faculty.findOneAndUpdate(
      { $or: [{ facultyId: id }, { cabinId: id }] },
      {
        $set: {
          currentStatus: status,
          currentActivity: currentActivity || (status === 'Available' ? 'In Cabin' : 'Taking Lecture'),
          currentLocation: currentLocation || (status === 'Available' ? 'Staff Room 01' : 'In Class'),
          nextAvailability: nextAvailability || (status === 'Available' ? 'Available Now' : 'Check Schedule'),
          'manualStatusOverride.enabled': true,
          'manualStatusOverride.status': status,
          'manualStatusOverride.updatedAt': new Date()
        }
      },
      { new: true, upsert: true }
    );

    // Also sync the cabin status in StaffRoom collection
    await StaffRoom.updateOne(
      { 'cabins.cabinId': faculty.cabinId },
      { $set: { 'cabins.$.status': status } }
    );

    res.json({ success: true, message: 'Faculty status updated successfully', faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/faculty/:id
 * Admin update faculty details, cabin assignment, or timetable
 */
export async function updateFaculty(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const faculty = await Faculty.findOneAndUpdate(
      { $or: [{ facultyId: id }, { cabinId: id }] },
      { $set: updateData },
      { new: true }
    );

    res.json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

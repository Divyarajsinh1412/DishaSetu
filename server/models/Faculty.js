import mongoose from 'mongoose';

const LectureSlotSchema = new mongoose.Schema({
  day: { type: String, required: true }, // 'Monday', 'Tuesday', ...
  subject: { type: String, required: true },
  building: { type: String, default: 'E Block' },
  floor: { type: String, default: 'First Floor' },
  room: { type: String, required: true }, // e.g. 'EF03'
  startTime: { type: String, required: true }, // e.g. '10:00 AM'
  endTime: { type: String, required: true }, // e.g. '11:00 AM'
});

const FacultySchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  designation: { type: String, default: 'Assistant Professor' },
  department: { type: String, default: 'Computer Science & Engineering' },
  staffRoomId: { type: String, default: 'sr_e_block_01' },
  cabinId: { type: String, required: true }, // e.g. 'SR-03'
  cabinNumber: { type: String, required: true }, // e.g. 'SR-03'
  email: { type: String },
  phone: { type: String },
  avatar: { type: String },
  currentStatus: {
    type: String,
    enum: ['Available', 'Unavailable', 'In Meeting', 'On Leave'],
    default: 'Available'
  },
  currentActivity: { type: String, default: 'In Cabin' },
  currentLocation: { type: String, default: 'Staff Room 01' },
  currentClassLocation: { type: String },
  currentLectureTime: { type: String },
  currentSubject: { type: String },
  nextAvailability: { type: String, default: 'Available Now' },
  manualStatusOverride: {
    enabled: { type: Boolean, default: false },
    status: { type: String, enum: ['Available', 'Unavailable', 'In Meeting', 'On Leave'] },
    note: { type: String },
    updatedAt: { type: Date }
  },
  timetable: [LectureSlotSchema]
}, { timestamps: true });

export default mongoose.model('Faculty', FacultySchema);

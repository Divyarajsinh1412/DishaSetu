import mongoose from 'mongoose';

const CabinSlotSchema = new mongoose.Schema({
  cabinId: { type: String, required: true }, // e.g. 'SR-01'
  cabinNumber: { type: String, required: true },
  facultyId: { type: String },
  facultyName: { type: String },
  row: { type: Number, required: true }, // 1, 2, 3
  col: { type: Number, required: true }, // 1, 2, 3, 4, 5
  type: { type: String, enum: ['cabin', 'walking_area', 'dean_office', 'lounge_entry'], default: 'cabin' },
  status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' },
});

const StaffRoomSchema = new mongoose.Schema({
  staffRoomId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true }, // 'Staff Room 01'
  buildingId: { type: String, required: true }, // 'bld_e_block'
  buildingName: { type: String, default: 'E Block' },
  floorNumber: { type: Number, default: 0 },
  floorName: { type: String, default: 'Ground Floor' },
  totalCabins: { type: Number, default: 10 },
  cabins: [CabinSlotSchema],
}, { timestamps: true });

export default mongoose.model('StaffRoom', StaffRoomSchema);

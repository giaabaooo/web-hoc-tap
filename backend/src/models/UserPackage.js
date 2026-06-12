import mongoose from 'mongoose';

const userPackageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  expireAt: { type: Date, required: true }
});
export const UserPackage = mongoose.model('UserPackage', userPackageSchema);
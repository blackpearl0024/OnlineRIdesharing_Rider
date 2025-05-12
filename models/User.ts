import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  phone: string;
  role: "rider" | "driver";
  homeLocation?: string
  birthday?: string
  vehicleNumber?: string;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  role: { type: String, enum: ["rider", "driver"], required: true },
  homeLocation: String,
  birthday: String,
  vehicleNumber: String,
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

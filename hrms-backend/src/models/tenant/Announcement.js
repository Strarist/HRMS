/**
 * Announcement Model - Stored in tenant database
 * Supports company-wide and role-scoped announcements
 * created by company_admin or manager, visible to employees.
 */

const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Announcement title is required"],
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: [true, "Announcement message is required"],
    trim: true,
    maxlength: 5000
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
    index: true
  },
  // Who can see this: all / employees / managers
  targetAudience: {
    type: String,
    enum: ["all", "employees", "managers"],
    default: "all"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  createdByEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  createdByName: {
    type: String,
    trim: true
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

announcementSchema.index({ createdBy: 1, isActive: 1 });
announcementSchema.index({ targetAudience: 1, isActive: 1, createdAt: -1 });

module.exports = announcementSchema;

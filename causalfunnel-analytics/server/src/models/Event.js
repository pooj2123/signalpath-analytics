import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, trim: true, maxlength: 128, index: true },
  type: { type: String, required: true, enum: ['page_view', 'click'], index: true },
  pageUrl: { type: String, required: true, maxlength: 2048, index: true },
  timestamp: { type: Date, required: true, index: true },
  coordinates: {
    x: { type: Number, min: 0 },
    y: { type: Number, min: 0 }
  },
  viewport: {
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 }
  }
}, { timestamps: true, versionKey: false });

eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ pageUrl: 1, type: 1, timestamp: -1 });

export default mongoose.model('Event', eventSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  type: 'application' | 'interview' | 'follow_up' | 'deadline' | 'document' | 'meeting';
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  applicationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const TaskSchema = new Schema<ITask>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['application', 'interview', 'follow_up', 'deadline', 'document', 'meeting']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
TaskSchema.index({ userId: 1, isActive: 1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, type: 1 });

// Pre-save middleware to update status based on due date
TaskSchema.pre('save', function(next) {
  if (this.dueDate && this.status === 'pending') {
    const now = new Date();
    if (this.dueDate < now) {
      this.status = 'overdue';
    }
  }
  next();
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
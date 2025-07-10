import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Message interface representing internal messages between admins
 */
export interface IMessage extends Document {
  // Message content
  subject: string;
  content: string;
  messageType: 'general' | 'urgent' | 'announcement' | 'task' | 'notification';
  
  // Sender and recipients
  sender: mongoose.Types.ObjectId;
  recipients: mongoose.Types.ObjectId[];
  ccRecipients?: mongoose.Types.ObjectId[];
  
  // Message status
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  
  // Priority and categorization
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags?: string[];
  
  // Attachments and references
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  }>;
  
  // Threading support
  parentMessage?: mongoose.Types.ObjectId;
  threadId?: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  archivedAt?: Date;
  
  // Methods
  markAsRead(): Promise<void>;
  markAsArchived(): Promise<void>;
  addRecipient(recipientId: mongoose.Types.ObjectId): Promise<void>;
  removeRecipient(recipientId: mongoose.Types.ObjectId): Promise<void>;
}

const MessageSchema: Schema = new Schema<IMessage>({
  // Message content
  subject: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 200 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  messageType: { 
    type: String, 
    enum: ['general', 'urgent', 'announcement', 'task', 'notification'],
    default: 'general',
    required: true 
  },
  
  // Sender and recipients
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  recipients: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  }],
  ccRecipients: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  }],
  
  // Message status
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  
  // Priority and categorization
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true 
  },
  category: { 
    type: String, 
    trim: true 
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  
  // Attachments
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true }
  }],
  
  // Threading support
  parentMessage: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  threadId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  
  // Timestamps
  readAt: { 
    type: Date 
  },
  archivedAt: { 
    type: Date 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message preview
MessageSchema.virtual('preview').get(function() {
  return this.content.length > 100 
    ? this.content.substring(0, 100) + '...' 
    : this.content;
});

// Virtual for unread count in thread
MessageSchema.virtual('unreadCount').get(function() {
  // This would be calculated in queries
  return 0;
});

// Method to mark message as read
MessageSchema.methods.markAsRead = async function(this: any): Promise<void> {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Method to mark message as archived
MessageSchema.methods.markAsArchived = async function(this: any): Promise<void> {
  this.isArchived = true;
  this.archivedAt = new Date();
  await this.save();
};

// Method to add recipient
MessageSchema.methods.addRecipient = async function(this: any, recipientId: mongoose.Types.ObjectId): Promise<void> {
  if (!this.recipients.includes(recipientId)) {
    this.recipients.push(recipientId);
    await this.save();
  }
};

// Method to remove recipient
MessageSchema.methods.removeRecipient = async function(this: any, recipientId: mongoose.Types.ObjectId): Promise<void> {
  this.recipients = this.recipients.filter((id: any) => !id.equals(recipientId));
  await this.save();
};

// Indexes for better query performance
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipients: 1, createdAt: -1 });
MessageSchema.index({ isRead: 1, recipients: 1 });
MessageSchema.index({ isArchived: 1, recipients: 1 });
MessageSchema.index({ threadId: 1, createdAt: 1 });
MessageSchema.index({ messageType: 1, createdAt: -1 });
MessageSchema.index({ priority: 1, createdAt: -1 });
MessageSchema.index({ category: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
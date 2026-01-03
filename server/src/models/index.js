import User from './User.js';
import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Message from './Message.js';
import ContactRequest from './ContactRequest.js';
import Drug from './Drug.js';

// User <-> Drug (One to Many)
User.hasMany(Drug, {
  foreignKey: 'userId',
  as: 'drugs',
  onDelete: 'CASCADE',
});

Drug.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
});

// User <-> Conversation (Many to Many through ConversationParticipant)
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  foreignKey: 'userId',
  otherKey: 'conversationId',
  as: 'conversations',
});

Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  foreignKey: 'conversationId',
  otherKey: 'userId',
  as: 'participants',
});

// Direct associations for easier querying
ConversationParticipant.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

ConversationParticipant.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

User.hasMany(ConversationParticipant, {
  foreignKey: 'userId',
  as: 'participations',
});

Conversation.hasMany(ConversationParticipant, {
  foreignKey: 'conversationId',
  as: 'participantsList',
});

// User -> Conversation (created by)
Conversation.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

User.hasMany(Conversation, {
  foreignKey: 'createdBy',
  as: 'createdConversations',
});

// Message -> User
Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'sender',
});

User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages',
});

// Message -> Conversation
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
});

// Message -> Message (reply to)
Message.belongsTo(Message, {
  foreignKey: 'replyTo',
  as: 'replyToMessage',
});

Message.hasMany(Message, {
  foreignKey: 'replyTo',
  as: 'replies',
});

// ContactRequest -> User (sender)
ContactRequest.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender',
});

// ContactRequest -> User (receiver)
ContactRequest.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver',
});

// User -> ContactRequest (sent)
User.hasMany(ContactRequest, {
  foreignKey: 'sender_id',
  as: 'sentContactRequests',
});

// User -> ContactRequest (received)
User.hasMany(ContactRequest, {
  foreignKey: 'receiver_id',
  as: 'receivedContactRequests',
});

export { User, Conversation, ConversationParticipant, Message, ContactRequest, Drug };

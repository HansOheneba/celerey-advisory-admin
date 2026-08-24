export type MessageAuthor = "advisor" | "client" | "note";

export type ConversationMessage = {
  id: string;
  author: MessageAuthor;
  body: string;
  createdAt: string;
};

export type ConversationThread = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  advisorId: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: ConversationMessage | null;
  messages: ConversationMessage[];
};

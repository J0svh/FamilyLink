export interface GetMessagesInputDTO {
  circleId: string;
  userId: string;
  limit?: number;
  before?: string; // cursor: messageId for pagination
}

export interface MessageDTO {
  messageId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface GetMessagesOutputDTO {
  circleId: string;
  messages: MessageDTO[];
  hasMore: boolean;
}

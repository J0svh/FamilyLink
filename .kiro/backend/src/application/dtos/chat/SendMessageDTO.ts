export interface SendMessageInputDTO {
  circleId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'emoji';
  attachmentUrl?: string;
}

export interface SendMessageOutputDTO {
  messageId: string;
  circleId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: string;
  attachmentUrl?: string;
  createdAt: Date;
}

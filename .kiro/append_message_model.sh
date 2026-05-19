#!/bin/bash
cat >> /home/jose/FamilyLink/backend/prisma/schema.prisma << 'EOF'

model Message {
  id            String   @id @default(uuid()) @db.Uuid
  circleId      String   @map("circle_id") @db.Uuid
  senderId      String   @map("sender_id") @db.Uuid
  content       String   @db.Text
  type          String   @default("text") @db.VarChar(20) // 'text' | 'image' | 'emoji'
  attachmentUrl String?  @map("attachment_url") @db.VarChar(500)
  createdAt     DateTime @default(now()) @map("created_at")

  circle Circle @relation(fields: [circleId], references: [id], onDelete: Cascade)
  sender User   @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)

  @@index([circleId, createdAt(sort: Desc)])
  @@map("messages")
}
EOF

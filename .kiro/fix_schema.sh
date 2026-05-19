#!/bin/bash
sed -i '28s/.*/  messagesSent     Message[]      @relation("MessageSender")/' /home/jose/FamilyLink/backend/prisma/schema.prisma

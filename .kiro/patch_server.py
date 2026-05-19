with open('/home/jose/FamilyLink/backend/src/infrastructure/http/server.ts', 'r') as f:
    content = f.read()

old_call = """app.use('/api/v1/circles', authMiddleware, createCircleRoutes(
  container.createCircleUseCase,
  container.inviteMemberUseCase,
  container.acceptInvitationUseCase,
  container.dissolveCircleUseCase,
  container.removeMemberUseCase,
  container.updateMemberRoleUseCase,
  container.updateDailyLimitsUseCase,
));"""

new_call = """app.use('/api/v1/circles', authMiddleware, createCircleRoutes(
  container.createCircleUseCase,
  container.inviteMemberUseCase,
  container.acceptInvitationUseCase,
  container.dissolveCircleUseCase,
  container.removeMemberUseCase,
  container.updateMemberRoleUseCase,
  container.updateDailyLimitsUseCase,
  container.getUserCirclesUseCase,
));"""

content = content.replace(old_call, new_call)

with open('/home/jose/FamilyLink/backend/src/infrastructure/http/server.ts', 'w') as f:
    f.write(content)

print('Done')

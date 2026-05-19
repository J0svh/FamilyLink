import re

with open('/home/jose/FamilyLink/backend/src/infrastructure/container.ts', 'r') as f:
    content = f.read()

# 1. Add import after UpdateDailyLimitsUseCase import
old_import = "import { UpdateDailyLimitsUseCase } from '../application/use-cases/circle/UpdateDailyLimitsUseCase';"
new_import = old_import + "\nimport { GetUserCirclesUseCase } from '../application/use-cases/circle/GetUserCirclesUseCase';"
content = content.replace(old_import, new_import)

# 2. Add to Container interface
old_interface = '  updateDailyLimitsUseCase: UpdateDailyLimitsUseCase;'
new_interface = old_interface + '\n  getUserCirclesUseCase: GetUserCirclesUseCase;'
content = content.replace(old_interface, new_interface)

# 3. Add instantiation after updateDailyLimitsUseCase
old_inst = '  const updateDailyLimitsUseCase = new UpdateDailyLimitsUseCase(circleRepo, { save: async () => {}, findByUserAndCircle: async () => null });'
new_inst = old_inst + '\n  const getUserCirclesUseCase = new GetUserCirclesUseCase(circleRepo);'
content = content.replace(old_inst, new_inst)

# 4. Add to return object
old_return = 'removeMemberUseCase, updateMemberRoleUseCase, updateDailyLimitsUseCase,'
new_return = 'removeMemberUseCase, updateMemberRoleUseCase, updateDailyLimitsUseCase, getUserCirclesUseCase,'
content = content.replace(old_return, new_return)

with open('/home/jose/FamilyLink/backend/src/infrastructure/container.ts', 'w') as f:
    f.write(content)

print('Done')

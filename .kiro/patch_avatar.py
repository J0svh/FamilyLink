with open('/home/jose/FamilyLink/frontend/src/components/Avatar2D.tsx', 'r') as f:
    content = f.read()

old_type = "export type AvatarState = 'idle' | 'walking' | 'sleeping' | 'working';"
new_type = "export type AvatarState = 'idle' | 'walking' | 'sleeping' | 'working' | 'gym' | 'gaming' | 'eating' | 'studying';"
content = content.replace(old_type, new_type)

old_emoji = """const STATE_EMOJI: Record<AvatarState, string> = {
  idle: '\U0001f9cd',
  walking: '\U0001f6b6',
  sleeping: '\U0001f634',
  working: '\U0001f4bc',
};"""

new_emoji = """const STATE_EMOJI: Record<AvatarState, string> = {
  idle: '\U0001f9cd',
  walking: '\U0001f6b6',
  sleeping: '\U0001f634',
  working: '\U0001f4bc',
  gym: '\U0001f3cb\ufe0f',
  gaming: '\U0001f3ae',
  eating: '\U0001f37d\ufe0f',
  studying: '\U0001f4da',
};"""
content = content.replace(old_emoji, new_emoji)

old_label = """const STATE_LABEL: Record<AvatarState, string> = {
  idle: '',
  walking: 'En movimiento',
  sleeping: 'Descansando',
  working: 'Ocupado',
};"""

new_label = """const STATE_LABEL: Record<AvatarState, string> = {
  idle: '',
  walking: 'En movimiento',
  sleeping: 'Descansando',
  working: 'Ocupado',
  gym: 'En el gym',
  gaming: 'Jugando',
  eating: 'Comiendo',
  studying: 'Estudiando',
};"""
content = content.replace(old_label, new_label)

with open('/home/jose/FamilyLink/frontend/src/components/Avatar2D.tsx', 'w') as f:
    f.write(content)

print('Done')

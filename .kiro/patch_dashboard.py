with open('/home/jose/FamilyLink/frontend/src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

old_func = """  const loadCircles = async () => {
    try {
      // TODO: Add GET /circles endpoint to backend
      // For now, circles are loaded from store
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };"""

new_func = """  const loadCircles = async () => {
    try {
      const { data } = await api.get('/circles');
      setCircles(data);
    } catch (err) {
      console.error('Failed to load circles', err);
    } finally {
      setLoading(false);
    }
  };"""

content = content.replace(old_func, new_func)

with open('/home/jose/FamilyLink/frontend/src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)

print('Done')

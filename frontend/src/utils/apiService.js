const API_BASE_URL = 'http://localhost:8000';

export const optimizeSchedule = async (caregivers) => {
  if (!caregivers || !caregivers.length) {
    throw new Error('No caregivers data to optimize');
  }

  const scheduleJson = {
    caretakers: caregivers.map(cg => ({
      name: cg.name,
      schedule: cg.schedule
    }))
  };

  const query = encodeURIComponent(JSON.stringify(scheduleJson));
  
  const response = await fetch(`${API_BASE_URL}/optimize-schedule/?data=${query}`);
  if (!response.ok) throw new Error('API error');
  
  const result = await response.json();
  if (!result || !Array.isArray(result.caretakers)) {
    throw new Error('Malformed backend result');
  }

  return result.caretakers;
};

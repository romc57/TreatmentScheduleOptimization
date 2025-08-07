// Utility function to transform caretaker schedules to patient-centric schedules
export function transformCaretakerToPatientSchedules(caretakers) {
  if (!caretakers || !Array.isArray(caretakers)) {
    return [];
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const patientSchedules = new Map();

  // First pass: collect all unique patients and initialize their schedules
  caretakers.forEach(caretaker => {
    if (!caretaker?.schedule) return;

    days.forEach(day => {
      if (!caretaker.schedule[day]) return;
      
      Object.entries(caretaker.schedule[day]).forEach(([hour, patient]) => {
        if (!patient) return;

        if (!patientSchedules.has(patient)) {
          patientSchedules.set(patient, {
            name: patient,
            schedule: days.reduce((acc, day) => {
              acc[day] = {};
              return acc;
            }, {})
          });
        }
      });
    });
  });

  // Second pass: fill in caretaker assignments for each patient's schedule
  caretakers.forEach(caretaker => {
    if (!caretaker?.schedule) return;

    days.forEach(day => {
      if (!caretaker.schedule[day]) return;

      Object.entries(caretaker.schedule[day]).forEach(([hour, patient]) => {
        if (!patient || !patientSchedules.has(patient)) return;

        const patientSchedule = patientSchedules.get(patient);
        patientSchedule.schedule[day][hour] = caretaker.name;
      });
    });
  });

  // Convert Map to array and sort by patient name
  return Array.from(patientSchedules.values())
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Utility function to validate schedule structure
export function validateSchedule(schedule, type = 'patient') {
  if (!Array.isArray(schedule)) return false;
  
  return schedule.every(entry => 
    entry && 
    entry.name && 
    typeof entry.schedule === 'object' &&
    Object.keys(entry.schedule).length > 0
  );
}

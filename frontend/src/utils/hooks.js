import { useState, useEffect } from 'react';
import { transformCaretakerToPatientSchedules } from './scheduleTransformer';

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initialValue;
      return JSON.parse(saved);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

export const useScheduleData = () => {
  const [caregivers, setCaregivers] = useLocalStorage('caregivers', null);
  const [patients, setPatients] = useState(null);

  // Update patient schedules when caregivers change
  useEffect(() => {
    if (caregivers) {
      const patientSchedules = transformCaretakerToPatientSchedules(caregivers);
      console.log('Generated patient schedules:', patientSchedules);
      setPatients(patientSchedules);
    }
  }, [caregivers]);

  return {
    caregivers,
    setCaregivers,
    patients,
    setPatients,
  };
};

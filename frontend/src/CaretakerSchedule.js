import React, { useEffect, useState } from 'react';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours = Array.from({ length: 12 }, (_, i) => `${i + 7}:00`);

function defaultFaker() {
  // Generate random fake data for 3 caregivers
  const names = ['Alice', 'Bob', 'Carol'];
  const hourIdx = Array.from({ length: 12 }, (_, i) => i);
  return names.map(name => ({
    name,
    schedule: Object.fromEntries(days.map(day => [day, hourIdx.filter(() => Math.random() < 0.15)])),
  }));
}

function CaretakerSchedule({ selectedCaregiver, caregivers, generator, onRequestData }) {
  // Use generator if provided, otherwise use caregivers prop or default faker
  const [internalCaregivers, setInternalCaregivers] = useState([]);

  useEffect(() => {
    let data = caregivers;
    if (generator) {
      data = generator();
    }
    if (!data || !data.length) {
      data = defaultFaker();
    }
    setInternalCaregivers(data);
  }, [caregivers, generator]);

  const caregiver = internalCaregivers.find(c => c.name === selectedCaregiver) || internalCaregivers[0] || { schedule: {} };

  useEffect(() => {
    if (!internalCaregivers.length && typeof onRequestData === 'function') {
      onRequestData();
    }
  }, [internalCaregivers, onRequestData]);

  return (
    <table border="1">
      <thead>
        <tr>
          <th>Hour/Day</th>
          {days.map(day => <th key={day}>{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour, i) => (
          <tr key={hour}>
            <td>{hour}</td>
            {days.map(day => (
              <td key={day} className={caregiver.schedule[day]?.includes(i) ? 'caretaker-cell' : ''}>
                {caregiver.schedule[day]?.includes(i) ? '✔' : ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const caregiverNames = [
  'Alice', 'Bob', 'Carol'
];
export default CaretakerSchedule;

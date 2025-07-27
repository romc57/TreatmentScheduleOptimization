import React from 'react';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours = Array.from({ length: 12 }, (_, i) => `${i + 7}:00`);

function PatientSchedule({ selectedPatient, patients }) {
  // Use passed patients or default
  const defaultPatients = [
    {
      name: 'David',
      schedule: {
        Tuesday: [3, 4, 5],
        Thursday: [8, 9, 10],
        Sunday: [1, 2, 3],
      },
    },
    {
      name: 'Emma',
      schedule: {
        Monday: [2, 3, 4],
        Wednesday: [6, 7, 8],
        Saturday: [9, 10, 11],
      },
    },
    {
      name: 'Frank',
      schedule: {
        Friday: [0, 1, 2],
        Thursday: [13, 14, 15],
        Sunday: [7, 8, 9],
      },
    },
  ];
  const patientList = patients || defaultPatients;
  const patient = patientList.find(p => p.name === selectedPatient) || patientList[0];
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
              <td key={day} className={patient.schedule[day]?.includes(i) ? 'patient-cell' : ''}>
                {patient.schedule[day]?.includes(i) ? '●' : ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const patientNames = [
  'David', 'Emma', 'Frank'
];
export default PatientSchedule;

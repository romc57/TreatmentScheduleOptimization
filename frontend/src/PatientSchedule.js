import React from 'react';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8-17

function PatientSchedule({ selectedPatient, patients }) {
  const patientList = patients || [];
  const patient = patientList.find(p => p.name === selectedPatient) || patientList[0];
  return (
    <table border="1" style={{ background: 'var(--table-bg, #fff)' }}>
      <thead style={{ background: 'var(--thead-bg, #f5f5f5)' }}>
        <tr>
          <th>Hour/Day</th>
          {days.map(day => <th key={day}>{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour) => (
          <tr key={hour}>
            <td style={{ background: 'var(--thead-bg, #f5f5f5)' }}>{hour}:00</td>
            {days.map(day => {
              const caretaker = patient?.schedule?.[day]?.[hour];
              return (
                <td
                  key={day}
                  className={caretaker ? 'patient-cell' : ''}
                  style={{ 
                    background: caretaker ? 'var(--cell-bg, #ffe0e0)' : 'inherit',
                    padding: '0.5rem'
                  }}
                >
                  {caretaker || ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const patientNames = [];
export default PatientSchedule;

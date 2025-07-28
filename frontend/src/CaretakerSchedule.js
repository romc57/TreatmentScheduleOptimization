import React from 'react';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8-17

function CaretakerSchedule({ selectedCaregiver, caregivers }) {
  const caregiverList = caregivers || [];
  const caregiver = caregiverList.find(c => c.name === selectedCaregiver) || caregiverList[0];

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
              let patient = '';
              if (caregiver && caregiver.schedule && caregiver.schedule[day] && typeof caregiver.schedule[day] === 'object') {
                patient = caregiver.schedule[day][hour] || '';
              }
              return (
                <td
                  key={day}
                  className={patient ? 'caretaker-cell' : ''}
                  style={{ background: patient ? 'var(--cell-bg, #e0f7fa)' : 'inherit', color: patient ? '#000' : 'inherit' }}
                >
                  {patient}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const caregiverNames = [];
export default CaretakerSchedule;

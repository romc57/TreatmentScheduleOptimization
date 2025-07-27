import './App.css';
import CaretakerSchedule, { caregiverNames } from './CaretakerSchedule';
import PatientSchedule, { patientNames } from './PatientSchedule';
import React, { useState } from 'react';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomizeSchedules() {
  // Randomize fake data for caregivers
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 12 }, (_, i) => i); // 0-11 for 7:00-18:00
  const caregivers = [
    {
      name: 'Alice',
      schedule: Object.fromEntries(days.map(day => [day, hours.filter(() => Math.random() < 0.15)])),
    },
    {
      name: 'Bob',
      schedule: Object.fromEntries(days.map(day => [day, hours.filter(() => Math.random() < 0.15)])),
    },
    {
      name: 'Carol',
      schedule: Object.fromEntries(days.map(day => [day, hours.filter(() => Math.random() < 0.15)])),
    },
  ];
  // Randomize fake data for patients
  const patients = [
    {
      name: 'David',
      schedule: Object.fromEntries(days.map(day => [day, hours.filter(() => Math.random() < 0.15)])),
    },
    {
      name: 'Emma',
      schedule: Object.fromEntries(days.map(day => [day, hours.filter(() => Math.random() < 0.15)])),
    },
    {
      name: 'Frank',
      schedule: Object.fromEntries(days.map(day => [day, hours.filter(() => Math.random() < 0.15)])),
    },
  ];
  return { caregivers, patients };
}

function App() {
  const [activeTab, setActiveTab] = useState('caretaker');
  const [selectedCaregiver, setSelectedCaregiver] = useState(caregiverNames[0]);
  const [selectedPatient, setSelectedPatient] = useState(patientNames[0]);
  const [lightMode, setLightMode] = useState(false);
  const [fakerData, setFakerData] = useState(null);

  const handleOptimize = () => {
    setFakerData(randomizeSchedules());
  };

  // Use fakerData if present, otherwise use default
  const caregivers = fakerData ? fakerData.caregivers : undefined;
  const patients = fakerData ? fakerData.patients : undefined;

  return (
    <div className={lightMode ? 'App light-mode' : 'App'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          className="optimize-btn"
          onClick={handleOptimize}
          style={{
            background: lightMode ? '#009688' : '#b71c1c',
            color: '#fff',
            border: '2px solid',
            borderColor: lightMode ? '#009688' : '#b71c1c',
            marginLeft: '1rem',
            cursor: 'pointer',
          }}
        >
          Optimize
        </button>
        <button
          onClick={() => setLightMode(l => !l)}
          style={{
            background: lightMode ? '#222' : '#fff',
            color: lightMode ? '#fff' : '#b71c1c',
            border: '2px solid #b71c1c',
            borderRadius: '6px',
            marginRight: '1rem',
            padding: '0.4rem 1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {lightMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
      <h1>Day-Hour Schedules</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('caretaker')}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            background: activeTab === 'caretaker' ? (lightMode ? '#009688' : '#b71c1c') : (lightMode ? '#e3e3e3' : '#e3e3e3'),
            color: activeTab === 'caretaker' ? '#fff' : (lightMode ? '#009688' : '#222'),
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Caretaker Schedule
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'patient' ? (lightMode ? '#009688' : '#b71c1c') : (lightMode ? '#e3e3e3' : '#e3e3e3'),
            color: activeTab === 'patient' ? '#fff' : (lightMode ? '#009688' : '#222'),
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Patient Schedule
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        {activeTab === 'caretaker' && (
          <select value={selectedCaregiver} onChange={e => setSelectedCaregiver(e.target.value)}>
            {(caregivers || caregiverNames).map(nameOrObj => {
              const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.name;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        )}
        {activeTab === 'patient' && (
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            {(patients || patientNames).map(nameOrObj => {
              const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.name;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'caretaker' && (
          <div>
            <CaretakerSchedule selectedCaregiver={selectedCaregiver} caregivers={caregivers} />
          </div>
        )}
        {activeTab === 'patient' && (
          <div>
            <PatientSchedule selectedPatient={selectedPatient} patients={patients} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

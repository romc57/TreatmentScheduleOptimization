import './App.css';
import CaretakerSchedule, { caregiverNames } from './CaretakerSchedule';
import PatientSchedule, { patientNames } from './PatientSchedule';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function App() {
  // Persist activeTab in localStorage
  const getInitialTab = () => {
    const saved = localStorage.getItem('activeTab');
    return saved === 'patient' ? 'patient' : 'caretaker';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedCaregiver, setSelectedCaregiver] = useState(caregiverNames[0]);
  const [selectedPatient, setSelectedPatient] = useState(patientNames[0]);
  const [lightMode, setLightMode] = useState(false);
  const [caregivers, setCaregivers] = useState();
  const [patients, setPatients] = useState();

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Load caregivers from localStorage on mount
  useEffect(() => {
    const savedCaregivers = localStorage.getItem('caregivers');
    if (savedCaregivers) setCaregivers(JSON.parse(savedCaregivers));
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) setPatients(JSON.parse(savedPatients));
  }, []);

  // Save caregivers and patients to localStorage when changed
  useEffect(() => {
    if (caregivers) localStorage.setItem('caregivers', JSON.stringify(caregivers));
    if (patients) localStorage.setItem('patients', JSON.stringify(patients));
  }, [caregivers, patients]);

  // Import schedule handler (Excel in-browser, each sheet = caretaker, rows = hours, cols = days, cells = patient names)
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      // Each sheet is a caretaker, rows = hours, cols = days, cells = patient names
      const caregivers = workbook.SheetNames.map(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!rows.length) return null;
        const days = rows[0].slice(1); // skip first col (hour label)
        const schedule = {};
        days.forEach(day => { schedule[day] = {}; });
        for (let r = 1; r < rows.length; r++) {
          const hour = rows[r][0];
          for (let c = 1; c < rows[r].length; c++) {
            const patient = rows[r][c];
            if (patient !== undefined && patient !== null && patient !== "") {
              const day = days[c - 1];
              schedule[day][hour] = patient;
            }
          }
        }
        return { name: sheetName, schedule };
      }).filter(Boolean);
      setCaregivers(caregivers);
      setPatients(); // Clear patients table
      localStorage.setItem('caregivers', JSON.stringify(caregivers));
      localStorage.removeItem('patients');
    };
    reader.readAsArrayBuffer(file);
  };

  // Converts caregivers state to backend JSON format
  function getScheduleJsonFromUI(caregivers) {
    if (!caregivers) return { caretakers: [] };
    // Expected backend format: { caretakers: [ { name, schedule: { day: { hour: patient } } } ] }
    return {
      caretakers: caregivers.map(cg => ({
        name: cg.name,
        schedule: cg.schedule
      }))
    };
  }

  // Optimize schedule by calling backend and updating UI
  async function handleOptimize() {
    if (!caregivers || !caregivers.length) return;
    // Convert caregivers state to backend JSON format
    const scheduleJson = getScheduleJsonFromUI(caregivers);
    // Log the JSON before sending to backend
    console.log('Sending schedule JSON to backend:', scheduleJson);
    // Encode JSON as a query parameter for GET request
    const query = encodeURIComponent(JSON.stringify(scheduleJson));
    try {
      const response = await fetch(`http://localhost:8000/optimize-schedule/?data=${query}`);
      if (!response.ok) throw new Error('API error');
      const result = await response.json();
      // Map optimized caretakers to expected format
      const mappedCaregivers = result.caretakers.map(cg => ({
        name: cg.name,
        schedule: cg.schedule
      }));
      setCaregivers(mappedCaregivers);
      localStorage.setItem('caregivers', JSON.stringify(mappedCaregivers));
    } catch (err) {
      alert('Failed to optimize schedule: ' + err.message);
    }
  }

  return (
    <div className={lightMode ? 'App light-mode' : 'App'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          className="optimize-btn"
          style={{
            background: lightMode ? '#009688' : '#b71c1c',
            color: '#fff',
            border: '2px solid',
            borderColor: lightMode ? '#009688' : '#b71c1c',
            marginLeft: '1rem',
            cursor: 'pointer',
          }}
          onClick={handleOptimize}
          disabled={!caregivers || !caregivers.length}
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
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <label htmlFor="import-schedule" style={{
          background: lightMode ? '#009688' : '#b71c1c',
          color: '#fff',
          border: '2px solid',
          borderColor: lightMode ? '#009688' : '#b71c1c',
          marginLeft: '1rem',
          cursor: 'pointer',
          padding: '0.5rem 1.2rem',
          borderRadius: '6px',
          fontWeight: 600
        }}>
          Import Schedule
          <input
            id="import-schedule"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </label>
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

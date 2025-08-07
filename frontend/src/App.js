import React, { useState, useEffect } from 'react';
import './App.css';
import CaretakerSchedule, { caregiverNames } from './CaretakerSchedule';
import PatientSchedule, { patientNames } from './PatientSchedule';
import { useLocalStorage } from './utils/hooks';
import { buttonStyle, actionButtonStyle, themeButtonStyle } from './utils/styles';
import { processExcelFile } from './utils/excelService';
import { optimizeSchedule } from './utils/apiService';
import { transformCaretakerToPatientSchedules, validateSchedule } from './utils/scheduleTransformer';

function App() {
  // Tabs and theme state
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'caretaker');
  const [lightMode, setLightMode] = useState(false);
  
  // Schedule data state
  const [caregivers, setCaregivers] = useLocalStorage('caregivers', null);
  const [patients, setPatients] = useState(null);

  // Selection state
  const [selectedCaregiver, setSelectedCaregiver] = useState(caregiverNames[0]);
  const [selectedPatient, setSelectedPatient] = useState(patientNames[0]);

  // Update patient schedules when caregivers change
  useEffect(() => {
    if (caregivers) {
      const patientSchedules = transformCaretakerToPatientSchedules(caregivers);
      console.log('Generated patient schedules:', patientSchedules);
      setPatients(patientSchedules);
    }
  }, [caregivers]);

  // Import handler
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const caregivers = await processExcelFile(file);
      setCaregivers(caregivers);
      
      const patientSchedules = transformCaretakerToPatientSchedules(caregivers);
      if (!validateSchedule(patientSchedules, 'patient')) {
        throw new Error('Failed to generate valid patient schedules');
      }
      
      setPatients(patientSchedules);
    } catch (err) {
      alert(err.message);
    }
  };

  // Optimize handler
  const handleOptimize = async () => {
    try {
      const optimizedCaregivers = await optimizeSchedule(caregivers);
      setCaregivers(optimizedCaregivers);
    } catch (err) {
      alert('Failed to optimize schedule: ' + err.message);
    }
  };

  return (
    <div className={lightMode ? 'App light-mode' : 'App'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        {activeTab === 'caretaker' && (
          <button
            className="optimize-btn"
            style={actionButtonStyle(lightMode)}
            onClick={handleOptimize}
            disabled={!caregivers || !caregivers.length}
          >
            Optimize
          </button>
        )}
        <button
          onClick={() => setLightMode(l => !l)}
          style={themeButtonStyle(lightMode)}
        >
          {lightMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      <h1>Day-Hour Schedules</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('caretaker')}
          style={{ ...buttonStyle(activeTab === 'caretaker', lightMode), marginRight: '1rem' }}
        >
          Caretaker Schedule
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          style={buttonStyle(activeTab === 'patient', lightMode)}
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

      {activeTab === 'caretaker' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <label htmlFor="import-schedule" style={actionButtonStyle(lightMode)}>
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
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'caretaker' && (
          <div>
            <CaretakerSchedule selectedCaregiver={selectedCaregiver} caregivers={caregivers} />
          </div>
        )}
        {activeTab === 'patient' && (
          <div>
            {patients && patients.length > 0 ? (
              <PatientSchedule selectedPatient={selectedPatient} patients={patients} />
            ) : (
              <div>No patient schedules available. Please import a caregiver schedule first.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

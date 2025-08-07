# Treatment Schedule Optimization

A web application for optimizing and managing treatment schedules between caretakers and patients. This project was developed with the assistance of Large Language Models (LLMs).

## 🌟 Features

- **Dual View System**
  - Caretaker-centric schedule view
  - Patient-centric schedule view
  - Easy switching between views
  
- **Schedule Management**
  - Import schedules from Excel files
  - Schedule optimization with backend algorithm
  - Automatic conversion between caretaker and patient views
  - Real-time updates and validation

- **User Interface**
  - Light/Dark mode support
  - Interactive schedule tables
  - Responsive design
  - User-friendly controls

## 🏗️ Project Structure

```
TreatmentScheduleOptimization/
├── frontend/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── apiService.js       # Backend API integration
│   │   │   ├── excelService.js     # Excel file processing
│   │   │   ├── hooks.js           # Custom React hooks
│   │   │   ├── scheduleTransformer.js # Schedule data transformation
│   │   │   └── styles.js          # Shared styles
│   │   ├── App.js                 # Main application component
│   │   ├── CaretakerSchedule.js   # Caretaker view component
│   │   ├── PatientSchedule.js     # Patient view component
│   │   └── App.css                # Application styles
├── optimized_scheduler.py         # Backend optimization logic
└── scheduler_faker.py            # Test data generation
```

## 🚀 Getting Started

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the backend server:
   ```bash
   python optimized_scheduler.py
   ```

## 💡 Usage

1. **Import Schedule**
   - Click "Import Schedule" in the Caretaker view
   - Select an Excel file with schedule data
   - Each sheet should represent a caretaker's schedule

2. **View Schedules**
   - Switch between Caretaker and Patient views using the tabs
   - Select specific caretakers or patients from the dropdown
   - View their schedules in the interactive table

3. **Optimize Schedule**
   - Click "Optimize" in the Caretaker view
   - The backend will process and return an optimized schedule
   - Both views will update automatically

## 🛠️ Technical Implementation

- **Frontend**: React.js with modular components and custom hooks
- **Backend**: Python with optimization algorithms
- **Data Flow**:
  - Excel → JSON → Caretaker Schedule → Patient Schedule
  - Bidirectional synchronization between views
  - Local storage for persistence

## 🤖 AI Assistance

This project was developed with the assistance of Large Language Models (LLMs), which helped with:
- Code architecture and modularization
- Implementation of data transformation logic
- UI/UX design decisions
- Bug fixing and optimization
- Documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React.js
- Optimization powered by Python
- Excel processing with XLSX.js
- Developed with LLM assistance
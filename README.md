# Treatment Schedule Optimization

A web application for optimizing and managing treatment schedules between car## 📊 Data Formats & Test Data

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
├── backend/
│   ├── .venv/                     # Python virtual environment
│   ├── api
│   ├── optimized_scheduler.py     # FastAPI server & optimization logic
│   ├── scheduler_faker.py         # Test data generation
│   └── requirements.txt           # Python dependencies
└── README.md                      # Project documentation
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
1. Make sure Python 3.8+ is installed
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create and activate a virtual environment:
   ```bash
   # Create virtual environment
   python -m venv .venv

   # Activate on Linux/Mac
   source .venv/bin/activate
   
   # Activate on Windows
   .\.venv\Scripts\activate
   ```
4. Install required Python packages:
   ```bash
   pip install fastapi uvicorn numpy ortools
   # Or install from requirements.txt
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```bash
   cd backend
   uvicorn app --reload --host 0.0.0.0 --port 8000
   ```

Note: The backend server must be running on port 8000 for the frontend to connect properly.

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

## � Data Formats & Examples

### Schedule Formats
Example files showing the correct structure for both Excel input and JSON data formats can be found in the `examples/` directory:
- `caretaker_schedule_oop.xlsx` - Template for Excel import
- `input_data.json` - Caretaker schedule format


### Excel Schedule Format
The input Excel file should follow this format:
- Each sheet represents a caretaker
- Sheet name format: "Caretaker Name (role)" e.g., "John Smith (nurse)"
- First row: Days of the week
- First column: Hours (8-17)
- Cells: Patient names

### Generate Test Data
To create test data for development or testing:
```bash
python scheduler_faker.py --output schedule.xlsx
```

This will generate a valid schedule with random caretakers and patients that you can use to test the application.

## �🛠️ Technical Implementation

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
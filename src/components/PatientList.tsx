import React from 'react';
import { User, MapPin, Calendar, Stethoscope, ChevronRight, AlertCircle } from 'lucide-react';
import { Patient } from '../types';
import { useApp } from '../context/AppContext';

interface PatientListProps {
  onPatientSelect?: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
  const { patients, alerts, selectedPatientId, selectPatient } = useApp();
  
  const getPatientAlertCount = (patientId: string) => {
    return alerts.filter(a => a.patientId === patientId && a.status === 'pending').length;
  };

  const getPatientCriticalAlert = (patientId: string) => {
    return alerts.find(a => 
      a.patientId === patientId && 
      a.status === 'pending' && 
      (a.priority === 'critical' || a.priority === 'high')
    );
  };

  const handlePatientClick = (patient: Patient) => {
    selectPatient(patient.id);
    onPatientSelect?.(patient);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">病患列表</h2>
        <p className="text-sm text-gray-500 mt-1">共 {patients.length} 位病患</p>
      </div>

      <div className="divide-y divide-gray-100">
        {patients.map(patient => {
          const alertCount = getPatientAlertCount(patient.id);
          const criticalAlert = getPatientCriticalAlert(patient.id);
          const isSelected = selectedPatientId === patient.id;

          return (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className={`
                p-4 cursor-pointer transition-colors
                ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                ${criticalAlert ? 'border-l-4 border-l-red-500' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg
                    ${patient.gender === '男' 
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                      : 'bg-gradient-to-br from-pink-400 to-pink-600'
                    }
                  `}>
                    {patient.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      {alertCount > 0 && (
                        <span className="flex items-center space-x-1 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          <span>{alertCount}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{patient.age} 歲 · {patient.gender}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{patient.roomNumber} 房 {patient.bedNumber} 床</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1 text-sm text-gray-400">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{patient.diagnosis}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {criticalAlert && (
                    <div className="relative">
                      <div className="w-3 h-3 bg-red-500 rounded-full pulse-dot"></div>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Critical Alert Preview */}
              {criticalAlert && (
                <div className="mt-3 ml-16 bg-red-50 rounded-lg p-2 border border-red-100">
                  <p className="text-xs font-medium text-red-700">{criticalAlert.title}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientList;

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Patient, Measurement, AIAlert, FollowUpTask } from '../types';
import { mockPatients, mockMeasurements, mockAlerts, mockTasks } from '../data/mockData';

interface AppState {
  patients: Patient[];
  measurements: Measurement[];
  alerts: AIAlert[];
  tasks: FollowUpTask[];
  selectedPatientId: string | null;
}

interface AppContextType extends AppState {
  selectPatient: (patientId: string | null) => void;
  confirmAlert: (alertId: string, nurseName: string) => void;
  dismissAlert: (alertId: string) => void;
  convertAlertToTask: (alertId: string, taskData: Partial<FollowUpTask>) => void;
  updateTaskStatus: (taskId: string, status: FollowUpTask['status'], notes?: string) => void;
  addMeasurement: (measurement: Omit<Measurement, 'id'>) => void;
  addAlert: (alert: AIAlert) => void;
  getPatientById: (patientId: string) => Patient | undefined;
  getPatientMeasurements: (patientId: string) => Measurement[];
  getPatientAlerts: (patientId: string) => AIAlert[];
  getPatientTasks: (patientId: string) => FollowUpTask[];
  getPendingAlertsCount: () => number;
  // 新數據監聽
  onNewMeasurement: (callback: (measurement: Measurement) => void) => () => void;
  measurementVersion: number; // 用於觸發重新分析
  // 新警示類型（用於動畫提示）
  newAlertType: string | null;
  clearNewAlertType: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    patients: mockPatients,
    measurements: mockMeasurements,
    alerts: mockAlerts,
    tasks: mockTasks,
    selectedPatientId: null,
  });
  
  // 新數據監聽器
  const measurementListeners = useRef<Set<(measurement: Measurement) => void>>(new Set());
  const [measurementVersion, setMeasurementVersion] = useState(0);
  
  // 新警示類型追蹤（用於動畫提示）
  const [newAlertType, setNewAlertType] = useState<string | null>(null);

  const selectPatient = useCallback((patientId: string | null) => {
    setState(prev => ({ ...prev, selectedPatientId: patientId }));
  }, []);

  const confirmAlert = useCallback((alertId: string, nurseName: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'confirmed' as const,
              confirmedAt: new Date().toISOString(),
              confirmedBy: nurseName,
            }
          : alert
      ),
    }));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'dismissed' as const } : alert
      ),
    }));
  }, []);

  const convertAlertToTask = useCallback((alertId: string, taskData: Partial<FollowUpTask>) => {
    setState(prev => {
      const alert = prev.alerts.find(a => a.id === alertId);
      if (!alert) return prev;

      const newTask: FollowUpTask = {
        id: `task-${Date.now()}`,
        patientId: alert.patientId,
        alertId: alert.id,
        title: taskData.title || alert.title,
        description: taskData.description || alert.suggestion,
        dueDate: taskData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        assignedTo: taskData.assignedTo || '未指派',
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        alerts: prev.alerts.map(a =>
          a.id === alertId ? { ...a, status: 'converted' as const } : a
        ),
        tasks: [newTask, ...prev.tasks],
      };
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: FollowUpTask['status'], notes?: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status,
              notes: notes || task.notes,
              completedAt: status === 'completed' ? new Date().toISOString() : task.completedAt,
            }
          : task
      ),
    }));
  }, []);

  const addMeasurement = useCallback((measurement: Omit<Measurement, 'id'>) => {
    const newMeasurement: Measurement = {
      ...measurement,
      id: `m-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      measurements: [newMeasurement, ...prev.measurements],
    }));
    // 通知所有監聽器
    measurementListeners.current.forEach(callback => callback(newMeasurement));
    // 更新版本號觸發重新分析
    setMeasurementVersion(prev => prev + 1);
  }, []);

  // 註冊新數據監聽器
  const onNewMeasurement = useCallback((callback: (measurement: Measurement) => void) => {
    measurementListeners.current.add(callback);
    return () => {
      measurementListeners.current.delete(callback);
    };
  }, []);

  // 添加新警示
  const addAlert = useCallback((alert: AIAlert) => {
    setState(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts],
    }));
    // 設置新警示類型，觸發動畫
    setNewAlertType(alert.type);
  }, []);

  // 清除新警示類型標記
  const clearNewAlertType = useCallback(() => {
    setNewAlertType(null);
  }, []);

  const getPatientById = useCallback((patientId: string) => {
    return state.patients.find(p => p.id === patientId);
  }, [state.patients]);

  const getPatientMeasurements = useCallback((patientId: string) => {
    return state.measurements.filter(m => m.patientId === patientId);
  }, [state.measurements]);

  const getPatientAlerts = useCallback((patientId: string) => {
    return state.alerts.filter(a => a.patientId === patientId);
  }, [state.alerts]);

  const getPatientTasks = useCallback((patientId: string) => {
    return state.tasks.filter(t => t.patientId === patientId);
  }, [state.tasks]);

  const getPendingAlertsCount = useCallback(() => {
    return state.alerts.filter(a => a.status === 'pending').length;
  }, [state.alerts]);

  const value: AppContextType = {
    ...state,
    selectPatient,
    confirmAlert,
    dismissAlert,
    convertAlertToTask,
    updateTaskStatus,
    addMeasurement,
    addAlert,
    getPatientById,
    getPatientMeasurements,
    getPatientAlerts,
    getPatientTasks,
    getPendingAlertsCount,
    onNewMeasurement,
    measurementVersion,
    newAlertType,
    clearNewAlertType,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 病患資料類型
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  roomNumber: string;
  bedNumber: string;
  diagnosis: string;
  admissionDate: string;
  photoUrl?: string;
}

// 生理量測類型
export type MeasurementType = 
  | 'bloodPressure' 
  | 'bloodSugar' 
  | 'heartRate' 
  | 'temperature' 
  | 'oxygenSaturation'
  | 'weight';

// 生理量測數據
export interface Measurement {
  id: string;
  patientId: string;
  type: MeasurementType;
  value: number;
  secondaryValue?: number; // 例如血壓的舒張壓
  unit: string;
  measuredAt: string;
  uploadedBy: string;
}

// AI 提醒優先級
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

// AI 提醒狀態
export type AlertStatus = 'pending' | 'confirmed' | 'dismissed' | 'converted';

// AI 生成的提醒
export interface AIAlert {
  id: string;
  patientId: string;
  measurementId: string;
  type: 'abnormal' | 'trend' | 'reminder' | 'follow-up';
  priority: AlertPriority;
  title: string;
  message: string;
  suggestion: string;
  status: AlertStatus;
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

// 追蹤事項
export interface FollowUpTask {
  id: string;
  patientId: string;
  alertId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

// 量測類型顯示資訊
export const measurementTypeInfo: Record<MeasurementType, { 
  name: string; 
  icon: string;
  normalRange: { min: number; max: number; secondaryMin?: number; secondaryMax?: number };
}> = {
  bloodPressure: { 
    name: '血壓', 
    icon: '❤️',
    normalRange: { min: 90, max: 140, secondaryMin: 60, secondaryMax: 90 }
  },
  bloodSugar: { 
    name: '血糖', 
    icon: '🩸',
    normalRange: { min: 70, max: 140 }
  },
  heartRate: { 
    name: '心率', 
    icon: '💓',
    normalRange: { min: 60, max: 100 }
  },
  temperature: { 
    name: '體溫', 
    icon: '🌡️',
    normalRange: { min: 36.0, max: 37.5 }
  },
  oxygenSaturation: { 
    name: '血氧飽和度', 
    icon: '🫁',
    normalRange: { min: 95, max: 100 }
  },
  weight: { 
    name: '體重', 
    icon: '⚖️',
    normalRange: { min: 40, max: 100 }
  }
};

// 優先級顯示資訊
export const priorityInfo: Record<AlertPriority, { 
  name: string; 
  color: string;
  bgColor: string;
}> = {
  critical: { name: '緊急', color: 'text-red-700', bgColor: 'bg-red-100' },
  high: { name: '高', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  medium: { name: '中', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  low: { name: '低', color: 'text-green-700', bgColor: 'bg-green-100' }
};

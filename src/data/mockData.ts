import { Patient, Measurement, AIAlert, FollowUpTask } from '../types';

// 模擬病患資料
export const mockPatients: Patient[] = [
  {
    id: 'p001',
    name: '王大明',
    age: 72,
    gender: '男',
    roomNumber: '301',
    bedNumber: 'A',
    diagnosis: '高血壓、第二型糖尿病',
    admissionDate: '2025-12-15',
  },
  {
    id: 'p002',
    name: '李美華',
    age: 68,
    gender: '女',
    roomNumber: '301',
    bedNumber: 'B',
    diagnosis: '心律不整、慢性腎臟病',
    admissionDate: '2025-12-18',
  },
  {
    id: 'p003',
    name: '張志強',
    age: 55,
    gender: '男',
    roomNumber: '302',
    bedNumber: 'A',
    diagnosis: '肺炎、COPD',
    admissionDate: '2025-12-20',
  },
  {
    id: 'p004',
    name: '陳淑芬',
    age: 80,
    gender: '女',
    roomNumber: '302',
    bedNumber: 'B',
    diagnosis: '心衰竭、高血壓',
    admissionDate: '2025-12-10',
  },
  {
    id: 'p005',
    name: '林建宏',
    age: 45,
    gender: '男',
    roomNumber: '303',
    bedNumber: 'A',
    diagnosis: '第一型糖尿病',
    admissionDate: '2025-12-22',
  },
];

// 生成過去 7 天的量測資料
const generateMeasurements = (): Measurement[] => {
  const measurements: Measurement[] = [];
  const now = new Date();
  
  mockPatients.forEach(patient => {
    // 每個病患每天 2-3 次量測
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      
      // 早上量測
      const morningDate = new Date(date);
      morningDate.setHours(8, 0, 0, 0);
      
      // 下午量測
      const afternoonDate = new Date(date);
      afternoonDate.setHours(14, 0, 0, 0);
      
      // 晚上量測
      const eveningDate = new Date(date);
      eveningDate.setHours(20, 0, 0, 0);
      
      [morningDate, afternoonDate, eveningDate].forEach((measureTime, timeIndex) => {
        // 血壓
        const isAbnormalBP = patient.id === 'p001' && dayOffset < 2;
        measurements.push({
          id: `m-bp-${patient.id}-${dayOffset}-${timeIndex}`,
          patientId: patient.id,
          type: 'bloodPressure',
          value: isAbnormalBP ? 165 + Math.random() * 15 : 120 + Math.random() * 20,
          secondaryValue: isAbnormalBP ? 100 + Math.random() * 10 : 75 + Math.random() * 10,
          unit: 'mmHg',
          measuredAt: measureTime.toISOString(),
          uploadedBy: '護理師小陳',
        });
        
        // 血糖 (只有糖尿病患者)
        if (patient.diagnosis.includes('糖尿病')) {
          const isAbnormalBS = patient.id === 'p005' && dayOffset === 0;
          measurements.push({
            id: `m-bs-${patient.id}-${dayOffset}-${timeIndex}`,
            patientId: patient.id,
            type: 'bloodSugar',
            value: isAbnormalBS ? 250 + Math.random() * 30 : 100 + Math.random() * 40,
            unit: 'mg/dL',
            measuredAt: measureTime.toISOString(),
            uploadedBy: '護理師小陳',
          });
        }
        
        // 心率
        const isAbnormalHR = patient.id === 'p002' && dayOffset < 1;
        measurements.push({
          id: `m-hr-${patient.id}-${dayOffset}-${timeIndex}`,
          patientId: patient.id,
          type: 'heartRate',
          value: isAbnormalHR ? 115 + Math.random() * 15 : 70 + Math.random() * 20,
          unit: 'bpm',
          measuredAt: measureTime.toISOString(),
          uploadedBy: '護理師小陳',
        });
        
        // 體溫
        const isAbnormalTemp = patient.id === 'p003' && dayOffset < 2;
        measurements.push({
          id: `m-temp-${patient.id}-${dayOffset}-${timeIndex}`,
          patientId: patient.id,
          type: 'temperature',
          value: isAbnormalTemp ? 38.2 + Math.random() * 0.8 : 36.5 + Math.random() * 0.5,
          unit: '°C',
          measuredAt: measureTime.toISOString(),
          uploadedBy: '護理師小陳',
        });
        
        // 血氧
        const isAbnormalO2 = patient.id === 'p003' && dayOffset < 1;
        measurements.push({
          id: `m-o2-${patient.id}-${dayOffset}-${timeIndex}`,
          patientId: patient.id,
          type: 'oxygenSaturation',
          value: isAbnormalO2 ? 88 + Math.random() * 4 : 96 + Math.random() * 3,
          unit: '%',
          measuredAt: measureTime.toISOString(),
          uploadedBy: '護理師小陳',
        });
      });
    }
  });
  
  return measurements.sort((a, b) => 
    new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  );
};

export const mockMeasurements: Measurement[] = generateMeasurements();

// AI 生成的提醒
export const mockAlerts: AIAlert[] = [
  {
    id: 'alert-001',
    patientId: 'p001',
    measurementId: 'm-bp-p001-0-0',
    type: 'abnormal',
    priority: 'critical',
    title: '血壓異常升高',
    message: '王大明先生今日血壓量測為 175/105 mmHg，明顯高於正常範圍 (收縮壓 > 140 mmHg, 舒張壓 > 90 mmHg)。過去 48 小時內血壓持續偏高。',
    suggestion: '建議：1. 確認病患是否有頭痛、頭暈等症狀 2. 檢視降壓藥物服用情況 3. 考慮通知主治醫師調整用藥',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-002',
    patientId: 'p002',
    measurementId: 'm-hr-p002-0-0',
    type: 'abnormal',
    priority: 'high',
    title: '心率偏快',
    message: '李美華女士心率量測為 125 bpm，超出正常範圍 (60-100 bpm)。病患有心律不整病史，需特別注意。',
    suggestion: '建議：1. 監測病患是否有心悸、胸悶等不適 2. 確認心律不整用藥服用情況 3. 必要時執行心電圖檢查',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-003',
    patientId: 'p003',
    measurementId: 'm-temp-p003-0-0',
    type: 'trend',
    priority: 'high',
    title: '體溫持續偏高趨勢',
    message: '張志強先生過去 48 小時體溫持續在 38.0-38.8°C 之間，發燒情況尚未改善。肺炎病患需密切注意感染控制。',
    suggestion: '建議：1. 評估退燒藥物效果 2. 監測呼吸狀況及肺部聽診 3. 考慮追蹤血液檢查及胸部X光',
    status: 'pending',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-004',
    patientId: 'p003',
    measurementId: 'm-o2-p003-0-0',
    type: 'abnormal',
    priority: 'critical',
    title: '血氧濃度偏低',
    message: '張志強先生血氧飽和度為 89%，低於正常值 (95% 以上)。病患有 COPD 及肺炎病史，需立即處置。',
    suggestion: '建議：1. 立即確認氧氣供應設備運作正常 2. 評估是否需要提高氧氣流量 3. 通知醫師評估呼吸狀況',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-005',
    patientId: 'p005',
    measurementId: 'm-bs-p005-0-0',
    type: 'abnormal',
    priority: 'high',
    title: '血糖值明顯偏高',
    message: '林建宏先生今日早餐後血糖量測為 268 mg/dL，明顯高於目標範圍 (餐後血糖應 < 180 mg/dL)。',
    suggestion: '建議：1. 確認胰島素是否正確施打 2. 了解近期飲食狀況 3. 監測是否有高血糖症狀 (口渴、頻尿)',
    status: 'pending',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-006',
    patientId: 'p004',
    measurementId: 'm-bp-p004-1-0',
    type: 'reminder',
    priority: 'medium',
    title: '血壓量測追蹤提醒',
    message: '陳淑芬女士昨日血壓稍微偏高 (148/92 mmHg)，建議今日增加監測次數以確認血壓控制情況。',
    suggestion: '建議：1. 今日每 4 小時量測一次血壓 2. 記錄病患活動及用藥時間 3. 如持續偏高請通知醫師',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    confirmedBy: '護理師小王',
  },
];

// 追蹤事項
export const mockTasks: FollowUpTask[] = [
  {
    id: 'task-001',
    patientId: 'p004',
    alertId: 'alert-006',
    title: '陳淑芬女士血壓追蹤',
    description: '每 4 小時量測血壓一次，記錄數值及病患狀況，如收縮壓 > 160 mmHg 或舒張壓 > 100 mmHg 請立即通知醫師',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'in-progress',
    assignedTo: '護理師小王',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    notes: '08:00 量測 145/88 mmHg，病患無不適',
  },
];

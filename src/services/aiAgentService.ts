import { 
  Measurement, 
  AIAlert, 
  Patient, 
  MeasurementType, 
  AlertPriority,
  measurementTypeInfo 
} from '../types';

/**
 * AI Agent 服務
 * 分析生理量測數據並生成智能提醒
 */
export class AIAgentService {
  /**
   * 分析單一量測數據
   */
  static analyzeMeasurement(
    measurement: Measurement, 
    patient: Patient,
    recentMeasurements: Measurement[]
  ): AIAlert | null {
    const typeInfo = measurementTypeInfo[measurement.type];
    const { normalRange } = typeInfo;
    
    let isAbnormal = false;
    let priority: AlertPriority = 'low';
    let title = '';
    let message = '';
    let suggestion = '';
    
    switch (measurement.type) {
      case 'bloodPressure':
        const systolic = measurement.value;
        const diastolic = measurement.secondaryValue || 0;
        
        if (systolic > 180 || diastolic > 120) {
          isAbnormal = true;
          priority = 'critical';
          title = '血壓危險值警示';
          message = `${patient.name}血壓量測為 ${systolic}/${diastolic} mmHg，達到高血壓危象標準，需立即處理。`;
          suggestion = '建議：1. 立即通知值班醫師 2. 準備降壓藥物 3. 持續監測並記錄意識狀態';
        } else if (systolic > normalRange.max || diastolic > (normalRange.secondaryMax || 90)) {
          isAbnormal = true;
          priority = systolic > 160 ? 'high' : 'medium';
          title = '血壓異常升高';
          message = `${patient.name}血壓量測為 ${systolic}/${diastolic} mmHg，高於正常範圍。`;
          suggestion = '建議：1. 確認病患症狀 2. 檢視用藥情況 3. 必要時通知醫師';
        } else if (systolic < normalRange.min || diastolic < (normalRange.secondaryMin || 60)) {
          isAbnormal = true;
          priority = systolic < 80 ? 'critical' : 'high';
          title = '血壓偏低警示';
          message = `${patient.name}血壓量測為 ${systolic}/${diastolic} mmHg，低於正常範圍。`;
          suggestion = '建議：1. 評估病患意識及末梢循環 2. 確認是否有脫水或出血情況 3. 通知醫師評估';
        }
        break;
        
      case 'bloodSugar':
        if (measurement.value > 300) {
          isAbnormal = true;
          priority = 'critical';
          title = '血糖危險值警示';
          message = `${patient.name}血糖量測為 ${measurement.value} mg/dL，嚴重偏高，需警惕糖尿病酮症酸中毒。`;
          suggestion = '建議：1. 立即通知醫師 2. 檢測尿酮 3. 準備胰島素及輸液治療';
        } else if (measurement.value > normalRange.max) {
          isAbnormal = true;
          priority = measurement.value > 200 ? 'high' : 'medium';
          title = '血糖值偏高';
          message = `${patient.name}血糖量測為 ${measurement.value} mg/dL，高於目標範圍。`;
          suggestion = '建議：1. 確認胰島素施打情況 2. 了解飲食狀況 3. 監測高血糖症狀';
        } else if (measurement.value < 70) {
          isAbnormal = true;
          priority = measurement.value < 50 ? 'critical' : 'high';
          title = '低血糖警示';
          message = `${patient.name}血糖量測為 ${measurement.value} mg/dL，有低血糖風險。`;
          suggestion = '建議：1. 立即給予糖分補充 2. 監測意識狀態 3. 確認是否用藥過量';
        }
        break;
        
      case 'heartRate':
        if (measurement.value > 150 || measurement.value < 40) {
          isAbnormal = true;
          priority = 'critical';
          title = measurement.value > 150 ? '嚴重心搏過速' : '嚴重心搏過緩';
          message = `${patient.name}心率量測為 ${measurement.value} bpm，需立即處理。`;
          suggestion = '建議：1. 立即執行心電圖 2. 通知醫師 3. 準備急救設備';
        } else if (measurement.value > normalRange.max) {
          isAbnormal = true;
          priority = measurement.value > 120 ? 'high' : 'medium';
          title = '心率偏快';
          message = `${patient.name}心率量測為 ${measurement.value} bpm，超出正常範圍。`;
          suggestion = '建議：1. 評估病患是否有心悸不適 2. 確認用藥情況 3. 必要時執行心電圖';
        } else if (measurement.value < normalRange.min) {
          isAbnormal = true;
          priority = measurement.value < 50 ? 'high' : 'medium';
          title = '心率偏慢';
          message = `${patient.name}心率量測為 ${measurement.value} bpm，低於正常範圍。`;
          suggestion = '建議：1. 評估病患意識及活動耐力 2. 檢視是否使用降心率藥物 3. 通知醫師評估';
        }
        break;
        
      case 'temperature':
        if (measurement.value >= 39.5) {
          isAbnormal = true;
          priority = 'critical';
          title = '高燒警示';
          message = `${patient.name}體溫量測為 ${measurement.value.toFixed(1)}°C，需積極降溫處理。`;
          suggestion = '建議：1. 立即給予退燒藥物 2. 物理降溫 3. 追蹤感染源並通知醫師';
        } else if (measurement.value > normalRange.max) {
          isAbnormal = true;
          priority = measurement.value > 38.5 ? 'high' : 'medium';
          title = '體溫偏高';
          message = `${patient.name}體溫量測為 ${measurement.value.toFixed(1)}°C，有發燒情況。`;
          suggestion = '建議：1. 監測體溫變化 2. 評估退燒藥物效果 3. 注意感染症狀';
        } else if (measurement.value < 35.5) {
          isAbnormal = true;
          priority = 'high';
          title = '體溫偏低警示';
          message = `${patient.name}體溫量測為 ${measurement.value.toFixed(1)}°C，需注意保暖。`;
          suggestion = '建議：1. 加強保暖措施 2. 評估末梢循環 3. 確認環境溫度';
        }
        break;
        
      case 'oxygenSaturation':
        if (measurement.value < 90) {
          isAbnormal = true;
          priority = 'critical';
          title = '血氧嚴重偏低';
          message = `${patient.name}血氧飽和度為 ${measurement.value}%，需立即處理。`;
          suggestion = '建議：1. 立即提高氧氣供應 2. 確認呼吸道通暢 3. 緊急通知醫師';
        } else if (measurement.value < normalRange.min) {
          isAbnormal = true;
          priority = measurement.value < 92 ? 'high' : 'medium';
          title = '血氧濃度偏低';
          message = `${patient.name}血氧飽和度為 ${measurement.value}%，低於正常值。`;
          suggestion = '建議：1. 確認氧氣設備運作 2. 評估呼吸狀況 3. 必要時調整氧氣流量';
        }
        break;
    }
    
    // 趨勢分析
    if (!isAbnormal) {
      const trendAlert = this.analyzeTrend(measurement, patient, recentMeasurements);
      if (trendAlert) {
        return trendAlert;
      }
    }
    
    if (!isAbnormal) {
      return null;
    }
    
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId: patient.id,
      measurementId: measurement.id,
      type: 'abnormal',
      priority,
      title,
      message,
      suggestion,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
  
  /**
   * 分析數據趨勢
   */
  static analyzeTrend(
    currentMeasurement: Measurement,
    patient: Patient,
    recentMeasurements: Measurement[]
  ): AIAlert | null {
    // 取得同類型的最近量測數據
    const sameTpyeMeasurements = recentMeasurements
      .filter(m => m.type === currentMeasurement.type && m.patientId === patient.id)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
      .slice(0, 10);
    
    if (sameTpyeMeasurements.length < 3) {
      return null;
    }
    
    // 計算趨勢
    const values = sameTpyeMeasurements.map(m => m.value);
    const avgRecent = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const avgOlder = values.slice(3).reduce((a, b) => a + b, 0) / Math.max(values.length - 3, 1);
    
    const changePercent = ((avgRecent - avgOlder) / avgOlder) * 100;
    const typeInfo = measurementTypeInfo[currentMeasurement.type];
    
    // 如果變化超過 15%，生成趨勢提醒
    if (Math.abs(changePercent) > 15) {
      const isIncreasing = changePercent > 0;
      const direction = isIncreasing ? '上升' : '下降';
      
      return {
        id: `alert-trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        measurementId: currentMeasurement.id,
        type: 'trend',
        priority: Math.abs(changePercent) > 25 ? 'high' : 'medium',
        title: `${typeInfo.name}呈現${direction}趨勢`,
        message: `${patient.name}的${typeInfo.name}近期呈現${direction}趨勢，變化幅度約 ${Math.abs(changePercent).toFixed(1)}%。`,
        suggestion: `建議：密切監測${typeInfo.name}變化，並評估可能原因。`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    }
    
    return null;
  }
  
  /**
   * 生成定期追蹤提醒
   */
  static generateFollowUpReminder(
    patient: Patient,
    measurementType: MeasurementType,
    lastMeasurement: Measurement | null
  ): AIAlert | null {
    if (!lastMeasurement) {
      const typeInfo = measurementTypeInfo[measurementType];
      return {
        id: `alert-reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        measurementId: '',
        type: 'reminder',
        priority: 'medium',
        title: `${typeInfo.name}量測提醒`,
        message: `${patient.name}尚未有今日的${typeInfo.name}量測紀錄。`,
        suggestion: `建議：請安排${typeInfo.name}量測。`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    }
    
    // 檢查是否超過 8 小時未量測
    const lastMeasuredTime = new Date(lastMeasurement.measuredAt).getTime();
    const hoursSinceLastMeasurement = (Date.now() - lastMeasuredTime) / (1000 * 60 * 60);
    
    if (hoursSinceLastMeasurement > 8) {
      const typeInfo = measurementTypeInfo[measurementType];
      return {
        id: `alert-reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        measurementId: lastMeasurement.id,
        type: 'reminder',
        priority: 'low',
        title: `${typeInfo.name}量測追蹤提醒`,
        message: `${patient.name}已超過 ${Math.floor(hoursSinceLastMeasurement)} 小時未量測${typeInfo.name}。`,
        suggestion: `建議：請安排${typeInfo.name}量測以持續追蹤。`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    }
    
    return null;
  }
  
  /**
   * 批量分析所有待處理的量測數據
   */
  static analyzeAllMeasurements(
    measurements: Measurement[],
    patients: Patient[]
  ): AIAlert[] {
    const alerts: AIAlert[] = [];
    const patientMap = new Map(patients.map(p => [p.id, p]));
    
    // 分析每個量測數據
    measurements.forEach(measurement => {
      const patient = patientMap.get(measurement.patientId);
      if (!patient) return;
      
      const patientMeasurements = measurements.filter(m => m.patientId === patient.id);
      const alert = this.analyzeMeasurement(measurement, patient, patientMeasurements);
      
      if (alert) {
        alerts.push(alert);
      }
    });
    
    // 移除重複的提醒（同一病患同一類型只保留最嚴重的）
    const uniqueAlerts = this.deduplicateAlerts(alerts);
    
    return uniqueAlerts;
  }
  
  /**
   * 移除重複提醒
   */
  private static deduplicateAlerts(alerts: AIAlert[]): AIAlert[] {
    const alertMap = new Map<string, AIAlert>();
    const priorityOrder: AlertPriority[] = ['critical', 'high', 'medium', 'low'];
    
    alerts.forEach(alert => {
      const key = `${alert.patientId}-${alert.type}-${alert.title}`;
      const existing = alertMap.get(key);
      
      if (!existing) {
        alertMap.set(key, alert);
      } else {
        // 保留優先級較高的
        const existingPriority = priorityOrder.indexOf(existing.priority);
        const newPriority = priorityOrder.indexOf(alert.priority);
        
        if (newPriority < existingPriority) {
          alertMap.set(key, alert);
        }
      }
    });
    
    return Array.from(alertMap.values());
  }
}

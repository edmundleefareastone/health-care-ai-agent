import { 
  Measurement, 
  AIAlert, 
  Patient, 
  MeasurementType, 
  AlertPriority,
  measurementTypeInfo
} from '../types';

/**
 * AI Agent 設定與角色定義
 */
export interface AIAgentConfig {
  name: string;
  role: string;
  personality: string;
  capabilities: string[];
}

/**
 * AI 思考過程記錄
 */
export interface ThinkingStep {
  step: number;
  action: string;
  observation: string;
  reasoning: string;
}

/**
 * AI Agent 分析結果
 */
export interface AgentAnalysisResult {
  alert: AIAlert | null;
  thinkingProcess: ThinkingStep[];
  confidence: number;
  reasoning: string;
}

/**
 * AI Agent 類別
 * 模擬一個具有角色設定和思考能力的 AI 助手
 */
export class HealthCareAIAgent {
  private config: AIAgentConfig;
  private isRunning: boolean = false;
  private analysisHistory: AgentAnalysisResult[] = [];

  constructor() {
    this.config = {
      name: '小護',
      role: '智能健康照護助手',
      personality: '細心、專業、友善，擅長分析生理數據並提供臨床建議',
      capabilities: [
        '即時監測生理數據異常',
        '分析健康趨勢變化',
        '提供專業護理建議',
        '優先級評估與分類',
        '追蹤提醒生成'
      ]
    };
  }

  /**
   * 取得 Agent 資訊
   */
  getAgentInfo(): AIAgentConfig {
    return this.config;
  }

  /**
   * Agent 自我介紹
   */
  introduce(): string {
    return `您好！我是「${this.config.name}」，您的${this.config.role}。
    
我的專長包括：
${this.config.capabilities.map((c, i) => `${i + 1}. ${c}`).join('\n')}

我會持續監測所有病患的生理數據，一旦發現異常或需要關注的狀況，會立即提醒您。讓我們一起為病患提供最好的照護！`;
  }

  /**
   * 主要分析方法 - 帶有思考過程
   */
  async analyzeWithThinking(
    measurement: Measurement,
    patient: Patient,
    recentMeasurements: Measurement[]
  ): Promise<AgentAnalysisResult> {
    const thinkingProcess: ThinkingStep[] = [];
    let stepCount = 0;

    // Step 1: 資料接收
    thinkingProcess.push({
      step: ++stepCount,
      action: '接收量測數據',
      observation: `收到 ${patient.name} 的${measurementTypeInfo[measurement.type].name}數據：${this.formatMeasurementValue(measurement)}`,
      reasoning: '開始分析此筆新上傳的生理量測數據'
    });

    // Step 2: 查詢病患背景
    thinkingProcess.push({
      step: ++stepCount,
      action: '查詢病患背景資料',
      observation: `${patient.name}，${patient.age}歲${patient.gender}性，診斷：${patient.diagnosis}`,
      reasoning: '病患的診斷背景會影響數據的判讀標準，需要納入考量'
    });

    // Step 3: 比對正常範圍
    const typeInfo = measurementTypeInfo[measurement.type];
    const normalRange = typeInfo.normalRange;
    const isInRange = this.checkNormalRange(measurement, normalRange);
    
    thinkingProcess.push({
      step: ++stepCount,
      action: '比對正常參考範圍',
      observation: `${typeInfo.name}正常範圍：${this.formatNormalRange(measurement.type, normalRange)}，目前數值${isInRange ? '在' : '不在'}正常範圍內`,
      reasoning: isInRange 
        ? '數值在正常範圍內，但仍需考慮病患個人狀況和趨勢變化'
        : '數值超出正常範圍，需要進一步評估嚴重程度'
    });

    // Step 4: 趨勢分析
    const trendAnalysis = this.analyzeTrend(measurement, recentMeasurements);
    thinkingProcess.push({
      step: ++stepCount,
      action: '分析歷史趨勢',
      observation: trendAnalysis.observation,
      reasoning: trendAnalysis.reasoning
    });

    // Step 5: 結合診斷評估
    const diagnosisRisk = this.assessDiagnosisRisk(measurement, patient);
    thinkingProcess.push({
      step: ++stepCount,
      action: '評估診斷相關風險',
      observation: diagnosisRisk.observation,
      reasoning: diagnosisRisk.reasoning
    });

    // Step 6: 決策與建議
    const decision = this.makeDecision(measurement, patient, isInRange, trendAnalysis, diagnosisRisk);
    thinkingProcess.push({
      step: ++stepCount,
      action: '生成分析結論與建議',
      observation: decision.alert ? `判定為【${decision.priority}】級別警示` : '判定為正常，無需警示',
      reasoning: decision.reasoning
    });

    // 建立結果
    const result: AgentAnalysisResult = {
      alert: decision.alert,
      thinkingProcess,
      confidence: decision.confidence,
      reasoning: decision.reasoning
    };

    this.analysisHistory.push(result);
    return result;
  }

  /**
   * 批量分析所有量測數據
   */
  async analyzeAllMeasurements(
    measurements: Measurement[],
    patients: Patient[]
  ): Promise<AIAlert[]> {
    const alerts: AIAlert[] = [];
    const patientMap = new Map(patients.map(p => [p.id, p]));
    
    // 只分析最近24小時的數據
    const recentMeasurements = measurements.filter(m => {
      const measureTime = new Date(m.measuredAt).getTime();
      const now = Date.now();
      return now - measureTime < 24 * 60 * 60 * 1000;
    });

    for (const measurement of recentMeasurements.slice(0, 20)) {
      const patient = patientMap.get(measurement.patientId);
      if (!patient) continue;

      const patientMeasurements = measurements.filter(m => m.patientId === patient.id);
      const result = await this.analyzeWithThinking(measurement, patient, patientMeasurements);
      
      if (result.alert) {
        alerts.push(result.alert);
      }
    }

    // 移除重複提醒
    return this.deduplicateAlerts(alerts);
  }

  /**
   * 生成個人化建議訊息
   */
  generatePersonalizedSuggestion(
    alert: AIAlert,
    patient: Patient
  ): string {
    const greetings = [
      `護理師您好，關於${patient.name}的狀況，`,
      `提醒您注意，${patient.name}`,
      `${patient.name}的最新數據顯示，`,
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    let suggestion = greeting;
    
    switch (alert.priority) {
      case 'critical':
        suggestion += `情況緊急，需要立即處理。\n\n🚨 建議立即採取以下行動：\n${alert.suggestion}`;
        break;
      case 'high':
        suggestion += `有異常狀況需要您儘快關注。\n\n⚠️ 建議處置：\n${alert.suggestion}`;
        break;
      case 'medium':
        suggestion += `有些數值需要追蹤觀察。\n\n📋 建議追蹤：\n${alert.suggestion}`;
        break;
      case 'low':
        suggestion += `提醒您進行例行追蹤。\n\n💡 建議：\n${alert.suggestion}`;
        break;
    }

    suggestion += `\n\n如有任何疑問，我隨時為您分析更多資訊。—— ${this.config.name}`;
    
    return suggestion;
  }

  /**
   * Agent 狀態報告
   */
  getStatusReport(): string {
    const totalAnalysis = this.analysisHistory.length;
    const alertsGenerated = this.analysisHistory.filter(r => r.alert !== null).length;
    const avgConfidence = this.analysisHistory.length > 0
      ? this.analysisHistory.reduce((sum, r) => sum + r.confidence, 0) / this.analysisHistory.length
      : 0;

    return `
📊 AI Agent「${this.config.name}」狀態報告
━━━━━━━━━━━━━━━━━━━━━━━━
🔍 已分析數據筆數：${totalAnalysis}
🔔 已生成提醒數：${alertsGenerated}
📈 平均信心度：${(avgConfidence * 100).toFixed(1)}%
⏰ 運行狀態：${this.isRunning ? '監控中' : '待命中'}
━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  // ============ 私有輔助方法 ============

  private formatMeasurementValue(measurement: Measurement): string {
    if (measurement.type === 'bloodPressure') {
      return `${measurement.value}/${measurement.secondaryValue} ${measurement.unit}`;
    }
    if (measurement.type === 'temperature') {
      return `${measurement.value.toFixed(1)} ${measurement.unit}`;
    }
    return `${measurement.value} ${measurement.unit}`;
  }

  private formatNormalRange(type: MeasurementType, range: { min: number; max: number; secondaryMin?: number; secondaryMax?: number }): string {
    if (type === 'bloodPressure') {
      return `${range.min}-${range.max}/${range.secondaryMin}-${range.secondaryMax} mmHg`;
    }
    return `${range.min}-${range.max}`;
  }

  private checkNormalRange(measurement: Measurement, range: { min: number; max: number; secondaryMin?: number; secondaryMax?: number }): boolean {
    if (measurement.type === 'bloodPressure') {
      const systolicOk = measurement.value >= range.min && measurement.value <= range.max;
      const diastolicOk = !measurement.secondaryValue || 
        (measurement.secondaryValue >= (range.secondaryMin || 0) && measurement.secondaryValue <= (range.secondaryMax || 100));
      return systolicOk && diastolicOk;
    }
    return measurement.value >= range.min && measurement.value <= range.max;
  }

  private analyzeTrend(
    current: Measurement,
    history: Measurement[]
  ): { observation: string; reasoning: string; trend: 'up' | 'down' | 'stable' } {
    const sameTpye = history
      .filter(m => m.type === current.type)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
      .slice(0, 5);

    if (sameTpye.length < 2) {
      return {
        observation: '歷史數據不足，無法進行趨勢分析',
        reasoning: '需要累積更多數據才能判斷趨勢',
        trend: 'stable'
      };
    }

    const values = sameTpye.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const change = ((current.value - avg) / avg) * 100;

    if (Math.abs(change) < 5) {
      return {
        observation: `近期數值穩定，平均值約 ${avg.toFixed(1)}`,
        reasoning: '數值變化在正常波動範圍內',
        trend: 'stable'
      };
    } else if (change > 0) {
      return {
        observation: `數值呈上升趨勢，較平均值高 ${change.toFixed(1)}%`,
        reasoning: '需注意持續上升是否代表病情變化',
        trend: 'up'
      };
    } else {
      return {
        observation: `數值呈下降趨勢，較平均值低 ${Math.abs(change).toFixed(1)}%`,
        reasoning: '需評估下降原因及是否需要介入',
        trend: 'down'
      };
    }
  }

  private assessDiagnosisRisk(
    measurement: Measurement,
    patient: Patient
  ): { observation: string; reasoning: string; riskLevel: 'high' | 'medium' | 'low' } {
    const diagnosis = patient.diagnosis.toLowerCase();
    
    // 根據診斷和量測類型評估風險
    const riskFactors: string[] = [];

    if (measurement.type === 'bloodPressure' && diagnosis.includes('高血壓')) {
      riskFactors.push('病患有高血壓病史，血壓變化需特別注意');
    }
    if (measurement.type === 'bloodPressure' && diagnosis.includes('心')) {
      riskFactors.push('心臟相關疾病患者，血壓控制尤為重要');
    }
    if (measurement.type === 'bloodSugar' && diagnosis.includes('糖尿病')) {
      riskFactors.push('糖尿病患者，血糖波動可能較大');
    }
    if (measurement.type === 'heartRate' && diagnosis.includes('心律')) {
      riskFactors.push('有心律不整病史，心率變化需密切監測');
    }
    if (measurement.type === 'oxygenSaturation' && (diagnosis.includes('肺') || diagnosis.includes('copd'))) {
      riskFactors.push('呼吸系統疾病患者，血氧監測至關重要');
    }
    if (measurement.type === 'temperature' && diagnosis.includes('肺炎')) {
      riskFactors.push('肺炎患者，體溫變化可反映感染控制情況');
    }

    if (riskFactors.length === 0) {
      return {
        observation: '病患診斷與此項量測無直接高風險關聯',
        reasoning: '可按一般標準判讀',
        riskLevel: 'low'
      };
    }

    return {
      observation: riskFactors.join('；'),
      reasoning: '病患背景增加了此數據的臨床重要性',
      riskLevel: riskFactors.length > 1 ? 'high' : 'medium'
    };
  }

  private makeDecision(
    measurement: Measurement,
    patient: Patient,
    isInRange: boolean,
    trendAnalysis: { trend: 'up' | 'down' | 'stable' },
    diagnosisRisk: { riskLevel: 'high' | 'medium' | 'low' }
  ): { alert: AIAlert | null; priority: AlertPriority; confidence: number; reasoning: string } {
    const _typeInfo = measurementTypeInfo[measurement.type];
    void _typeInfo; // Reserved for future use
    
    // 計算異常程度
    let severity = 0;
    let priority: AlertPriority = 'low';
    let reasoning = '';

    if (!isInRange) {
      severity += 2;
      reasoning += '數值超出正常範圍；';
    }

    if (diagnosisRisk.riskLevel === 'high') {
      severity += 2;
      reasoning += '病患診斷增加風險；';
    } else if (diagnosisRisk.riskLevel === 'medium') {
      severity += 1;
    }

    if (trendAnalysis.trend !== 'stable') {
      severity += 1;
      reasoning += `數據呈現${trendAnalysis.trend === 'up' ? '上升' : '下降'}趨勢；`;
    }

    // 特殊危險值檢測
    const criticalCheck = this.checkCriticalValues(measurement);
    if (criticalCheck.isCritical) {
      severity = 5;
      reasoning = criticalCheck.reason;
    }

    // 決定優先級
    if (severity >= 4) priority = 'critical';
    else if (severity >= 3) priority = 'high';
    else if (severity >= 2) priority = 'medium';
    else if (severity >= 1) priority = 'low';

    // 信心度計算
    const confidence = Math.min(0.95, 0.6 + severity * 0.1);

    // 如果嚴重度夠高，生成警示
    if (severity >= 1) {
      const alert: AIAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        measurementId: measurement.id,
        type: severity >= 3 ? 'abnormal' : 'trend',
        priority,
        title: this.generateAlertTitle(measurement, patient, priority),
        message: this.generateAlertMessage(measurement, patient, reasoning),
        suggestion: this.generateSuggestion(measurement, patient, priority),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      return { alert, priority, confidence, reasoning };
    }

    return { alert: null, priority: 'low', confidence, reasoning: '數值正常，無需警示' };
  }

  private checkCriticalValues(measurement: Measurement): { isCritical: boolean; reason: string } {
    switch (measurement.type) {
      case 'bloodPressure':
        if (measurement.value > 180 || (measurement.secondaryValue && measurement.secondaryValue > 120)) {
          return { isCritical: true, reason: '血壓達到高血壓危象標準（>180/120 mmHg）' };
        }
        if (measurement.value < 80) {
          return { isCritical: true, reason: '收縮壓過低（<80 mmHg），有休克風險' };
        }
        break;
      case 'bloodSugar':
        if (measurement.value > 400) {
          return { isCritical: true, reason: '血糖嚴重偏高（>400 mg/dL），有酮酸中毒風險' };
        }
        if (measurement.value < 50) {
          return { isCritical: true, reason: '嚴重低血糖（<50 mg/dL），有意識喪失風險' };
        }
        break;
      case 'heartRate':
        if (measurement.value > 150) {
          return { isCritical: true, reason: '嚴重心搏過速（>150 bpm）' };
        }
        if (measurement.value < 40) {
          return { isCritical: true, reason: '嚴重心搏過緩（<40 bpm）' };
        }
        break;
      case 'oxygenSaturation':
        if (measurement.value < 88) {
          return { isCritical: true, reason: '血氧飽和度嚴重偏低（<88%），有呼吸衰竭風險' };
        }
        break;
      case 'temperature':
        if (measurement.value >= 40) {
          return { isCritical: true, reason: '高燒（≥40°C），需積極降溫' };
        }
        if (measurement.value < 35) {
          return { isCritical: true, reason: '體溫過低（<35°C），有低體溫症風險' };
        }
        break;
    }
    return { isCritical: false, reason: '' };
  }

  private generateAlertTitle(measurement: Measurement, patient: Patient, priority: AlertPriority): string {
    const typeInfo = measurementTypeInfo[measurement.type];
    const urgencyPrefix = priority === 'critical' ? '🚨 ' : priority === 'high' ? '⚠️ ' : '';
    return `${urgencyPrefix}${patient.name} ${typeInfo.name}異常`;
  }

  private generateAlertMessage(measurement: Measurement, patient: Patient, reasoning: string): string {
    const typeInfo = measurementTypeInfo[measurement.type];
    return `${patient.name}（${patient.roomNumber}房${patient.bedNumber}床）的${typeInfo.name}量測值為 ${this.formatMeasurementValue(measurement)}。

分析結果：${reasoning}

病患診斷：${patient.diagnosis}`;
  }

  private generateSuggestion(measurement: Measurement, _patient: Patient, priority: AlertPriority): string {
    void measurement; // Reserved for future use
    void _patient; // Reserved for future use
    const suggestions: string[] = [];
    
    if (priority === 'critical') {
      suggestions.push('1. 立即前往病房評估病患狀況');
      suggestions.push('2. 通知值班醫師');
    } else if (priority === 'high') {
      suggestions.push('1. 儘快確認病患當前狀況');
    }

    switch (measurement.type) {
      case 'bloodPressure':
        suggestions.push('確認降壓/升壓藥物使用情況');
        suggestions.push('評估是否有頭痛、頭暈等症狀');
        break;
      case 'bloodSugar':
        suggestions.push('確認胰島素或降血糖藥物使用情況');
        suggestions.push('了解最近飲食狀況');
        break;
      case 'heartRate':
        suggestions.push('評估是否有心悸、胸悶等不適');
        suggestions.push('必要時安排心電圖檢查');
        break;
      case 'oxygenSaturation':
        suggestions.push('確認氧氣設備運作正常');
        suggestions.push('評估呼吸狀況及肺部聽診');
        break;
      case 'temperature':
        suggestions.push('給予適當的退燒處置');
        suggestions.push('監測感染相關症狀');
        break;
    }

    if (priority !== 'low') {
      suggestions.push('持續追蹤並記錄變化');
    }

    return suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  private deduplicateAlerts(alerts: AIAlert[]): AIAlert[] {
    const alertMap = new Map<string, AIAlert>();
    const priorityOrder: AlertPriority[] = ['critical', 'high', 'medium', 'low'];

    alerts.forEach(alert => {
      const key = `${alert.patientId}-${alert.type}`;
      const existing = alertMap.get(key);

      if (!existing) {
        alertMap.set(key, alert);
      } else {
        const existingPriority = priorityOrder.indexOf(existing.priority);
        const newPriority = priorityOrder.indexOf(alert.priority);
        if (newPriority < existingPriority) {
          alertMap.set(key, alert);
        }
      }
    });

    return Array.from(alertMap.values())
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  }
}

// 建立單例
export const healthCareAgent = new HealthCareAIAgent();

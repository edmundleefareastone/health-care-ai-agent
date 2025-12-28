import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Users, 
  Bell, 
  ClipboardList, 
  Activity,
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  Thermometer,
  Droplets,
  Play,
  GripVertical
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { measurementTypeInfo, priorityInfo, MeasurementType } from '../types';
import AIAgentPanel from './AIAgentPanel';

const Dashboard: React.FC = () => {
  const { patients, alerts, tasks, measurements, addMeasurement, newAlertType, clearNewAlertType } = useApp();
  
  // 動畫狀態追蹤
  const [animatingType, setAnimatingType] = useState<string | null>(null);
  
  // AI Agent 面板寬度狀態（預設 25%，最小 15%，最大 50%）
  const [aiPanelWidth, setAiPanelWidth] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 處理拖動開始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  // 處理拖動中
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
      // 限制寬度在 15% 到 50% 之間
      setAiPanelWidth(Math.min(50, Math.max(15, newWidth)));
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // 當有新警示時觸發動畫（持續閃爍直到使用者點擊）
  useEffect(() => {
    if (newAlertType) {
      setAnimatingType(newAlertType);
    }
  }, [newAlertType]);
  
  // 點擊提醒項目時停止動畫
  const handleAlertClick = (type: string) => {
    if (animatingType === type || 
        (type === 'reminder' && (animatingType === 'reminder' || animatingType === 'follow-up'))) {
      setAnimatingType(null);
      clearNewAlertType();
    }
  };
  
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const criticalAlerts = pendingAlerts.filter(a => a.priority === 'critical');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // 模擬上傳新數據
  const simulateUpload = (type: MeasurementType) => {
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    
    let value: number;
    let secondaryValue: number | undefined;
    let unit: string;
    
    // 根據類型生成隨機數據（有機率產生異常值）
    const isAbnormal = Math.random() < 0.6; // 60% 機率產生異常值
    
    switch (type) {
      case 'bloodPressure':
        value = isAbnormal 
          ? Math.floor(Math.random() * 30) + 150 // 異常：150-180
          : Math.floor(Math.random() * 20) + 110; // 正常：110-130
        secondaryValue = isAbnormal
          ? Math.floor(Math.random() * 20) + 95 // 異常：95-115
          : Math.floor(Math.random() * 15) + 70; // 正常：70-85
        unit = 'mmHg';
        break;
      case 'bloodSugar':
        value = isAbnormal
          ? Math.floor(Math.random() * 80) + 180 // 異常：180-260
          : Math.floor(Math.random() * 40) + 80; // 正常：80-120
        unit = 'mg/dL';
        break;
      case 'temperature':
        value = isAbnormal
          ? Math.random() * 1.5 + 37.8 // 異常：37.8-39.3
          : Math.random() * 0.8 + 36.2; // 正常：36.2-37.0
        unit = '°C';
        break;
      case 'heartRate':
        value = isAbnormal
          ? Math.random() < 0.5 
            ? Math.floor(Math.random() * 20) + 110 // 過快：110-130
            : Math.floor(Math.random() * 15) + 45 // 過慢：45-60
          : Math.floor(Math.random() * 20) + 65; // 正常：65-85
        unit = 'bpm';
        break;
      case 'oxygenSaturation':
        value = isAbnormal
          ? Math.floor(Math.random() * 7) + 88 // 異常：88-95
          : Math.floor(Math.random() * 3) + 97; // 正常：97-100
        unit = '%';
        break;
      default:
        value = 70;
        unit = 'kg';
    }
    
    addMeasurement({
      patientId: randomPatient.id,
      type,
      value,
      secondaryValue,
      unit,
      measuredAt: new Date().toISOString(),
      uploadedBy: '自動上傳',
    });
  };
  
  // 今日量測數據
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMeasurements = measurements.filter(m => 
    new Date(m.measuredAt) >= today
  );

  // 統計卡片數據
  const stats = [
    {
      label: '照護病患',
      value: patients.length,
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '待處理提醒',
      value: pendingAlerts.length,
      icon: Bell,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      alert: criticalAlerts.length > 0,
    },
    {
      label: '追蹤事項',
      value: pendingTasks.length,
      icon: ClipboardList,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: '今日量測',
      value: todayMeasurements.length,
      icon: Activity,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  // 按類型統計提醒
  const alertsByType = {
    abnormal: pendingAlerts.filter(a => a.type === 'abnormal').length,
    trend: pendingAlerts.filter(a => a.type === 'trend').length,
    reminder: pendingAlerts.filter(a => a.type === 'reminder' || a.type === 'follow-up').length,
  };

  // 最新的異常量測
  const recentAbnormalMeasurements = measurements
    .filter(m => {
      const info = measurementTypeInfo[m.type];
      if (m.type === 'bloodPressure') {
        return m.value > info.normalRange.max || (m.secondaryValue && m.secondaryValue > (info.normalRange.secondaryMax || 90));
      }
      return m.value < info.normalRange.min || m.value > info.normalRange.max;
    })
    .slice(0, 5);

  return (
    <div className="h-full flex" ref={containerRef}>
      {/* 左側：儀表板 */}
      <div className="flex-1 p-4 overflow-y-auto hide-scrollbar">
        <div className="w-full space-y-4">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 text-white">
            <h1 className="text-2xl font-bold mb-1">早安，護理師 Edmund 👋</h1>
            <p className="text-blue-100 text-base">
              目前有 {criticalAlerts.length} 個緊急提醒需要您的關注。AI Agent 持續為您監測病患健康狀況。
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  {stat.alert && (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 兩欄佈局 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Alert Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">提醒摘要</h2>
              
              <div className="space-y-2">
                <div 
                  onClick={() => handleAlertClick('abnormal')}
                  className={`flex items-center justify-between p-3 bg-red-50 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-100 ${
                  animatingType === 'abnormal' ? 'ring-2 ring-red-400 ring-offset-2 animate-pulse scale-[1.02]' : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`w-6 h-6 text-red-500 ${animatingType === 'abnormal' ? 'animate-bounce' : ''}`} />
                    <span className="text-base font-medium text-gray-900">異常警示</span>
                  </div>
                  <span className={`text-2xl font-bold text-red-600 ${animatingType === 'abnormal' ? 'animate-pulse' : ''}`}>{alertsByType.abnormal}</span>
                </div>
                
                <div 
                  onClick={() => handleAlertClick('trend')}
                  className={`flex items-center justify-between p-3 bg-orange-50 rounded-xl transition-all duration-300 cursor-pointer hover:bg-orange-100 ${
                  animatingType === 'trend' ? 'ring-2 ring-orange-400 ring-offset-2 animate-pulse scale-[1.02]' : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className={`w-6 h-6 text-orange-500 ${animatingType === 'trend' ? 'animate-bounce' : ''}`} />
                    <span className="text-base font-medium text-gray-900">趨勢提醒</span>
                  </div>
                  <span className={`text-2xl font-bold text-orange-600 ${animatingType === 'trend' ? 'animate-pulse' : ''}`}>{alertsByType.trend}</span>
                </div>
                
                <div 
                  onClick={() => handleAlertClick('reminder')}
                  className={`flex items-center justify-between p-3 bg-blue-50 rounded-xl transition-all duration-300 cursor-pointer hover:bg-blue-100 ${
                  (animatingType === 'reminder' || animatingType === 'follow-up') ? 'ring-2 ring-blue-400 ring-offset-2 animate-pulse scale-[1.02]' : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <Bell className={`w-6 h-6 text-blue-500 ${(animatingType === 'reminder' || animatingType === 'follow-up') ? 'animate-bounce' : ''}`} />
                    <span className="text-base font-medium text-gray-900">追蹤提醒</span>
                  </div>
                  <span className={`text-2xl font-bold text-blue-600 ${(animatingType === 'reminder' || animatingType === 'follow-up') ? 'animate-pulse' : ''}`}>{alertsByType.reminder}</span>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-500 mb-2">按優先級分布</h3>
                <div className="flex space-x-2">
                  {(['critical', 'high', 'medium', 'low'] as const).map(priority => {
                    const count = pendingAlerts.filter(a => a.priority === priority).length;
                    const info = priorityInfo[priority];
                    return (
                      <div
                        key={priority}
                        className={`flex-1 p-2 rounded-lg ${info.bgColor} text-center`}
                      >
                        <p className={`text-xl font-bold ${info.color}`}>{count}</p>
                        <p className={`text-sm ${info.color}`}>{info.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Abnormal Measurements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">近期異常量測</h2>
              
              {recentAbnormalMeasurements.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-base text-gray-500">目前沒有異常量測數據</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAbnormalMeasurements.map(measurement => {
                    const patient = patients.find(p => p.id === measurement.patientId);
                    const typeInfo = measurementTypeInfo[measurement.type];
                    
                    return (
                      <div
                        key={measurement.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <p className="text-base font-medium text-gray-900">{patient?.name}</p>
                            <p className="text-sm text-gray-500">{typeInfo.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {measurement.value.toFixed(1)}
                            {measurement.secondaryValue && `/${measurement.secondaryValue.toFixed(1)}`}
                            <span className="text-sm font-normal text-gray-500 ml-1">{measurement.unit}</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(measurement.measuredAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">模擬上傳數據</h2>
              <span className="text-sm text-gray-400 flex items-center space-x-1">
                <Play className="w-4 h-4" />
                <span>點擊觸發自動分析</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => simulateUpload('bloodPressure')}
                className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <HeartPulse className="w-8 h-8 text-blue-500 mb-1" />
                <span className="text-sm font-medium text-gray-900">上傳血壓</span>
              </button>
              <button 
                onClick={() => simulateUpload('bloodSugar')}
                className="flex flex-col items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Droplets className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-sm font-medium text-gray-900">上傳血糖</span>
              </button>
              <button 
                onClick={() => simulateUpload('temperature')}
                className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <Thermometer className="w-8 h-8 text-orange-500 mb-1" />
                <span className="text-sm font-medium text-gray-900">上傳體溫</span>
              </button>
              <button 
                onClick={() => simulateUpload('oxygenSaturation')}
                className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Activity className="w-8 h-8 text-green-500 mb-1" />
                <span className="text-sm font-medium text-gray-900">上傳血氧</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 拖動手把 */}
      <div
        onMouseDown={handleDragStart}
        className={`w-2 bg-gray-200 hover:bg-indigo-400 cursor-col-resize flex items-center justify-center transition-colors group ${
          isDragging ? 'bg-indigo-500' : ''
        }`}
      >
        <GripVertical className={`w-4 h-4 text-gray-400 group-hover:text-white transition-colors ${
          isDragging ? 'text-white' : ''
        }`} />
      </div>

      {/* 右側：AI Agent 面板 */}
      <div 
        style={{ width: `${aiPanelWidth}%` }}
        className="border-l border-gray-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 overflow-hidden flex flex-col flex-shrink-0"
      >
        <AIAgentPanel />
      </div>
    </div>
  );
};

export default Dashboard;

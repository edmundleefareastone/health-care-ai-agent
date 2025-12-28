import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AIAlert, priorityInfo } from '../types';
import { useApp } from '../context/AppContext';

interface AlertPanelProps {
  onConvertToTask?: (alert: AIAlert) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ onConvertToTask }) => {
  const { alerts, confirmAlert, dismissAlert, getPatientById } = useApp();
  
  const pendingAlerts = alerts.filter(a => a.status === 'pending')
    .sort((a, b) => {
      // 按時間由新到舊排序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getAlertTypeIcon = (type: AIAlert['type']) => {
    switch (type) {
      case 'abnormal':
        return <AlertTriangle className="w-5 h-5" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5" />;
      case 'reminder':
      case 'follow-up':
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小時前`;
    return `${Math.floor(diffMins / 1440)} 天前`;
  };

  if (pendingAlerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">目前沒有待處理的提醒</h3>
          <p className="text-gray-500">AI Agent 持續監測中，有新狀況會立即通知您</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">AI 智能提醒</h2>
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
            {pendingAlerts.length} 個待處理
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {pendingAlerts.map(alert => {
          const patient = getPatientById(alert.patientId);
          const priority = priorityInfo[alert.priority];
          
          return (
            <div
              key={alert.id}
              className={`alert-item bg-white rounded-xl shadow-sm border-l-4 overflow-hidden
                ${alert.priority === 'critical' ? 'border-l-red-500' : ''}
                ${alert.priority === 'high' ? 'border-l-orange-500' : ''}
                ${alert.priority === 'medium' ? 'border-l-yellow-500' : ''}
                ${alert.priority === 'low' ? 'border-l-green-500' : ''}
              `}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${priority.bgColor}`}>
                      <span className={priority.color}>{getAlertTypeIcon(alert.type)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">{patient?.name}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{patient?.roomNumber} 房 {patient?.bedNumber} 床</span>
                        <span className="text-gray-300">·</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${priority.bgColor} ${priority.color}`}>
                          {priority.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(alert.createdAt)}</span>
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>
                </div>

                {/* Suggestion */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-1">AI 建議</p>
                      <p className="text-sm text-blue-800">{alert.suggestion}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => confirmAlert(alert.id, '護理師小王')}
                    className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>確認</span>
                  </button>
                  <button
                    onClick={() => onConvertToTask?.(alert)}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>轉為追蹤事項</span>
                  </button>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>忽略</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertPanel;

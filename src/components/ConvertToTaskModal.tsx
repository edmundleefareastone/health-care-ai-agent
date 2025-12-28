import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AIAlert } from '../types';
import { useApp } from '../context/AppContext';

interface ConvertToTaskModalProps {
  alert: AIAlert;
  onClose: () => void;
}

const ConvertToTaskModal: React.FC<ConvertToTaskModalProps> = ({ alert, onClose }) => {
  const { convertAlertToTask, getPatientById } = useApp();
  const patient = getPatientById(alert.patientId);
  
  const [formData, setFormData] = useState({
    title: alert.title,
    description: alert.suggestion,
    assignedTo: '護理師小王',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    convertAlertToTask(alert.id, {
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      dueDate: new Date(formData.dueDate).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">轉換為追蹤事項</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Alert Info */}
        <div className="p-4 bg-blue-50 mx-4 mt-4 rounded-xl">
          <p className="text-sm text-blue-700">
            <span className="font-medium">病患：</span>{patient?.name} · {patient?.roomNumber} 房 {patient?.bedNumber} 床
          </p>
          <p className="text-sm text-blue-700 mt-1">
            <span className="font-medium">原始提醒：</span>{alert.title}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事項標題
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              詳細描述
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              指派給
            </label>
            <select
              value={formData.assignedTo}
              onChange={e => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="護理師小王">護理師小王</option>
              <option value="護理師小陳">護理師小陳</option>
              <option value="護理師小林">護理師小林</option>
              <option value="護理長張">護理長張</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期限
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              建立追蹤事項
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToTaskModal;

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Circle, 
  PlayCircle,
  User,
  Calendar,
  MessageSquare,
  Plus
} from 'lucide-react';
import { FollowUpTask } from '../types';
import { useApp } from '../context/AppContext';

interface TaskManagerProps {
  filterPatientId?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ filterPatientId }) => {
  const { tasks, updateTaskStatus, getPatientById } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  let filteredTasks = filterPatientId 
    ? tasks.filter(t => t.patientId === filterPatientId)
    : tasks;

  if (activeTab === 'pending') {
    filteredTasks = filteredTasks.filter(t => t.status !== 'completed');
  } else if (activeTab === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.status === 'completed');
  }

  const getStatusIcon = (status: FollowUpTask['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="w-5 h-5 text-gray-400" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusText = (status: FollowUpTask['status']) => {
    switch (status) {
      case 'pending':
        return '待處理';
      case 'in-progress':
        return '進行中';
      case 'completed':
        return '已完成';
    }
  };

  const handleStatusChange = (taskId: string, currentStatus: FollowUpTask['status']) => {
    const nextStatus: FollowUpTask['status'] = 
      currentStatus === 'pending' ? 'in-progress' :
      currentStatus === 'in-progress' ? 'completed' : 'completed';
    updateTaskStatus(taskId, nextStatus);
  };

  const handleSaveNotes = (taskId: string) => {
    updateTaskStatus(taskId, tasks.find(t => t.id === taskId)?.status || 'pending', notesInput);
    setEditingNotes(null);
    setNotesInput('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isOverdue = (dueDate: string, status: FollowUpTask['status']) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">追蹤事項</h2>
          </div>
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
            <Plus className="w-4 h-4" />
            <span>新增</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mt-4">
          {[
            { id: 'all' as const, label: '全部' },
            { id: 'pending' as const, label: '待處理' },
            { id: 'completed' as const, label: '已完成' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                ${activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">目前沒有追蹤事項</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredTasks.map(task => {
            const patient = getPatientById(task.patientId);
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <div key={task.id} className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleStatusChange(task.id, task.status)}
                    className="mt-0.5 hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(task.status)}
                  </button>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="flex items-center space-x-1 text-sm text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span>{patient?.name}</span>
                          </span>
                          <span className={`flex items-center space-x-1 text-sm ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{overdue ? '已逾期' : '期限'}: {formatDate(task.dueDate)}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${task.status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
                        ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : ''}
                        ${task.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {getStatusText(task.status)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mt-2">{task.description}</p>

                    {/* Notes */}
                    {task.notes && (
                      <div className="mt-2 bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-800">{task.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Add Notes */}
                    {editingNotes === task.id ? (
                      <div className="mt-2">
                        <textarea
                          value={notesInput}
                          onChange={e => setNotesInput(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="輸入備註..."
                          rows={2}
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleSaveNotes(task.id)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                          >
                            儲存
                          </button>
                          <button
                            onClick={() => { setEditingNotes(null); setNotesInput(''); }}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingNotes(task.id); setNotesInput(task.notes || ''); }}
                        className="mt-2 flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-600"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{task.notes ? '編輯備註' : '新增備註'}</span>
                      </button>
                    )}

                    {/* Assignee */}
                    <div className="mt-3 flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">指派給: {task.assignedTo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskManager;

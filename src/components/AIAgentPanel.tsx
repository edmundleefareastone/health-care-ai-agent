import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, 
  Sparkles, 
  Activity,
  MessageCircle,
  Zap,
  CheckCircle2,
  Square
} from 'lucide-react';
import { healthCareAgent, ThinkingStep, AgentAnalysisResult } from '../services/aiAgent';
import { useApp } from '../context/AppContext';

// 打字機效果 Hook
const useTypewriter = (speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fullTextRef = useRef('');
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldStopRef = useRef(false);

  const startTyping = useCallback((text: string) => {
    // 清理之前的狀態
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    fullTextRef.current = text;
    indexRef.current = 0;
    shouldStopRef.current = false;
    setDisplayedText('');
    setIsTyping(true);
    setIsComplete(false);
  }, []);

  const stopTyping = useCallback(() => {
    shouldStopRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(fullTextRef.current);
    setIsTyping(false);
    setIsComplete(true);
  }, []);

  useEffect(() => {
    if (!isTyping || shouldStopRef.current) return;

    const typeNextChar = () => {
      if (shouldStopRef.current) {
        setDisplayedText(fullTextRef.current);
        setIsTyping(false);
        setIsComplete(true);
        return;
      }

      if (indexRef.current < fullTextRef.current.length) {
        const currentChar = fullTextRef.current[indexRef.current];
        setDisplayedText(fullTextRef.current.slice(0, indexRef.current + 1));
        indexRef.current++;
        
        // 根據字元調整速度，標點符號後稍作停頓
        let delay = speed;
        if (['。', '，', '！', '？', '：', '.', ',', '!', '?', ':'].includes(currentChar)) {
          delay = speed * 4;
        } else if (['\n'].includes(currentChar)) {
          delay = speed * 6;
        }
        
        timeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
        setIsComplete(true);
      }
    };

    timeoutRef.current = setTimeout(typeNextChar, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTyping, speed]);

  return { displayedText, isTyping, isComplete, startTyping, stopTyping };
};

// 思考步驟打字機 Hook
const useThinkingStepsTypewriter = (steps: ThinkingStep[], speed: number = 20) => {
  const [visibleSteps, setVisibleSteps] = useState<ThinkingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentStepText, setCurrentStepText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const shouldStopRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAnimation = useCallback(() => {
    setVisibleSteps([]);
    setCurrentStepIndex(0);
    setCurrentStepText('');
    setIsComplete(false);
    shouldStopRef.current = false;
  }, []);

  const stopAnimation = useCallback(() => {
    shouldStopRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisibleSteps(steps);
    setIsComplete(true);
  }, [steps]);

  useEffect(() => {
    if (currentStepIndex < 0 || currentStepIndex >= steps.length || shouldStopRef.current) {
      if (currentStepIndex >= steps.length) {
        setIsComplete(true);
      }
      return;
    }

    const currentStep = steps[currentStepIndex];
    const fullStepText = `${currentStep.action}\n📊 ${currentStep.observation}\n💭 ${currentStep.reasoning}`;
    
    let charIndex = 0;
    
    const typeChar = () => {
      if (shouldStopRef.current) {
        setVisibleSteps(steps);
        setIsComplete(true);
        return;
      }

      if (charIndex < fullStepText.length) {
        const char = fullStepText[charIndex];
        setCurrentStepText(fullStepText.slice(0, charIndex + 1));
        charIndex++;
        
        let delay = speed;
        if (['。', '，', '！', '？', '：', '.', ',', '\n'].includes(char)) {
          delay = speed * 3;
        }
        
        timeoutRef.current = setTimeout(typeChar, delay);
      } else {
        // 完成當前步驟，移動到下一步
        setVisibleSteps(prev => [...prev, currentStep]);
        setCurrentStepText('');
        
        timeoutRef.current = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 300);
      }
    };
    
    timeoutRef.current = setTimeout(typeChar, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStepIndex, steps, speed]);

  return { visibleSteps, currentStepIndex, currentStepText, isComplete, startAnimation, stopAnimation };
};

const AIAgentPanel: React.FC = () => {
  const { measurements, patients, measurementVersion, addAlert, clearNewAlertType } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<AgentAnalysisResult | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [isNormalResult, setIsNormalResult] = useState<boolean | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const lastAnalyzedVersionRef = useRef(-1);
  const isInitializedRef = useRef(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // 使用打字機效果
  const { displayedText, isTyping, startTyping, stopTyping } = useTypewriter(25);
  const { 
    visibleSteps, 
    currentStepIndex, 
    currentStepText, 
    isComplete: thinkingComplete,
    startAnimation,
    stopAnimation 
  } = useThinkingStepsTypewriter(thinkingSteps, 15);

  const agentInfo = healthCareAgent.getAgentInfo();

  useEffect(() => {
    // 初始化時顯示自我介紹（帶打字效果）
    startTyping(healthCareAgent.introduce());
    isInitializedRef.current = true;
  }, []);

  // 文字更新時自動捲動到底部
  useEffect(() => {
    if (messageContainerRef.current && isTyping) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [displayedText, isTyping]);

  // 自動偵測新數據並分析
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (measurementVersion === lastAnalyzedVersionRef.current) return;
    if (measurementVersion === 0) {
      lastAnalyzedVersionRef.current = 0;
      return;
    }
    
    // 有新數據時自動分析
    if (!isAnalyzing && measurements.length > 0) {
      lastAnalyzedVersionRef.current = measurementVersion;
      // 延遲一下再開始分析，給用戶看到有新數據的提示
      const timer = setTimeout(() => {
        handleAutoAnalyze();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [measurementVersion, isAnalyzing]);

  const handleAutoAnalyze = async () => {
    if (measurements.length === 0 || patients.length === 0 || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setShowThinking(true);
    setThinkingSteps([]);
    
    // 取得最新的量測數據
    const latestMeasurement = measurements[0];
    const patient = patients.find(p => p.id === latestMeasurement.patientId);
    
    if (patient) {
      const patientMeasurements = measurements.filter(m => m.patientId === patient.id);
      
      // 先顯示偵測到新數據的訊息
      startTyping(`📡 偵測到新數據上傳！正在分析 ${patient.name} 的最新量測資料...`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await healthCareAgent.analyzeWithThinking(
        latestMeasurement,
        patient,
        patientMeasurements
      );
      
      setLatestAnalysis(result);
      setThinkingSteps(result.thinkingProcess);
      
      // 啟動思考步驟動畫
      startAnimation();
      
      // 等待思考動畫完成後，再開始打字訊息
      const thinkingDuration = result.thinkingProcess.length * 800 + 500;
      setTimeout(() => {
        if (result.alert) {
          setIsNormalResult(false);
          startTyping(healthCareAgent.generatePersonalizedSuggestion(result.alert, patient));
          // 打字完成後才觸發提醒摘要動畫（預估打字時間）
          const typingDuration = 3000; // 預估打字時間
          setTimeout(() => {
            addAlert(result.alert!);
          }, typingDuration);
        } else {
          // 正常數據時清除之前的動畫提醒
          clearNewAlertType();
          setIsNormalResult(true);
          startTyping(`✅ 分析完成！${patient.name} 的數據正常，一切正常！目前狀況良好，各項指標均正常且保持穩定。請繼續維持正常追蹤。`);
        }
      }, thinkingDuration);
    }
    
    setIsAnalyzing(false);
  };

  const handleGetStatus = () => {
    startTyping(healthCareAgent.getStatusReport());
    setShowThinking(false);
  };

  const handleStopTyping = () => {
    stopTyping();
    stopAnimation();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - 固定在最上方 */}
      <div className="p-4 border-b border-indigo-100 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900">{agentInfo.name}</h2>
                <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-2 py-0.5 rounded-full">
                  AI Agent
                </span>
              </div>
              <p className="text-sm text-gray-500">{agentInfo.role}</p>
            </div>
          </div>
          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>監控中</span>
          </span>
        </div>
      </div>

      {/* 思考過程區域 - 可滾動查看歷史 */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {/* Agent 能力標籤 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agentInfo.capabilities.slice(0, 3).map((cap, index) => (
            <span 
              key={index}
              className="text-sm bg-white text-gray-600 px-2 py-1 rounded-full border border-gray-200"
            >
              {cap}
            </span>
          ))}
        </div>

        {/* 思考過程展示 */}
        {showThinking && thinkingSteps.length > 0 && (
          <div className="bg-gradient-to-b from-slate-50 to-indigo-50 rounded-xl p-4 text-sm border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-medium text-base">AI 思考過程</span>
                {latestAnalysis && (
                  <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                    信心度: {(latestAnalysis.confidence * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              {!thinkingComplete && (
                <button
                  onClick={handleStopTyping}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>跳過</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {/* 已完成的步驟 */}
              {visibleSteps.map((step, index) => (
                <ThinkingStepItem 
                  key={index} 
                  step={step} 
                  isLast={index === thinkingSteps.length - 1 && thinkingComplete}
                  isComplete={true}
                />
              ))}
                
              {/* 當前正在打字的步驟 */}
              {currentStepIndex >= 0 && currentStepIndex < thinkingSteps.length && currentStepText && (
                <ThinkingStepTyping 
                  stepNumber={currentStepIndex + 1}
                  text={currentStepText}
                  isLast={currentStepIndex === thinkingSteps.length - 1}
                />
              )}
            </div>

            {thinkingComplete && latestAnalysis?.alert && (
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <div className="flex items-center space-x-2 text-amber-600 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium text-base">生成警示</span>
                </div>
                <p className="text-gray-700 text-base">{latestAnalysis.alert.title}</p>
              </div>
            )}

            {thinkingComplete && !latestAnalysis?.alert && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center space-x-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium text-base">分析結論</span>
                </div>
                <p className="text-green-700 text-base">✅ 數據正常，一切正常，無需警示</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部固定區域 - 訊息和狀態 */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 space-y-3">
        {/* 訊息區域 - 根據結果顯示不同背景色 */}
        <div className={`rounded-xl p-4 border transition-colors duration-500 ${
          isNormalResult === true 
            ? 'bg-green-50 border-green-200' 
            : isNormalResult === false 
              ? 'bg-orange-50 border-orange-200'
              : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isNormalResult === true 
                ? 'bg-green-100' 
                : isNormalResult === false 
                  ? 'bg-orange-100'
                  : 'bg-indigo-100'
            }`}>
              <MessageCircle className={`w-5 h-5 ${
                isNormalResult === true 
                  ? 'text-green-600' 
                  : isNormalResult === false 
                    ? 'text-orange-600'
                    : 'text-indigo-600'
              }`} />
            </div>
            <div 
              ref={messageContainerRef}
              className="flex-1 min-h-[100px] max-h-[200px] overflow-y-auto"
            >
              <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                {displayedText}
                {isTyping && (
                  <span className={`inline-block w-2 h-5 ml-0.5 animate-pulse ${
                    isNormalResult === true 
                      ? 'bg-green-500' 
                      : isNormalResult === false 
                        ? 'bg-orange-500'
                        : 'bg-indigo-500'
                  }`}></span>
                )}
              </p>
            </div>
          </div>
          {/* 停止按鈕 */}
          {isTyping && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleStopTyping}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Square className="w-3 h-3" />
                <span>停止生成</span>
              </button>
            </div>
          )}
        </div>

        {/* 自動監控狀態 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isAnalyzing ? '分析中...' : '自動監控中'}
            </span>
          </div>
          <button
            onClick={handleGetStatus}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
          >
            <Zap className="w-4 h-4" />
            <span>狀態報告</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 關鍵字高亮函數
const highlightKeywords = (text: string): React.ReactNode => {
  // 定義需要高亮的模式
  const patterns = [
    // 數值（包含單位）
    { regex: /(\d+\.?\d*\s*(?:mmHg|mg\/dL|°C|bpm|%|歲))/g, className: 'text-blue-600 font-semibold' },
    // 警示級別
    { regex: /(【critical】|【high】|【medium】|【low】|緊急|高|中|低)/g, className: 'text-red-600 font-bold' },
    // 正常狀態 - 綠色
    { regex: /(正常範圍內|數據正常|狀況良好|維持正常|穩定正常|一切正常|均正常|皆正常)/g, className: 'text-green-600 font-semibold' },
    // 異常狀態 - 橙/紅色
    { regex: /(不在正常範圍|超出正常範圍|異常|偏高|偏低|過高|過低|危險|警戒)/g, className: 'text-orange-600 font-semibold' },
    // 單獨的「正常」- 綠色
    { regex: /(?<!不|異|非)(正常)(?!範圍)/g, className: 'text-green-600 font-semibold' },
    // 趨勢描述 - 負面用紅色，正面用綠色
    { regex: /(上升趨勢|波動較大|持續偏高|持續偏低)/g, className: 'text-orange-600 font-medium' },
    { regex: /(下降趨勢|穩定|趨於穩定|保持穩定)/g, className: 'text-green-600 font-medium' },
    // 範圍數值
    { regex: /(\d+[-~]\d+)/g, className: 'text-teal-600 font-medium' },
  ];

  let result: React.ReactNode[] = [];
  let lastIndex = 0;
  let combinedRegex = new RegExp(
    patterns.map(p => `(${p.regex.source})`).join('|'),
    'g'
  );

  let match;
  let key = 0;
  const tempText = text;
  
  while ((match = combinedRegex.exec(tempText)) !== null) {
    // 添加匹配前的普通文字
    if (match.index > lastIndex) {
      result.push(tempText.slice(lastIndex, match.index));
    }
    
    // 找出是哪個模式匹配
    const matchedText = match[0];
    let className = 'text-blue-600 font-semibold'; // 預設樣式
    
    for (const pattern of patterns) {
      if (pattern.regex.test(matchedText)) {
        className = pattern.className;
        pattern.regex.lastIndex = 0; // 重置 regex
        break;
      }
    }
    
    result.push(
      <span key={key++} className={className}>
        {matchedText}
      </span>
    );
    
    lastIndex = match.index + matchedText.length;
  }
  
  // 添加剩餘的文字
  if (lastIndex < tempText.length) {
    result.push(tempText.slice(lastIndex));
  }
  
  return result.length > 0 ? result : text;
};

// 思考步驟元件 (已完成)
const ThinkingStepItem: React.FC<{ step: ThinkingStep; isLast: boolean; isComplete: boolean }> = ({ step, isLast, isComplete }) => {
  return (
    <div className="relative pl-7">
      {/* 連接線 */}
      {!isLast && (
        <div className="absolute left-2.5 top-6 w-0.5 h-full bg-indigo-200"></div>
      )}
      
      {/* 步驟指示器 */}
      <div className={`absolute left-0 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isComplete ? 'bg-indigo-500' : 'bg-gray-300'}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <span className="text-indigo-600 font-semibold text-base">Step {step.step}:</span>
          <span className="text-gray-800 font-medium text-base">{step.action}</span>
        </div>
        <p className="text-gray-600 text-sm">
          📊 {highlightKeywords(step.observation)}
        </p>
        <p className="text-gray-500 text-sm italic">
          💭 {highlightKeywords(step.reasoning)}
        </p>
      </div>
    </div>
  );
};

// 正在打字的思考步驟
const ThinkingStepTyping: React.FC<{ stepNumber: number; text: string; isLast: boolean }> = ({ stepNumber, text, isLast }) => {
  const lines = text.split('\n');
  const action = lines[0] || '';
  const observation = lines[1] || '';
  const reasoning = lines[2] || '';
  
  return (
    <div className="relative pl-7">
      {/* 連接線 */}
      {!isLast && (
        <div className="absolute left-2.5 top-6 w-0.5 h-full bg-indigo-200"></div>
      )}
      
      {/* 步驟指示器 - 動畫中 */}
      <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <span className="text-indigo-600 font-semibold text-base">Step {stepNumber}:</span>
          <span className="text-gray-800 font-medium text-base">
            {action}
            <span className="inline-block w-2 h-5 bg-indigo-500 ml-0.5 animate-pulse"></span>
          </span>
        </div>
        {observation && (
          <p className="text-gray-600 text-sm">
            {highlightKeywords(observation)}
          </p>
        )}
        {reasoning && (
          <p className="text-gray-500 text-sm italic">
            {highlightKeywords(reasoning)}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIAgentPanel;

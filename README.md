# 健康照護 AI Agent Demo

這是一個為護理人員設計的 AI 智能健康照護提醒系統 Demo。

## 功能特色

### 🤖 AI 智能提醒
- 自動分析民眾上傳的生理量測數據（血壓、血糖、心率、體溫、血氧）
- 即時檢測異常值並生成提醒
- 分析數據趨勢，提前預警
- 依據優先級（緊急、高、中、低）分類提醒

### 📋 追蹤事項管理
- 將 AI 提醒轉換為追蹤事項
- 追蹤事項狀態管理（待處理、進行中、已完成）
- 指派負責人、設定期限
- 新增備註記錄

### 👥 病患管理
- 病患列表總覽
- 快速查看病患狀態及相關提醒
- 生理數據歷史記錄

### 📊 儀表板
- 整體照護狀況摘要
- 提醒類型及優先級分布
- 近期異常量測數據
- 快速操作入口

## 技術架構

- **前端框架**: React 18 + TypeScript
- **建置工具**: Vite
- **樣式**: Tailwind CSS
- **圖標**: Lucide React
- **狀態管理**: React Context

## 安裝與執行

### 前置需求
- Node.js 18+
- npm 或 yarn

### 安裝步驟

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置正式版本
npm run build

# 預覽正式版本
npm run preview
```

## 專案結構

```
src/
├── components/          # React 元件
│   ├── AlertPanel.tsx      # AI 提醒面板
│   ├── ConvertToTaskModal.tsx # 轉換追蹤事項彈窗
│   ├── Dashboard.tsx       # 儀表板
│   ├── Header.tsx          # 頁首導航
│   ├── PatientList.tsx     # 病患列表
│   └── TaskManager.tsx     # 追蹤事項管理
├── context/             # React Context
│   └── AppContext.tsx      # 全域狀態管理
├── data/                # 模擬資料
│   └── mockData.ts         # Mock 資料
├── services/            # 服務層
│   └── aiAgentService.ts   # AI Agent 邏輯
├── types/               # TypeScript 型別定義
│   └── index.ts
├── App.tsx              # 主應用程式
├── main.tsx             # 應用程式入口
└── index.css            # 全域樣式
```

## AI Agent 邏輯說明

### 異常值檢測
AI Agent 會根據以下正常範圍檢測異常：
- **血壓**: 收縮壓 90-140 mmHg, 舒張壓 60-90 mmHg
- **血糖**: 70-140 mg/dL
- **心率**: 60-100 bpm
- **體溫**: 36.0-37.5°C
- **血氧飽和度**: 95-100%

### 優先級判定
- **緊急 (Critical)**: 危險值，需立即處理
- **高 (High)**: 明顯異常，需儘快處理
- **中 (Medium)**: 輕微異常，需注意追蹤
- **低 (Low)**: 提醒性質，定期追蹤

### 趨勢分析
分析同一病患近期數據變化，若變化幅度超過 15% 則生成趨勢提醒。

## 使用說明

1. **查看儀表板**: 了解整體照護狀況
2. **處理 AI 提醒**: 確認提醒、轉為追蹤事項或忽略
3. **管理追蹤事項**: 更新狀態、新增備註
4. **查看病患列表**: 選擇病患查看詳細資訊

## 授權

MIT License

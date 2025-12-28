# 健康照護 AI Agent Demo 開發說明

## 專案概述
這是一個為護理人員設計的 AI 智能健康照護提醒系統。

## 技術架構
- React 18 + TypeScript
- Vite (建置工具)
- Tailwind CSS (樣式)
- Lucide React (圖標)

## 重要檔案
- `src/services/aiAgentService.ts` - AI Agent 核心邏輯
- `src/context/AppContext.tsx` - 全域狀態管理
- `src/types/index.ts` - TypeScript 型別定義
- `src/data/mockData.ts` - 模擬資料

## 開發指南
- 保持元件的單一職責
- 使用 TypeScript 嚴格型別檢查
- 遵循 React Hooks 最佳實踐
- AI 邏輯應集中在 aiAgentService.ts

## 執行指令
- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建置正式版本
- `npm run lint` - 執行 ESLint 檢查

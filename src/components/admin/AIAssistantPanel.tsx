import React from 'react';

interface AIAssistantPanelProps {
  aiFeedback: string | JSX.Element;
}

export default function AIAssistantPanel({ aiFeedback }: AIAssistantPanelProps) {
  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded shadow-md mb-4">
      <h4 className="font-bold text-blue-700 mb-2">AI Assistant</h4>
      <div className="text-sm text-blue-900">{aiFeedback}</div>
    </div>
  );
} 
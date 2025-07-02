
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SettingsModalProps {
  currentTime: number;
  currentTotal: number;
  onSave: (time: number, total: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentTime, 
  currentTotal, 
  onSave, 
  onClose 
}) => {
  const [timePerQuestion, setTimePerQuestion] = useState(currentTime);
  const [totalQuestions, setTotalQuestions] = useState(currentTotal);

  const handleSave = () => {
    onSave(timePerQuestion, totalQuestions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seconds per question
            </label>
            <input
              type="number"
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              min="5"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total questions
            </label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              min="1"
              max="200"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

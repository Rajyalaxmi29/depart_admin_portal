import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stage {
  id: string;
  label: string;
  completed: boolean;
  active?: boolean;
}

interface ProgressStepsProps {
  stages: Stage[];
}

export function ProgressSteps({ stages }: ProgressStepsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4 sm:gap-0">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex sm:flex-1 items-center sm:flex-col gap-3 sm:gap-0">
          {/* Mobile: horizontal layout, Desktop: vertical centered */}
          <div className="flex items-center sm:flex-col gap-3 sm:gap-0">
            <div
              className={cn(
                'w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors flex-shrink-0',
                stage.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : stage.active
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-white border-gray-300 text-gray-400'
              )}
            >
              {stage.completed ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <p
              className={cn(
                'sm:mt-2 text-xs font-medium sm:text-center',
                stage.completed
                  ? 'text-green-600'
                  : stage.active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {stage.label}
            </p>
          </div>

          {/* Connector line - vertical on mobile, horizontal on desktop */}
          {index < stages.length - 1 && (
            <>
              {/* Mobile vertical line */}
              <div className="hidden" />
              {/* Desktop horizontal line */}
              <div className="hidden sm:flex flex-1 h-0.5 mx-2 mt-[-20px]">
                <div
                  className={cn(
                    'h-full w-full transition-colors',
                    stage.completed ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

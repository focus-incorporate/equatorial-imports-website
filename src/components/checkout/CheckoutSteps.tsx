'use client';

import { Check } from 'lucide-react';

interface Step {
  key: string;
  title: string;
  completed: boolean;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: string;
}

export default function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step.completed
                    ? 'bg-coffee-600 text-white'
                    : step.key === currentStep
                    ? 'bg-coffee-600 text-white'
                    : 'bg-cream-200 text-coffee-600'
                  }
                `}
              >
                {step.completed ? (
                  <Check size={16} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium text-center max-w-20
                  ${step.key === currentStep
                    ? 'text-coffee-900'
                    : 'text-coffee-600'
                  }
                `}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-0.5 w-12 sm:w-16 mx-2 mt-[-20px]
                  ${step.completed
                    ? 'bg-coffee-600'
                    : 'bg-cream-300'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
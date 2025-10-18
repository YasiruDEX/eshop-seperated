import React from "react";

interface Step {
  label: string;
  number: number;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                  step.number <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <p
                className={`mt-2 text-sm font-medium ${
                  step.number <= currentStep ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 -mt-8">
                <div
                  className={`h-full rounded transition-all ${
                    step.number < currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

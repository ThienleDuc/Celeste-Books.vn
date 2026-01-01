import React from 'react';

interface Step {
  id: number;
  label: string;
  icon: string;
}

interface CheckoutStepsProps {
  currentStep: number;
  steps: Step[];
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="checkout-steps mb-5">
      <div className="steps-container d-flex justify-content-between align-items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="step-item d-flex flex-column align-items-center">
            <div className={`step-icon ${currentStep >= step.id ? 'active' : ''} mb-2`}>
              <i className={`bi ${step.icon}`}></i>
            </div>
            <span className="step-label small">{step.label}</span>
            {index < steps.length - 1 && (
              <div className={`step-line ${currentStep > step.id ? 'active' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
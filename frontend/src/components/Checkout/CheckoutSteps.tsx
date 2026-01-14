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
    <div className="checkout-steps-wrapper mb-5">
      <div className="steps-container d-flex justify-content-between align-items-center position-relative">
        {steps.map((step, index) => {
          // Ép kiểu về Number để đảm bảo so sánh chính xác 100%
          const stepId = Number(step.id);
          const activeId = Number(currentStep);
          
          const isCompleted = activeId > stepId;
          const isActive = activeId === stepId;
          
          return (
            <React.Fragment key={step.id}>
              <div className="step-item d-flex flex-column align-items-center flex-grow-1" style={{ zIndex: 1 }}>
                <div 
                  className={`step-circle d-flex align-items-center justify-content-center mb-2 
                    ${isCompleted ? 'bg-success text-white' : isActive ? 'bg-primary text-white' : 'bg-light text-secondary'}`}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', transition: 'all 0.3s' }}
                >
                  {isCompleted ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    <i className={`bi ${step.icon}`}></i>
                  )}
                </div>
                <span className={`step-label small fw-bold ${isActive ? 'text-primary' : 'text-secondary'}`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-connector flex-grow-1" style={{ height: '2px', backgroundColor: '#e9ecef', margin: '0 -20px 20px -20px' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: '#198754', // Màu xanh khi hoàn thành
                      width: isCompleted ? '100%' : '0%',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
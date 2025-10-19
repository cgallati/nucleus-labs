'use client'

import React from 'react'
import { cn } from '@/utilities/cn'

export type OrderStep = 'upload' | 'material' | 'color' | 'checkout'

interface OrderStepperProps {
  currentStep: OrderStep
  className?: string
}

const steps = [
  { id: 'upload' as OrderStep, label: 'Upload File' },
  { id: 'material' as OrderStep, label: 'Choose Material' },
  { id: 'color' as OrderStep, label: 'Choose Color' },
  { id: 'checkout' as OrderStep, label: 'Checkout' },
]

export function OrderStepper({ currentStep, className }: OrderStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between max-w-4xl mx-auto px-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isUpcoming = index > currentStepIndex
          const isNotLast = index < steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-3">
                {/* Step Circle */}
                <div
                  className={cn(
                    'relative flex items-center justify-center rounded-full transition-all',
                    'w-[21px] h-[21px] border-[1.6px]',
                    {
                      'bg-[#3a3a3a] border-[#3a3a3a]': isCompleted || isCurrent,
                      'bg-white border-[#e7e7e7]': isUpcoming,
                    },
                  )}
                >
                  {isCompleted && (
                    <div className="w-[9px] h-[9px] rounded-full bg-white" />
                  )}
                  {isCurrent && (
                    <div className="w-[9px] h-[9px] rounded-full bg-white" />
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={cn(
                    'text-[19px] font-normal whitespace-nowrap transition-colors',
                    {
                      'text-[#505050]': isCompleted || isCurrent,
                      'text-[#a0a0a0]': isUpcoming,
                    },
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Connecting Line */}
              {isNotLast && (
                <div className="flex-1 h-[1.6px] mx-4 -mt-12">
                  <div
                    className={cn('h-full transition-colors', {
                      'bg-[#3a3a3a]': isCompleted,
                      'bg-[#e7e7e7]': !isCompleted,
                    })}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

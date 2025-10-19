import React from 'react'
import { OrderStepper } from '@/components/order/OrderStepper'
import { FileUpload } from '@/components/order/FileUpload'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Lab Order',
  description: 'Upload your 3D print files for fabrication at Nucleus Labs',
}

export default function NewOrderPage() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <div className="container mx-auto px-8">
        {/* Page Title */}
        <h1 className="text-[#505050] text-[25.6px] font-normal mb-16">
          New Lab Order
        </h1>

        {/* Progress Stepper */}
        <OrderStepper currentStep="upload" className="mb-24" />

        {/* File Upload Section */}
        <FileUpload />
      </div>
    </div>
  )
}

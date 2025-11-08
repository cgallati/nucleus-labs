import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Nucleus Labs - 3D Printing Services in Savannah, GA',
  description:
    'Professional 3D printing services coming soon to Savannah, GA. Serving SCAD students and the local community with high-quality Bambu Labs X1C printing.',
  openGraph: {
    title: 'Nucleus Labs - 3D Printing Services in Savannah, GA',
    description:
      'Professional 3D printing services coming soon to Savannah, GA. Serving SCAD students and the local community with high-quality Bambu Labs X1C printing.',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fafafa] to-[#f0f0f0] hide-footer">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-[56px] md:text-[72px] font-bold text-[#2a2a2a] tracking-tight mb-4">
            Nucleus Labs
          </h1>
          <div className="w-24 h-1 bg-[#3a3a3a] mx-auto rounded-full" />
        </div>

        {/* Coming Soon Badge */}
        <div className="inline-block mb-8">
          <span className="px-6 py-2 bg-[#3a3a3a] text-white text-[14px] font-medium rounded-full tracking-wide">
            COMING SOON
          </span>
        </div>

        {/* Main Message */}
        <h2 className="text-[32px] md:text-[42px] font-normal text-[#3a3a3a] mb-6 leading-tight">
          Professional 3D Printing Services
          <br />
          <span className="text-[#505050]">in Savannah, Georgia</span>
        </h2>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-4 text-[#505050] text-[18px] leading-relaxed mb-12">
          <p>
            We&apos;re bringing high-quality 3D printing to Savannah&apos;s creative community. Whether
            you&apos;re a SCAD student bringing your design projects to life or a local maker exploring
            new ideas, we&apos;re here to help.
          </p>
          <p>
            Powered by cutting-edge Bambu Labs X1C technology, we offer precision printing with a
            wide range of materials and colors. Upload your files, choose your specifications, and
            let us handle the rest.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-[#3a3a3a] rounded-lg mx-auto flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h3 className="text-[#3a3a3a] font-medium text-[16px]">Fast Turnaround</h3>
            <p className="text-[#707070] text-[14px]">
              Quick processing and printing for your urgent projects
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-[#3a3a3a] rounded-lg mx-auto flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-[#3a3a3a] font-medium text-[16px]">Multiple Materials</h3>
            <p className="text-[#707070] text-[14px]">
              PLA, ABS, PETG, and more with various color options
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-[#3a3a3a] rounded-lg mx-auto flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-[#3a3a3a] font-medium text-[16px]">Transparent Pricing</h3>
            <p className="text-[#707070] text-[14px]">
              Instant cost estimates based on your file specifications
            </p>
          </div>
        </div>

        {/* Location Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-[1.9px] border-[#e7e7e7] rounded-full">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#505050"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[#505050] text-[14px] font-medium">
            Proudly serving Savannah, GA
          </span>
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-[#e7e7e7]">
          <p className="text-[#a0a0a0] text-[14px]">
            © 2025 Nucleus Labs. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

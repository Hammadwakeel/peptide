import Image from "next/image";
import { Database, LayoutDashboard, Bell, Workflow } from "lucide-react";

export function SeamlessIntegration() {
  return (
    <section className="bg-pure-white py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-0">
        
        {/* Header: Left Aligned */}
        <div className="mb-20 px-4 lg:px-0">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-pacific-teal">
            Seamless Integration
          </span>
          <h2 className="mt-4 font-serif text-5xl font-light text-deep-teal md:text-7xl">
            Integration that respects<br />your workflow.
          </h2>
        </div>

        {/* Bento Grid: 3 columns */}
        <div className="grid gap-6 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-0">
          
          {/* Top Left Card: Wrapped content to make it look less wide */}
          <div className="rounded-[2rem] bg-[#E6F0EE] p-8">
            <div className="max-w-[90%]">
              <Database className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">API-First Architecture</h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">Sync verification data directly with existing EHR, EMR, and clinical systems.</p>
            </div>
          </div>

          {/* Center Image */}
          <div className="relative row-span-2 hidden lg:block overflow-hidden rounded-[2rem] shadow-2xl">
            <Image
              src="/brand/product-mobile-dashboard.png"
              alt="Dashboard"
              fill
              className="object-cover"
            />
          </div>

          {/* Top Right Card */}
          <div className="rounded-[2rem] bg-[#F3EFE9] p-8">
            <div className="max-w-[90%]">
              <LayoutDashboard className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">Unified Dashboard</h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">One interface for verification, traceability, and operational oversight.</p>
            </div>
          </div>

          {/* Bottom Left Card */}
          <div className="rounded-[2rem] bg-[#E8EEF2] p-8">
            <div className="max-w-[90%]">
              <Bell className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">Proactive Alerts</h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">Receive instant notifications when batches reach critical verification milestones.</p>
            </div>
          </div>

          {/* Bottom Right Card */}
          <div className="rounded-[2rem] bg-[#F2F4F7] p-8">
            <div className="max-w-[90%]">
              <Workflow className="h-8 w-8 text-deep-teal" />
              <h3 className="mt-6 font-serif text-2xl text-deep-teal">Workflow Continuity</h3>
              <p className="mt-3 text-sm leading-7 text-deep-teal/70">Deploy without disrupting practitioners, inventory systems, or existing processes.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
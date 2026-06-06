import Image from "next/image";

const metrics = [
  {
    value: "99.97%",
    label: "Purity Verification Rate",
    description: "Every molecular batch undergoes multi-stage verification before release.",
    bg: "bg-[#E6F0EE]",
  },
  {
    value: "24/7",
    label: "Batch Traceability",
    description: "Complete chain-of-custody visibility from synthesis to practitioner delivery.",
    bg: "bg-[#F3EFE9]",
  },
  {
    value: "3x",
    label: "Validation Layers",
    description: "Independent verification protocols eliminate single-point failure.",
    bg: "bg-[#E8EEF2]",
  },
  {
    value: "100%",
    label: "Domestic Workflow",
    description: "Controlled verification and documentation within a single ecosystem.",
    bg: "bg-[#F2F4F7]",
  },
];

export function StandardsOfTrust() {
  return (
    <section className="bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20 xl:px-28">
        
        {/* Header Section */}
        <div className="mb-16 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-pacific-teal">
            Standards of Trust
          </span>
          <h2 className="mt-3 font-serif text-5xl font-light leading-[1.05] tracking-[-0.03em] text-deep-teal md:text-6xl lg:text-7xl">
            Proven by standard.<br />Backed by data.
          </h2>
        </div>

        {/* Image + Metrics Grid Layout */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          
          {/* Left Side: Image */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
            <Image
              src="/brand/campaign-supply-layer-banner.png"
              alt="Supply chain layer visualization"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right Side: Metrics Grid (2x2) */}
          <div className="grid gap-8 md:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={`group rounded-[2.5rem] border border-deep-teal/5 ${metric.bg} p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]`}
              >
                <div className="font-serif text-5xl font-light leading-none tracking-[-0.04em] text-deep-teal">
                  {metric.value}
                </div>
                <div className="mt-6 h-px w-16 bg-deep-teal/20" />
                <h3 className="mt-6 font-serif text-2xl font-light text-deep-teal">
                  {metric.label}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-deep-teal/75">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
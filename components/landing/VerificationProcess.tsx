function AnalysisIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="#1C6384" />
        <circle cx="12" cy="12" r="4" fill="#0D7177" fillOpacity="0.3" />
        <circle cx="12" cy="12" r="2" fill="#ffffff" fillOpacity="0.2" />
      </svg>
    );
  }
  
  function SynthesisIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M9 4h6v3l3.5 6.5A5.5 5.5 0 0 1 13.6 20h-3.2A5.5 5.5 0 0 1 5.5 13.5L9 7V4Z"
          fill="#1C6384"
        />
        <path
          d="M8 13h8v3a3.5 3.5 0 0 1-3.5 3.5h-1A3.5 3.5 0 0 1 8 16v-3Z"
          fill="#0D7177"
          fillOpacity="0.3"
        />
      </svg>
    );
  }
  
  function CertificationIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M12 3 19 6v5c0 5.2-3.1 8.5-7 10-3.9-1.5-7-4.8-7-10V6l7-3Z"
          fill="#1C6384"
        />
        <path
          d="M12 7 16 9v3.5c0 2.8-1.7 4.8-4 5.9-2.3-1.1-4-3.1-4-5.9V9l4-2Z"
          fill="#0D7177"
          fillOpacity="0.3"
        />
      </svg>
    );
  }
  
  const steps = [
    {
      number: "01",
      title: "Raw Bond Analysis",
      description:
        "Automated spectroscopic analysis identifies contaminants at the molecular level before synthesis begins.",
      icon: AnalysisIcon,
      bg: "bg-[#BFE6E0]",
      iconBg: "bg-white/80",
    },
    {
      number: "02",
      title: "Controlled Synthesis",
      description:
        "Our domestic, proprietary synthesis environment eliminates variables introduced by international shipping.",
      icon: SynthesisIcon,
      bg: "bg-[#F2CCCC]",
      iconBg: "bg-white/80",
    },
    {
      number: "03",
      title: "Blockchain Certification",
      description:
        "Every batch receives an immutable digital certificate, verifiable by the practitioner in real-time.",
      icon: CertificationIcon,
      bg: "bg-[#D7E0EA]",
      iconBg: "bg-white/80",
    },
  ];
  
  export function VerificationProcess() {
    return (
      <section className="bg-pure-white py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20 xl:px-28">
          
          {/* Header */}
          <div className="max-w-5xl">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-pacific-teal">
              Verification Process
            </span>
  
            <h2 className="mt-3 font-serif text-5xl font-light leading-[1.05] tracking-[-0.03em] text-deep-teal md:text-6xl lg:text-7xl">
              Precision-engineered
              <br />
              verification at every stage.
            </h2>
  
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-deep-teal/70 lg:text-xl">
              We don't just test the final product. We certify the entire
              molecular lifecycle from analysis through practitioner
              verification.
            </p>
          </div>
  
          {/* Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
  
              return (
                <div
                  key={step.number}
                  className={`group relative overflow-hidden rounded-[2rem] border border-deep-teal/10 ${step.bg} p-7 lg:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]`}
                >
                  {/* Decorative Glow */}
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/30 blur-3xl" />
  
                  {/* Step Number */}
                  <div className="font-serif text-6xl font-light leading-none text-deep-teal/15">
                    {step.number}
                  </div>
  
                  {/* Icon */}
                  <div
                    className={`mt-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.iconBg} backdrop-blur-sm`}
                  >
                    <Icon />
                  </div>
  
                  {/* Title */}
                  <h3 className="mt-5 font-serif text-2xl font-light text-deep-teal">
                    {step.title}
                  </h3>
  
                  {/* Description */}
                  <p className="mt-3 text-sm leading-7 text-deep-teal/75">
                    {step.description}
                  </p>
  
                  {/* Divider */}
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-[#1C6384]/40 to-transparent" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
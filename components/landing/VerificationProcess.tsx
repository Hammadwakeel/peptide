const steps = [
    {
      number: "01",
      title: "Raw Bond Analysis",
      description:
        "Automated spectroscopic analysis identifies contaminants at the molecular level before synthesis begins.",
      bg: "bg-[#E6F0EE]", // Adjusted to match the soft green tone in the reference
    },
    {
      number: "02",
      title: "Controlled Synthesis",
      description:
        "Our domestic, proprietary synthesis environment eliminates variables introduced by international shipping.",
      bg: "bg-[#E6F0EE]",
    },
    {
      number: "03",
      title: "Blockchain Certification",
      description:
        "Every batch receives an immutable digital certificate, verifiable by the practitioner in real-time.",
      bg: "bg-[#E6F0EE]",
    },
  ];
  
  export function VerificationProcess() {
    return (
      <section className="bg-pure-white py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20 xl:px-28">
          
          {/* Header */}
          <div className="max-w-5xl">
            <span className="inline-block rounded-full bg-[#E6F0EE] px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#1C6384]">
              Verification Process
            </span>
            <h2 className="mt-6 font-serif text-5xl font-light leading-[1.05] tracking-[-0.03em] text-deep-teal md:text-6xl lg:text-7xl">
              Precision-engineered<br />verification.
            </h2>
          </div>
  
          {/* Cards */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col rounded-[2rem] ${step.bg} p-10 transition-all duration-300 hover:shadow-lg`}
              >
                {/* Step Number at top right */}
                <div className="self-end font-mono text-xl text-[#1C6384]/60">
                  {step.number}
                </div>
  
                {/* Title & Description */}
                <div className="mt-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl font-light text-deep-teal">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-deep-teal/70">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
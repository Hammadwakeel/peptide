import Link from "next/link";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="flex min-h-[calc(100vh-80px)] items-start bg-pure-white font-sans text-deep-teal pt-0 pb-8">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-12">
          
          {/* Left Panel - Larger */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="rounded-[2rem] bg-pacific-teal p-12 shadow-xl lg:p-16">
              <h1 className="font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] text-pure-white lg:text-5xl xl:text-[3.5rem]">
                The molecule arrives verified.
                <br />
                Or it doesn&apos;t arrive.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-pure-white/90">
                For pharmacies and practitioners who need unconditional trust,
                Frontier Biomed verifies purity at every bond, domestic by
                design.
              </p>
            </div>

            <Link
              href="/login"
              className="group flex w-full items-center justify-between rounded-[2rem] bg-deep-teal px-10 py-8 shadow-lg transition-transform hover:scale-[1.01] hover:bg-deep-teal/95"
            >
              <span className="text-xl font-medium text-pure-white lg:text-2xl">
                Partner Portal
              </span>

              <ArrowRightIcon className="h-8 w-8 text-pure-white transition-transform group-hover:translate-x-2" />
            </Link>
          </div>

          {/* Right Panel */}
          <div className="flex justify-center lg:col-span-6">
            <div className="relative h-[600px] w-[400px] overflow-hidden rounded-[2rem] border-4 border-deep-teal bg-deep-teal shadow-2xl">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source
                  src="/Smooth_animation_of_the_green.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
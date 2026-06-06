import Image from "next/image";
import Link from "next/link";

export function ClinicalCommitment() {
  return (
    <section className="bg-pure-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
          
          {/* Content (Left) */}
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-pacific-teal">
              Clinical Commitment
            </span>
            {/* Reduced heading sizes */}
            <h2 className="mt-4 font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] text-deep-teal md:text-4xl lg:text-5xl">
              Trusted by people,<br />not just protocols.
            </h2>
            {/* Reduced paragraph sizes */}
            <p className="mt-8 font-serif text-lg font-light leading-relaxed text-deep-teal/80 lg:text-xl">
              Verification is more than a technical process. It is a commitment 
              to practitioners, patients, and every decision that depends on 
              molecular certainty.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-flex items-center rounded-full bg-deep-teal px-8 py-4 text-sm font-medium text-pure-white transition-all hover:bg-deep-teal/90"
            >
              Partner Portal
            </Link>
          </div>

          {/* Collage Grid (Right) */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-4 h-[600px]">
            {/* 1st Image: Large Portrait */}
            <div className="col-span-4 relative overflow-hidden rounded-3xl">
              <Image src="/brand/humanised-man-blue-sky-portrait.png" alt="Man Blue Sky" fill className="object-cover" />
            </div>

            {/* Right Column Group */}
            <div className="col-span-8 grid grid-rows-2 gap-4">
              {/* 2nd Image: Top Wide */}
              <div className="row-span-1 relative overflow-hidden rounded-3xl">
                <Image src="/brand/humanised-woman-phone-lifestyle.png" alt="Phone Lifestyle" fill className="object-cover" />
              </div>
              
              {/* Bottom Section */}
              <div className="row-span-1 grid grid-cols-6 gap-4">
                {/* 3rd Image: Left Small */}
                <div className="col-span-2 relative overflow-hidden rounded-3xl">
                  <Image src="/brand/humanised-woman-gold-glitter.png" alt="Gold Glitter" fill className="object-cover" />
                </div>
                
                {/* 4th, 5th, and 6th Images Group */}
                <div className="col-span-4 grid grid-rows-2 gap-4">
                  {/* 4th and 5th Side-by-Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden rounded-3xl"><Image src="/brand/humanised-man-laughing-portrait.png" alt="Laughing Man" fill className="object-cover" /></div>
                    <div className="relative overflow-hidden rounded-3xl"><Image src="/brand/humanised-woman-braids-laughing.png" alt="Braids Laughing" fill className="object-cover" /></div>
                  </div>
                  {/* 6th Image Underneath */}
                  <div className="relative overflow-hidden rounded-3xl">
                    <Image src="/brand/humanised-woman-serene-clouds.png" alt="Serene Clouds" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
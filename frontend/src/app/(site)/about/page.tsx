'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Sprout, Award } from 'lucide-react';

const VALUES = [
  {
    icon: <Heart className="text-rose" size={24} />,
    title: 'Sisterhood First',
    desc: 'Our designs reflect true friendships and sisterly care. Every stitch is made to comfort, protect, and empower you.',
  },
  {
    icon: <Sparkles className="text-rose" size={24} />,
    title: 'Effortless Style',
    desc: 'Transition smoothly from a busy workday to a relaxing sundown. Designs that adapt to your schedule, not the other way around.',
  },
  {
    icon: <Sprout className="text-rose" size={24} />,
    title: 'Ethical & Pure',
    desc: 'Stitched in small family-run Indian boutiques. We select premium grade cottons and plant-based dyes for durable wearing.',
  },
  {
    icon: <Award className="text-rose" size={24} />,
    title: 'Uncompromising Quality',
    desc: 'We construct garments designed to last years, featuring flat-lock inside seams and reinforced double linings.',
  },
];

export default function AboutPage() {
  return (
    <div className="w-full relative py-12 md:py-20 overflow-hidden">
      
      {/* BACKGROUND FLOATING DECOR */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blush/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-soft-pink/30 rounded-full blur-3xl -z-10" />

      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block px-4 py-1 bg-blush/55 rounded-full text-[10px] tracking-[0.2em] font-semibold text-mid uppercase mb-4"
        >
          Our Story
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-playfair text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
        >
          Built on Sisterhood, <br />
          Comfort, and <span className="font-caveat text-rose text-5xl sm:text-7xl normal-case">Stories.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="text-sm sm:text-base text-mid max-w-xl mx-auto mt-6 leading-relaxed font-medium"
        >
          We are the wardrobe upgrade you write about to your best friend. A premium label designed for every phase of the Indian girl.
        </motion.p>
      </div>

      {/* DETAILED NARRATIVE WITH IMAGES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Visual blocks */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-border-custom/25 bg-cream">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=500&auto=format&fit=crop"
                alt="About behencode"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-border-custom/25 bg-cream">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=500&auto=format&fit=crop"
                alt="About behencode"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-border-custom/25 bg-cream">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=500&auto=format&fit=crop"
                alt="About behencode"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-border-custom/25 bg-cream">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop"
                alt="About behencode"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-border-custom max-w-[180px] hidden md:block">
            <p className="font-caveat text-xl text-rose font-bold text-center">where she is free to be all of her ♡</p>
          </div>
        </div>

        {/* Narrative Content */}
        <div className="lg:col-span-6 space-y-6">
          <p className="font-caveat text-2xl text-rose font-semibold">How it all started</p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From late night conversations to a premium fashion label.
          </h2>
          
          <div className="space-y-4 text-xs sm:text-sm text-mid leading-relaxed font-medium">
            <p>
              Behencode was born in a small bedroom shared by two sisters (behens) who were tired of choosing between high-priced fast-fashion that wore out in two washes, and uncomfortable, scratchy ethnic wear that only suited festive holidays.
            </p>
            <p>
              We asked: <em>Why can&apos;t premium everyday clothing be both breathable, beautifully designed, and fit the modern Indian female silhouette perfectly?</em>
            </p>
            <p>
              We began sketching. We visited textile weavers in Gujarat, block printers in Jaipur, and stitching boutiques in Delhi. By focusing on 100% natural fibers, flat-lock seams, and curated color palettes, we created a collection that speaks directly to our sisters.
            </p>
            <p>
              Today, Behencode stands as a testament to the power of sisterhood. When you buy a dress, a peplum crop, or bell-bottoms from us, you aren&apos;t just buying clothes—you are joining a family of modern, free, and beautiful Indian girls.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-cream border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
                alt="Founders"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-playfair text-sm font-bold text-foreground">Rhea & Meher</p>
              <p className="text-[10px] uppercase tracking-wider text-light-brown font-semibold">Sisters & Founders</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-cream/40 border-t border-b border-border-custom/30 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-caveat text-2xl text-rose mb-1">Our Core Pillars</p>
            <h2 className="font-playfair text-3xl font-bold tracking-wide text-foreground">
              What We Believe In
            </h2>
            <div className="w-16 h-0.5 bg-rose mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val, idx) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-background rounded-2xl p-6 border border-border-custom/30 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all"
              >
                <div className="p-3.5 bg-soft-pink rounded-full">
                  {val.icon}
                </div>
                <h3 className="font-playfair text-base font-bold text-foreground">
                  {val.title}
                </h3>
                <p className="text-xs text-mid leading-relaxed font-medium">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 text-center px-4 max-w-xl mx-auto">
        <h2 className="font-playfair text-3xl font-bold text-foreground">Ready to upgrade your closet?</h2>
        <p className="text-xs text-light-brown mt-3 leading-relaxed mb-8">
          Explore our newest arrivals and find pieces built on pure comfort, love, and quality.
        </p>
        <button className="bg-rose text-white text-xs tracking-widest font-semibold px-8 py-4 rounded-full hover:bg-mid hover:shadow-lg transition-all duration-300">
          <Link href="/shop">SHOP THE ARRIVALS</Link>
        </button>
      </section>

    </div>
  );
}

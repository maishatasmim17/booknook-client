"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { BookOpen, Sparkles, Compass, ArrowRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export function HeroSlider() {
  const slides = [
    {
      id: 1,
      badge: "Curated Collection",
      title: "Step into the Sanctum of Timeless Stories",
      description:
        "Explore centuries of wisdom, gripping literary masterpieces, and cutting-edge discoveries, all available to borrow in a single click.",
      ctaPrimary: { label: "Browse Books", href: "/books" },
      ctaSecondary: { label: "Join BookNook", href: "/register" },
      bgGradient: "from-amber-950 via-neutral-900 to-black",
      accentColor: "text-amber-400",
      icon: BookOpen,
      image:
        "https://images.unsplash.com/photo-1507842229451-77b103b1b366?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      badge: "Seamless Borrowing",
      title: "Borrow Instantly, Read Without Limits",
      description:
        "Manage your personal reading list, monitor due dates in real-time, and return books seamlessly from your member dashboard.",
      ctaPrimary: { label: "Browse Books", href: "/books" },
      ctaSecondary: { label: "Browse Genres", href: "/books" },
      bgGradient: "from-emerald-950 via-neutral-900 to-black",
      accentColor: "text-emerald-400",
      icon: Compass,
      image:
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 3,
      badge: "Community of Readers",
      title: "A Cozy Digital Haven for Every Book Lover",
      description:
        "Discover hidden gems, contribute community reviews, and find your next unforgettable journey nestled in our stacks.",
      ctaPrimary: { label: "Browse Books", href: "/books" },
      ctaSecondary: { label: "Start Reading", href: "/books" },
      bgGradient: "from-stone-900 via-neutral-900 to-amber-950",
      accentColor: "text-amber-300",
      icon: Sparkles,
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        speed={800}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={true}
        className="h-[460px] sm:h-[500px] lg:h-[540px] w-full"
      >
        {slides.map((slide) => {
          const Icon = slide.icon;
          return (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full w-full">
                {/* Background Image with Dark Vignette */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90 backdrop-blur-[2px]`}
                />

                {/* Content Overlay */}
                <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-12 lg:px-16 text-white">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-md border border-white/15">
                      <Icon className={`h-3.5 w-3.5 ${slide.accentColor}`} />
                      <span>{slide.badge}</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                      {slide.title}
                    </h1>

                    <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                      {slide.description}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Link
                        href={slide.ctaPrimary.href}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-500 hover:scale-105"
                      >
                        <span>{slide.ctaPrimary.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href={slide.ctaSecondary.href}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                      >
                        <span>{slide.ctaSecondary.label}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}


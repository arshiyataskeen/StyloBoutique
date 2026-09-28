"use client";

import { useRef } from "react";
import MagneticLink from "@/components/public/MagneticLink";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import type { SiteSettingsDTO } from "@/lib/types";
import Photo from "@/components/public/Photo";

const headingVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: "100%" },
  show: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero({ settings }: { settings: SiteSettingsDTO }) {
  const isVideo = settings.heroMediaType === "Video" && settings.heroVideoUrl;
  const posterUrl = settings.heroPosterUrl || undefined;
  const imageUrl = settings.heroImageUrl || posterUrl;
  const words = settings.heroHeading.split(" ");

  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const blobOneX = useTransform(springX, [-0.5, 0.5], [-24, 24]);
  const blobOneY = useTransform(springY, [-0.5, 0.5], [-16, 16]);
  const blobTwoX = useTransform(springX, [-0.5, 0.5], [18, -18]);
  const blobTwoY = useTransform(springY, [-0.5, 0.5], [12, -12]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative isolate flex min-h-[88svh] items-center overflow-hidden border-b border-border/80 bg-neutral-900"
    >
      <motion.div
        aria-hidden
        style={{ y: mediaY, scale: mediaScale }}
        className="absolute inset-0 -z-20 motion-reduce:!transform-none"
      >
        {isVideo ? (
          <>
            <video
              className="h-full w-full object-cover motion-reduce:hidden"
              src={settings.heroVideoUrl!}
              poster={posterUrl}
              autoPlay
              loop
              muted
              playsInline
            />
            {posterUrl && (
              <Photo
                src={posterUrl}
                alt=""
                fit="full"
                priority
                className="hidden object-cover motion-reduce:block"
              />
            )}
          </>
        ) : imageUrl ? (
          // The first thing anyone sees on the site — never lazy.
          <Photo
            src={imageUrl}
            alt=""
            fit="full"
            priority
            className="object-cover motion-reduce:animate-none"
            style={{ animation: "ken-burns 20s ease-out forwards" }}
          />
        ) : null}
      </motion.div>

      {/* layered ambient glow */}
      <motion.div
        aria-hidden
        style={{ x: blobOneX, y: blobOneY }}
        className="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-accent/30 blur-3xl motion-reduce:!transform-none"
      />
      <motion.div
        aria-hidden
        style={{ x: blobTwoX, y: blobTwoY }}
        className="pointer-events-none absolute -bottom-32 right-0 -z-10 h-96 w-96 rounded-full bg-white/10 blur-3xl motion-reduce:!transform-none"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/70 to-black/55" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="mx-auto flex w-full max-w-6xl flex-col items-start px-5 py-12 motion-reduce:!transform-none motion-reduce:!opacity-100 sm:py-16"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs uppercase tracking-[0.2em] text-accent sm:text-sm"
        >
          {settings.heroTagline}
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={headingVariants}
          className="max-w-2xl font-serif text-3xl leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          {words.map((word, i) => (
            <span key={i} className="mr-[0.3em] inline-block overflow-hidden last:mr-0">
              <motion.span variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-5 max-w-lg text-base text-white/85 sm:mt-6 sm:text-lg"
        >
          {settings.heroSubheading}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex w-full flex-wrap gap-3 sm:w-auto sm:gap-4"
        >
          <MagneticLink
            href="/catalog"
            className="block rounded-full bg-white px-6 py-3 text-center text-sm text-black"
          >
            Explore the Catalog
          </MagneticLink>
          <MagneticLink
            href="/book"
            className="block rounded-full border border-white/40 px-6 py-3 text-center text-sm text-white transition-colors hover:border-accent hover:text-accent"
          >
            Book a Fitting
          </MagneticLink>
        </motion.div>
      </motion.div>

    </section>
  );
}

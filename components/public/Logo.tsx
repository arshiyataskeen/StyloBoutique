import { cn } from "@/lib/utils";

export default function Logo({
  src,
  alt = "Stylo Tailor",
  className,
  imgClassName,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  if (src) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={cn("h-9 w-auto object-contain sm:h-11", imgClassName)} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-9 sm:w-9">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" className="h-full w-full object-cover" />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-serif text-xl font-semibold leading-none text-foreground sm:text-2xl">Stylo</span>
        <span className="text-[9px] font-medium uppercase leading-none tracking-[0.2em] text-accent sm:text-[10px]">
          Tailor
        </span>
      </span>
    </span>
  );
}

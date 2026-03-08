"use client";

import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <Image
        src="/branding/rocketping-mark.svg"
        alt="RocketPing"
        width={36}
        height={36}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/branding/rocketping-wordmark.svg"
      alt="RocketPing"
      width={260}
      height={70}
      className={className}
      priority
    />
  );
}

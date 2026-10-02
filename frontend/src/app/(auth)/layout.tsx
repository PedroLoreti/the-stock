"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BoxesIcon, ReceiptTextIcon, ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

const HIGHLIGHTS = [
  { icon: BoxesIcon, text: "Stock that updates itself with every sale and entry" },
  { icon: ReceiptTextIcon, text: "Point of sale with a full history and safe cancellations" },
  { icon: ShieldCheckIcon, text: "Roles for sellers, management and administrators" },
];

/**
 * Split-screen auth layout. On large screens the brand panel sits on the right for the
 * login and slides to the left for the password step; the form slides the other way.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const panelOnLeft = pathname === "/change-password";

  return (
    <div className="relative flex min-h-screen flex-1 overflow-hidden bg-background">
      {/* Brand panel (desktop only) */}
      <aside
        aria-hidden
        className={cn(
          "absolute inset-y-0 hidden w-1/2 transition-[left] duration-700 ease-in-out lg:block",
          panelOnLeft ? "left-0" : "left-1/2",
        )}
      >
        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#07210c] p-12 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(60% 50% at 20% 10%, rgba(69,186,80,0.55) 0%, rgba(69,186,80,0) 70%), radial-gradient(50% 45% at 85% 90%, rgba(69,186,80,0.35) 0%, rgba(69,186,80,0) 70%), linear-gradient(160deg, #0a2d11 0%, #07210c 55%, #041607 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(80% 80% at 50% 50%, black 40%, transparent 100%)",
            }}
          />

          <div className="relative">
            <BrandMark className="text-white" />
          </div>

          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
                Inventory and sales, in one place.
              </h2>
              <p className="max-w-md text-base text-white/70">
                Register sales, keep stock levels honest and know what needs restocking before it runs out.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <item.icon className="size-4 text-[#7fe08a]" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/50">The Stock · inventory and sales management</p>
        </div>
      </aside>

      {/* Form column */}
      <div
        className={cn(
          "flex min-h-screen w-full flex-col lg:w-1/2 lg:transition-[margin] lg:duration-700 lg:ease-in-out",
          panelOnLeft ? "lg:ml-[50%]" : "lg:ml-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <BrandMark className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div
            key={pathname}
            className={cn(
              "auth-form w-full max-w-sm animate-in fade-in-0 duration-500",
              panelOnLeft ? "slide-in-from-right-6" : "slide-in-from-left-6",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

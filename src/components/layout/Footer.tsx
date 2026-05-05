"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] py-8 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-[#eeeef2]">FitFlow</h3>
            <p className="text-sm text-[#636380]">
              Free fitness planning. No paywalls. Built for athletes and
              coaches.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#eeeef2]">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/guides"
                  className="text-[#636380] hover:text-cyan-300 transition"
                >
                  Guides & Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="text-[#636380] hover:text-cyan-300 transition"
                >
                  Calculators
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="text-[#636380] hover:text-cyan-300 transition"
                >
                  Exercise Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#eeeef2]">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-[#636380] hover:text-cyan-300 transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[#636380] hover:text-cyan-300 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#636380] hover:text-cyan-300 transition"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#eeeef2]">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hello@fitflow.com"
                  className="text-[#636380] hover:text-cyan-300 transition flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row text-xs text-[#636380]">
            <p>© {currentYear} FitFlow. Built with ❤️ for serious athletes.</p>
            <p>Fully free • No premium paywall • Open source friendly</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

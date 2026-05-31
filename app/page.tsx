"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Award, 
  Lock, 
  Phone, 
  MapPin, 
  Camera, 
  X, 
  AlertTriangle, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  // Scanner Modal state
  const [showScanner, setShowScanner] = React.useState(false);
  const [scannerError, setScannerError] = React.useState<string | null>(null);
  const scannerRef = React.useRef<any>(null);

  // Guide Collapsible state
  const [showGuide, setShowGuide] = React.useState(true);

  // Dynamically import and run html5-qrcode
  React.useEffect(() => {
    let html5QrCodeInstance: any = null;

    if (showScanner) {
      setScannerError(null);
      
      // Dynamic import to prevent Server-Side Rendering (SSR) issues
      import("html5-qrcode").then((module) => {
        try {
          html5QrCodeInstance = new module.Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCodeInstance;

          html5QrCodeInstance.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText: string) => {
              console.log("QR Code Scanned:", decodedText);
              
              // Handle URL parsing
              try {
                const parsedUrl = new URL(decodedText);
                const qrIdParam = parsedUrl.searchParams.get("qr_id");
                const urlParam = parsedUrl.searchParams.get("url");

                if (qrIdParam && urlParam) {
                  // Stop scanning and redirect
                  html5QrCodeInstance.stop().then(() => {
                    setShowScanner(false);
                    router.push(`/verify?qr_id=${qrIdParam}&url=${urlParam}`);
                  }).catch((err: any) => {
                    console.error("Failed to stop scanner:", err);
                    setShowScanner(false);
                    router.push(`/verify?qr_id=${qrIdParam}&url=${urlParam}`);
                  });
                } else {
                  setScannerError("The scanned QR code is not a valid Sualkuchi Silk Tag URL.");
                }
              } catch (urlErr) {
                // Check if they scanned a raw ID
                if (decodedText.includes("-") && decodedText.length >= 10) {
                  setScannerError("Scanned a raw ID code. Please scan the QR tag URL on your product.");
                } else {
                  setScannerError("Invalid QR Code format. Please scan a Sualkuchi Silk Lab Tag.");
                }
              }
            },
            (errorMessage: string) => {
              // verbose logging ignored to avoid console noise
            }
          ).catch((err: any) => {
            console.error("Camera startup failed:", err);
            setScannerError("Could not access environment camera. Please allow camera permissions and try again.");
          });

        } catch (initErr) {
          console.error("Scanner init error:", initErr);
          setScannerError("Failed to initialize QR code reader.");
        }
      });
    }

    return () => {
      if (html5QrCodeInstance && html5QrCodeInstance.isScanning) {
        html5QrCodeInstance.stop().catch((e: any) => console.log("Cleanup stop error:", e));
      }
    };
  }, [showScanner, router]);

  const closeScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setShowScanner(false);
      }).catch((err: any) => {
        console.error("Error stopping scanner on close:", err);
        setShowScanner(false);
      });
    } else {
      setShowScanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-[#00205b] selection:text-white">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center p-0.5 border border-slate-200/50 overflow-hidden shrink-0">
              <img
                src="/sstllogo.jpg"
                alt="SSTL Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-sans font-black leading-none text-[#00205b]">
                Sualkuchi Silk
              </h1>
              <p className="text-[#cbae6c] font-sans text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-1">
                Testing Laboratory Portal
              </p>
            </div>
          </div>
          <Link
            id="admin-portal-link"
            href="/admin"
            className="flex items-center gap-1.5 h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition duration-150 active:scale-95 border border-slate-200/40"
          >
            <Lock className="w-3 h-3 text-[#cbae6c]" />
            <span>Admin Login</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center gap-8">
        
        {/* Intro */}
        <div className="text-center space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">
            <Award className="w-3.5 h-3.5 text-[#cbae6c]" />
            <span>Sualkuchi Silk Product Verification System</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-black text-[#00205b] tracking-tight">
            Verify Silk Authenticity
          </h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            Scan the QR code on your product's laboratory tag using your device's camera to instantly verify its pure certified status.
          </p>
        </div>

        {/* Scanner Trigger Button */}
        <div className="w-full max-w-md">
          <button
            id="open-camera-scanner-button"
            onClick={() => setShowScanner(true)}
            className="w-full h-14 bg-gradient-to-r from-[#00205b] to-[#012d7c] hover:from-[#012d7c] hover:to-[#023fae] text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-3 shadow-lg shadow-[#00205b]/10 active:scale-[0.98] cursor-pointer"
          >
            <Camera className="w-5 h-5 text-[#cbae6c]" />
            <span>Scan QR Code with Camera</span>
          </button>
        </div>

        {/* 📚 Guide Section ("Guild show") */}
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden mt-2">
          <button
            id="guide-toggle-button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#00205b]" />
              <span className="text-xs md:text-sm font-sans font-black text-slate-800">
                Verification Guidelines (Guide)
              </span>
            </div>
            {showGuide ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showGuide && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
              
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">Locate the Lab Tag</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Find the official Sualkuchi Silk Testing Laboratory seal tag attached to your silk product (e.g. Saree, Mekhela Chadar).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">Scan the QR Code</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Tap the <strong>"Scan QR Code with Camera"</strong> button above, allow camera permissions, and point the camera at the QR code pattern.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#047857] leading-tight">Verify Purity Certificate</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Once decoded, you will be automatically redirected to the official certificate stating the exact pure composition of Mulberry (Pat) or Muga silk.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Contact Info Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs mt-4">
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#00205b]" />
            <span>Support: +91 9394552449</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#00205b]" />
            <span>Kalitapara, Sualkuchi, Kamrup, Assam</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-[10px] md:text-xs">
        <p>© 2026 Sualkuchi Silk Testing Laboratory. All Rights Reserved.</p>
        <p className="mt-1 text-slate-600 font-medium">Under Sualkuchi Tat Silpa Unnayan Samiti.</p>
      </footer>

      {/* 📹 Camera Scanner Overlay Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00205b]" />
                <h3 className="text-sm font-sans font-black text-slate-800">
                  Live QR Tag Scanner
                </h3>
              </div>
              <button
                onClick={closeScanner}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera viewport wrapper */}
            <div className="p-6 bg-slate-950 relative flex flex-col items-center">
              
              {/* Scan target grid animation overlay */}
              <div className="absolute inset-0 border-[30px] border-slate-950/70 pointer-events-none z-10 flex items-center justify-center">
                <div className="w-[200px] h-[200px] border-2 border-dashed border-[#cbae6c] relative">
                  {/* Laser line anim */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 shadow-md shadow-red-500/50 animate-bounce" />
                </div>
              </div>

              {/* Library attachment div container */}
              <div 
                id="qr-reader" 
                className="w-full max-w-sm rounded-xl overflow-hidden bg-slate-900"
                style={{ minHeight: "260px" }}
              />

              {scannerError && (
                <div className="mt-4 w-full p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium rounded-xl flex gap-2 z-20">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-normal">{scannerError}</p>
                </div>
              )}
            </div>

            {/* Instruction Footer */}
            <div className="p-4 bg-slate-50 text-center text-xs text-slate-500 font-medium">
              Point your camera at the QR code tag sticker
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

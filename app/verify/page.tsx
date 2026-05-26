"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyPageSecurity, getSecureHeaders } from "@/lib/useVerifyPageSecurity";
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  User,
  FileText,
  Tag,
  ClipboardList,
  Award,
  MessageCircle,
  Loader2,
  XCircle,
  AlertTriangle,
  IdCard,
  MessageSquare,
  Download,
} from "lucide-react";

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? `http://localhost:5000/api`
  : (process.env.NEXT_PUBLIC_API_URL || "https://api.sualkuchisilktestlab.com/api");

const PRODUCTION_IMG_BASE = "https://sualkuchitatsilpa.org/V1/panel-admin/";

const resolveImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (
    path.startsWith("data:") ||
    path.startsWith("blob:") ||
    path.startsWith("http")
  ) {
    return path;
  }
  return `${PRODUCTION_IMG_BASE}${path}`;
};

const getHeaders = () => {
  return getSecureHeaders();
};

// Define Types based on API response
interface VerificationData {
  success: boolean;
  verified: boolean;
  message: string;
  verification: {
    status: string;
    verifiedAt: string;
  };
  productImage: {
    imageData: string | null;
    format: string;
    hasImage: boolean;
  };
  productDetails: {
    productId: number;
    productName: string | null;
    productType: string;
    producerId: number;
    producerName: string | null;
    testDate: string;
    qrCode: string;
    productUrl: string;
    testSpecifications: {
      testWarp: string;
      testWeft: string;
      sampleSize: string;
      warp: string | null;
      weft: string | null;
    };
    qualityStatus: {
      quality: string;
      certified: boolean;
      certificationDate: string;
    };
    remark: string | null;
  };
  authentication: {
    qrVerified: boolean;
    urlVerified: boolean;
    trustLevel: string;
    verificationMethod: string;
  };
  warning: string | null;
  additionalInfo: {
    format: string;
    timestamp: string;
  };
  mugaProducts?: {
    isMugaProduct: boolean;
    mugaChador: string;
    mugaMekhela: string;
    mugaBlouse: string;
    mugaDetails: {
      chador: string;
      mekhela: string;
      blouse: string;
    };
  };
}

// Mock data for preview/fallback mode
const MOCK_DATA: VerificationData = {
  success: true,
  verified: true,
  message: "Product successfully verified",
  verification: {
    status: "Valid",
    verifiedAt: new Date().toISOString(),
  },
  productImage: {
    imageData: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop",
    format: "jpeg",
    hasImage: true,
  },
  productDetails: {
    productId: 2001,
    productName: "Sualkuchi Silk Mekhela",
    productType: "Mekhela",
    producerId: 2001,
    producerName: "Raju Das",
    testDate: "2026-05-26",
    qrCode: "MOCK_QR",
    productUrl: "https://qr.sualkuchisilktestlab.com/verify?qr_id=2001",
    testSpecifications: {
      testWarp: "Mulberry (পাট)",
      testWeft: "Mulberry (পাট)",
      sampleSize: "Standard",
      warp: "Mulberry (পাট)",
      weft: "Mulberry (পাট)",
    },
    qualityStatus: {
      quality: "Certified",
      certified: true,
      certificationDate: "2026-05-26",
    },
    remark: "test",
  },
  authentication: {
    qrVerified: true,
    urlVerified: true,
    trustLevel: "100%",
    verificationMethod: "Digital Signature & Lab Register",
  },
  warning: null,
  additionalInfo: {
    format: "json",
    timestamp: new Date().toISOString(),
  },
};

// Traditional Assamese Woven Diamond Motif SVG
function WovenLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14 md:w-16 md:h-16 text-[#E5C158] fill-current shrink-0">
      <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="currentColor" strokeWidth="4" />
      <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="currentColor" strokeWidth="1" />

      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="2" />

      <circle cx="50" cy="50" r="10" fill="#00205b" stroke="currentColor" strokeWidth="2" />
      <polygon points="50,44 56,50 50,56 44,50" fill="currentColor" />

      <circle cx="50" cy="10" r="2.5" fill="currentColor" />
      <circle cx="50" cy="90" r="2.5" fill="currentColor" />
      <circle cx="10" cy="50" r="2.5" fill="currentColor" />
      <circle cx="90" cy="50" r="2.5" fill="currentColor" />
    </svg>
  );
}



// Warp icon - Loom threads representation
const WarpIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-600 fill-none stroke-current" strokeWidth="1.5">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="3" x2="8" y2="21" strokeWidth="1.2" />
    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2.5" />
    <line x1="16" y1="3" x2="16" y2="21" strokeWidth="1.2" />
    <line x1="4" y1="8" x2="20" y2="8" strokeWidth="0.8" strokeDasharray="2,2" />
    <line x1="4" y1="16" x2="20" y2="16" strokeWidth="0.8" strokeDasharray="2,2" />
  </svg>
);

// Weft icon - Woven diamond pattern
const WeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-600 fill-none stroke-current" strokeWidth="1.5">
    <path d="M12 2 L22 12 L12 22 L2 12 Z" />
    <path d="M12 6 L18 12 L12 18 L6 12 Z" strokeWidth="1" />
    <path d="M12 2 L12 22 M2 12 L22 12" strokeWidth="1" />
    <path d="M7 7 L17 17 M7 17 L17 7" strokeWidth="1" />
  </svg>
);

// Product Type icon - Folded cloth
const ProductTypeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-600 fill-none stroke-current" strokeWidth="1.5">
    <path d="M4 4 h14 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 v-10 a2 2 0 0 1 2 -2 z" />
    <path d="M4 8 h16 M4 12 h16 M4 16 h16" strokeWidth="0.8" strokeDasharray="1,1" />
    <path d="M8 4 v14" strokeWidth="1.2" />
  </svg>
);

// Rosette Check icon matching the status badge exactly
const RosetteCheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-emerald-600 fill-none stroke-current" strokeWidth="1.5">
    <path
      d="M12 2l2.4 1.2 2.7-.3.8 2.6 2.5 1.1-.3 2.7 1.7 2.1-1.3 2.4.8 2.6-2.3 1.5-.9 2.5-2.6-.7-2 1.9-2.4-1.2-2.7.3-.8-2.6-2.5-1.1.3-2.7-1.7-2.1 1.3-2.4-.8-2.6 2.3-1.5.9-2.5 2.6.7 2-1.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Helper function to mask producer name like "Ra*** D*"
function maskProducerName(name: string | null | undefined): string {
  if (!name) return "*******";
  const trimName = name.trim();
  if (!trimName) return "*******";
  const parts = trimName.split(/\s+/);
  const maskedParts = parts.map((part, index) => {
    if (part.length === 0) return "";
    const visibleCount = index === 0 ? 2 : 1;
    if (part.length <= visibleCount) {
      return part;
    }
    return part.slice(0, visibleCount) + "*".repeat(part.length - visibleCount);
  });
  return maskedParts.join(" ");
}

// Helper function to mask date like "22 ** 20**"
function maskTestDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "** ** 20**";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "** ** 20**";
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear().toString();
    const century = year.slice(0, 2); // e.g. "20"
    return `${day} ** ${century}**`;
  } catch (e) {
    return "** ** 20**";
  }
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-[#047857]">
        <Loader2 className="h-16 w-16 text-[#047857] animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const qr_id = searchParams.get("qr_id");
  const url = searchParams.get("url");

  // Security check hook
  const securityCheck = useVerifyPageSecurity(qr_id, true);

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<VerificationData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function verifyProduct() {
      // Security check: wait for security validation
      if (securityCheck.loading) {
        return;
      }

      // Block if security check failed
      if (!securityCheck.passed) {
        setError(securityCheck.message || "Security validation failed. Please try again.");
        setLoading(false);
        return;
      }

      // If no qr_id is provided, check if we are in preview mode or just load mock data to prevent crashing
      if (!qr_id || qr_id === "undefined") {
        console.log("No QR ID provided. Falling back to demonstration/preview mode.");
        setData(MOCK_DATA);
        setLoading(false);
        return;
      }

      // If explicit preview requested
      if (qr_id === "preview" || qr_id === "demo") {
        setData(MOCK_DATA);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchUrl = `${API_BASE_URL}/testing/verify?qr_id=${qr_id}&url=${url || ""}`;
        const response = await fetch(fetchUrl, { headers: getHeaders() });

        if (!response.ok) {
          throw new Error(`Server returned code ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result);
        } else {
          setError(result.message || "Failed to verify product");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Network error. Could not connect to verification server.");
      } finally {
        setLoading(false);
      }
    }

    verifyProduct();
  }, [qr_id, url, securityCheck]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-[#047857]">
        <div className="relative flex flex-col items-center">
          <div className="absolute inset-0 bg-[#047857]/10 blur-[80px] rounded-full animate-pulse"></div>
          <Loader2 className="h-16 w-16 text-[#047857] animate-spin relative z-10" />
          <p className="mt-8 text-lg font-bold tracking-widest uppercase text-slate-500 animate-pulse text-center">
            Sualkuchi Silk Testing Laboratory<br />
            <span className="text-xs font-semibold tracking-normal text-slate-400 normal-case">Authenticating Product...</span>
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isSecurityError = error && (error.includes('rate') || error.includes('suspicious') || error.includes('Security'));
    const errorTitle = isSecurityError ? 'Too Many Requests' : 'Verification Failed';
    const errorMessage = error || "We could not verify the authenticity of this product. Please scan the QR code again or contact support.";

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50" />
          {isSecurityError ? (
            <AlertTriangle className="h-20 w-20 text-orange-500 mx-auto mb-6" />
          ) : (
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          )}
          <h1 className="text-2xl font-black uppercase tracking-tight mb-3 text-slate-900 leading-tight">{errorTitle}</h1>
          <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
            {errorMessage}
          </p>
          {isSecurityError && (
            <p className="text-xs text-slate-400 mb-6 italic">
              This is a security measure to prevent automated access. Please wait a moment and try again.
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className={`w-full h-12 ${isSecurityError ? 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20'} text-white rounded-2xl font-bold transition active:scale-95`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { productDetails, authentication, verification, productImage, mugaProducts } = data;
  const isVerified = data.verified && verification.status.toLowerCase() === 'valid';
  const isMuga = productDetails.testSpecifications.warp?.toLowerCase().includes('muga') ||
    productDetails.testSpecifications.testWarp?.toLowerCase().includes('muga');

  const formattedWarp = productDetails.testSpecifications.warp || productDetails.testSpecifications.testWarp || "N/A";
  const formattedWeft = productDetails.testSpecifications.weft || productDetails.testSpecifications.testWeft || "N/A";
  const finalRemarks = productDetails.remark || "test";

  const handleDownloadPdf = () => {
    if (!data) return;

    const maskedName = maskProducerName(productDetails.producerName);
    const activeImageSrc = productImage.hasImage && productImage.imageData
      ? resolveImageUrl(productImage.imageData)
      : "";

    const testDate = maskTestDate(productDetails.testDate);

    const currentVerificationUrl = typeof window !== 'undefined' ? window.location.href : "";
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentVerificationUrl)}`;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Silk Testing Certificate - ${productDetails.qrCode}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
            
            body { 
              font-family: 'Montserrat', sans-serif; 
              padding: 25px; 
              color: #0f172a; 
              background: #ffffff;
              line-height: 1.5;
            }
            .certificate-container {
              border: 6px double #00205b;
              padding: 25px;
              border-radius: 16px;
              position: relative;
              background-color: #fafbfc;
              background-image: radial-gradient(#00205b05 1px, transparent 0);
              background-size: 24px 24px;
            }
            .certificate-border-inner {
              border: 1px solid #eddcb6;
              padding: 18px;
              border-radius: 8px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #eddcb6;
              padding-bottom: 12px;
              margin-bottom: 15px;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 12px;
              text-align: left;
            }
            .header-logo {
              height: 48px;
              width: 48px;
              object-fit: contain;
              border-radius: 4px;
            }
            .header-right {
              height: 48px;
              width: 48px;
              object-fit: contain;
              border-radius: 4px;
            }
            .header-org {
              font-family: 'Cinzel', serif;
              font-size: 14px;
              font-weight: 850;
              color: #00205b;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
              line-height: 1.2;
            }
            .header-subtitle {
              font-size: 9px;
              color: #cbae6c;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 2px;
              line-height: 1.1;
            }
            .header-dept {
              font-size: 7.5px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.1;
            }
            .cert-title {
              font-family: 'Playfair Display', serif;
              font-size: 18px;
              font-weight: 700;
              color: #b45309;
              margin-top: 8px;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              font-weight: 700;
              color: #64748b;
              margin-bottom: 12px;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 5px;
              text-transform: uppercase;
            }
            .qr-id {
              color: #b45309;
              font-family: monospace;
              font-size: 9px;
            }
            .content-grid {
              display: flex;
              gap: 15px;
            }
            .info-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .info-block {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 10px 12px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.01);
            }
            .info-block-title {
              font-size: 9px;
              font-weight: 800;
              color: #00205b;
              text-transform: uppercase;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 3px;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 9px;
              border-bottom: 1px dashed #f1f5f9;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #64748b;
              font-weight: 600;
            }
            .value {
              color: #0f172a;
              font-weight: 700;
            }
            .value-verified {
              color: #047857;
              font-weight: 800;
            }
            .side-panel {
              width: 150px;
              display: flex;
              flex-direction: column;
              gap: 12px;
              flex-shrink: 0;
            }
            .image-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              border: 2px solid #f1f5f9;
              border-radius: 10px;
              padding: 4px;
              height: 120px;
              justify-content: center;
              background: #ffffff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.01);
            }
            .image-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              border-radius: 6px;
            }
            .no-img-text {
              font-size: 7px;
              color: #94a3b8;
              font-weight: 700;
              text-transform: uppercase;
              text-align: center;
              padding: 6px;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              border: 1px solid #eddcb6;
              border-radius: 10px;
              padding: 8px;
              background: #fffdf8;
              box-shadow: 0 2px 4px rgba(0,0,0,0.01);
            }
            .qr-container img {
              width: 75px;
              height: 75px;
            }
            .qr-text {
              font-size: 6.5px;
              color: #64748b;
              font-weight: 700;
              margin-top: 3px;
              text-align: center;
              text-transform: uppercase;
            }
            .seal-container {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 10px;
              border-top: 1px solid #f1f5f9;
            }
            .signature-line {
              border-top: 1.5px solid #00205b;
              width: 110px;
              text-align: center;
              padding-top: 3px;
              font-size: 7.5px;
              font-weight: 700;
              color: #00205b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .authority-seal {
              font-size: 7.5px;
              color: #94a3b8;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        </head>
        <body>
          <div id="report-certificate" class="certificate-container">
            <div class="certificate-border-inner">
              <div class="header">
                <div class="header-left">
                  <img src="${window.location.origin}/sstllogo.jpg" alt="SSTL Logo" class="header-logo" crossorigin="anonymous" />
                  <div>
                    <div class="header-org">SUALKUCHI SILK TESTING LABORATORY</div>
                    <div class="header-dept">Under Sualkuchi Tat Silpa Unnayan Samiti</div>
                    <div style="font-size: 6.5px; color: #64748b; margin-top: 3px; font-weight: 500; font-family: 'Montserrat', sans-serif;">
                      Sualkuchi Kalita Para, Assam, India &nbsp;•&nbsp; Phone: +91 9394552449 &nbsp;•&nbsp; Email: sualkuchihandloom@gmail.com &nbsp;•&nbsp; Web: www.sualkuchitatsilpa.org
                    </div>
                  </div>
                </div>
                <img src="${window.location.origin}/3-D.jpg" alt="3D Seal" class="header-right" crossorigin="anonymous" />
              </div>

              <div class="meta-row">
                <div>VERIFICATION ID: <span class="qr-id">${productDetails.qrCode}</span></div>
                <div>DATE OF TEST: <span>${testDate}</span></div>
              </div>

              <div class="content-grid">
                <div class="info-section">
                  <!-- Specimen Details -->
                  <div class="info-block">
                    <div class="info-block-title">Specimen Details</div>
                    <div class="info-row">
                      <span class="label">Product Type:</span>
                      <span class="value">${productDetails.productType}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Producer ID:</span>
                      <span class="value">${productDetails.producerId}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Producer Name:</span>
                      <span class="value">${maskedName}</span>
                    </div>
                  </div>

                  <!-- Fabric Specifications -->
                  <div class="info-block">
                    <div class="info-block-title">Fabric Specifications</div>
                    <div class="info-row">
                      <span class="label">Warp:</span>
                      <span class="value">${formattedWarp}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Weft:</span>
                      <span class="value">${formattedWeft}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Testing Status:</span>
                      <span class="value-verified">${verification.status} (Verified Authentic)</span>
                    </div>
                  </div>

                  <!-- Muga Components (if applicable) -->
                  ${isMuga && mugaProducts ? `
                  <div class="info-block" style="background-color: #fffdf8; border-color: #eddcb6;">
                    <div class="info-block-title" style="color: #b45309;">Muga Components</div>
                    <div class="info-row">
                      <span class="label">Muga Chador:</span>
                      <span class="value">${mugaProducts.mugaChador || "Verified"}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Muga Mekhela:</span>
                      <span class="value">${mugaProducts.mugaMekhela || "Verified"}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Muga Blouse:</span>
                      <span class="value">${mugaProducts.mugaBlouse || "Verified"}</span>
                    </div>
                  </div>
                  ` : ''}

                  <!-- Audit observations -->
                  <div class="info-block">
                    <div class="info-block-title">Audit Observation</div>
                    <div class="info-row">
                      <span class="label">Remarks:</span>
                      <span class="value" style="font-style: italic; font-weight: 500;">"${finalRemarks}"</span>
                    </div>
                  </div>
                </div>

                <!-- Right side panel: Specimen image & Verification QR -->
                <div class="side-panel">
                  <div class="image-container">
                    ${activeImageSrc ? `
                      <img src="${activeImageSrc}" alt="Silk Specimen Image" crossorigin="anonymous" />
                    ` : `
                      <div class="no-img-text">Verified Laboratory Record Exists<br/>(No Image Available)</div>
                    `}
                  </div>
                  
                  <div class="qr-container">
                    <img src="${qrCodeApiUrl}" alt="Verification Link QR Code" />
                    <div class="qr-text">Scan to Verify Authenticity</div>
                  </div>
                </div>
              </div>

              <div class="seal-container">
                <div class="authority-seal">
                  &nbsp;
                </div>
                <div class="signature-line">
                  Authorized Lab Authority
                </div>
              </div>
              <div style="text-align: center; font-size: 6.5px; color: #94a3b8; margin-top: 12px; text-transform: uppercase; font-weight: 750; letter-spacing: 0.5px;">
                * This is a computer generated certificate based on verified laboratory testing records. No physical signature is required.
              </div>
            </div>
          </div>

          <script>
            window.onload = () => {
              const element = document.getElementById('report-certificate');
              const opt = {
                margin:       [10, 10, 10, 10],
                filename:     'Sualkuchi_Silk_Certificate_${productDetails.qrCode}.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2.2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              
              html2pdf().set(opt).from(element).save().then(() => {
                setTimeout(() => window.close(), 1000);
              }).catch(err => {
                console.error(err);
                window.print();
                window.close();
              });
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">

      {/* 1. Header Section */}
      <header className="bg-gradient-to-r from-[#00205b] to-[#012d7c] text-white px-5 py-6 shadow-md relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay opacity-30 pointer-events-none" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-0.5 shadow-sm border border-white/10 shrink-0 overflow-hidden">
              <img
                src="/sstllogo.jpg"
                alt="Sualkuchi Silk Testing Laboratory Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-extrabold leading-tight tracking-wide text-white">
                Sualkuchi Silk
              </h1>
              <p className="text-[#cbae6c] font-sans text-xs md:text-sm font-bold uppercase tracking-widest mt-0.5">
                Testing Laboratory
              </p>
              <p className="text-slate-300 font-sans text-[9px] md:text-[10px] font-medium mt-0.5 leading-none">
                Under Sualkuchi Tat Silpa Unnayan Samiti
              </p>
            </div>
          </div>
          <div className="shrink-0 scale-90 md:scale-100">
            <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 relative overflow-hidden rounded-[10%] border border-white/10 shadow-md">
              <img
                src="/3-D.jpg"
                alt="Quality Assured 3D Seal"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">

        {/* Contact Bar */}
        <div className="border border-slate-100 bg-white rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] text-slate-700 w-full mb-6 gap-2 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <Phone className="w-4 h-4 text-[#00205b] shrink-0" />
            <div className="min-w-0 shrink-0">
              <p className="text-[10px] min-[375px]:text-[11px] sm:text-xs font-extrabold text-[#00205b] leading-tight">PH: 9394552449</p>
              <p className="text-[8px] min-[375px]:text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none mt-0.5">Office: 10:00 AM - 05:00 PM</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-100 shrink-0" />

          <button
            onClick={() => window.open('https://wa.me/919394552449', '_blank')}
            className="flex items-center gap-1.5 hover:opacity-85 active:scale-95 transition shrink-0 group"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 group-hover:scale-105 transition duration-150"
            />
            <span className="text-[10px] min-[375px]:text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-[#25D366] transition duration-150"></span>
          </button>

          <div className="h-6 w-px bg-slate-100 shrink-0" />

          <a
            href="tel:9394552449"
            className="flex items-center gap-1.5 hover:opacity-85 active:scale-95 transition shrink-0 group"
          >
            <Phone className="w-4 h-4 text-[#00205b] shrink-0 group-hover:scale-105 transition duration-150" />
            <span className="text-[10px] min-[375px]:text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-[#2563eb] transition duration-150 whitespace-nowrap">Call: 9394552449</span>
          </a>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left/Main Column: Validation Status, Details Card, Muga components, Alerts */}
          <div className="lg:col-span-7 space-y-6">

            {/* Parchment Gold Ribbon Banner */}
            <div className="bg-[#fffdf8] border border-[#eddcb6] rounded-2xl p-4.5 text-center shadow-sm relative overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
                <path d="M-10,100 C30,40 70,60 110,100 Z" fill="#aa7c11" />
                <path d="M-10,0 C20,50 60,30 110,0 Z" fill="#aa7c11" />
              </svg>
              <p className="font-serif text-xs md:text-sm text-[#00205b] font-bold tracking-wide relative z-10">
                Authentic & Tested
              </p>
              <h3 className="font-serif text-base md:text-[17px] font-extrabold text-[#00205b] tracking-tight mt-1 relative z-10">
                Handloom Silk Products of Sualkuchi
              </h3>
              <p className="text-slate-500 text-[10px] md:text-xs font-medium tracking-wide mt-1.5 relative z-10">
                Quality Assured by Certified Testing Laboratory
              </p>
            </div>



            {/* Certificate Grid Details Card */}
            <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col">

              {/* Row 1: Producer ID & Producer Name */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <IdCard className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Producer ID</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 leading-none">{productDetails.producerId}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Producer Name</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 leading-none">{maskProducerName(productDetails.producerName)}</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Weft & Warp */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <WeftIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Weft</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 leading-none">{formattedWeft}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <WarpIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Warp</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 leading-none">{formattedWarp}</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Product Type & Remarks */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <ProductTypeIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Product Type</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 leading-none">{productDetails.productType}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Remarks</p>
                    <p className="text-slate-800 text-xs font-bold mt-1 leading-none">{finalRemarks}</p>
                  </div>
                </div>
              </div>

              {/* Row 4: Status & Made in */}
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <RosetteCheckIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Status</p>
                    <p className="text-emerald-600 text-xs font-bold mt-1 leading-none">{verification.status}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px] font-medium leading-none">Made in</p>
                    <p className="text-blue-700 text-xs font-bold mt-1 leading-none">Sualkuchi</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Download Certificate PDF button (Desktop only) */}
            <button
              onClick={handleDownloadPdf}
              className="hidden lg:flex w-full h-12 bg-[#00205b] hover:bg-[#012d7c] text-white rounded-2xl font-bold transition active:scale-95 shadow-md items-center justify-center gap-2 text-xs uppercase tracking-wider relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
              <Download className="w-4 h-4 text-[#cbae6c]" />
              <span>Download PDF Certificate</span>
            </button>

            {/* Muga set details */}
            {isMuga && mugaProducts && (
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Muga Set Components
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-white border border-amber-200 p-2.5 rounded-xl shadow-xs">
                    <p className="text-[8px] text-amber-700/60 uppercase font-black">Chador</p>
                    <p className="text-amber-950 font-bold text-xs truncate mt-0.5">{mugaProducts.mugaChador || "Verified"}</p>
                  </div>
                  <div className="bg-white border border-amber-200 p-2.5 rounded-xl shadow-xs">
                    <p className="text-[8px] text-amber-700/60 uppercase font-black">Mekhela</p>
                    <p className="text-amber-950 font-bold text-xs truncate mt-0.5">{mugaProducts.mugaMekhela || "Verified"}</p>
                  </div>
                  <div className="bg-white border border-amber-200 p-2.5 rounded-xl shadow-xs">
                    <p className="text-[8px] text-amber-700/60 uppercase font-black">Blouse</p>
                    <p className="text-amber-950 font-bold text-xs truncate mt-0.5">{mugaProducts.mugaBlouse || "Verified"}</p>
                  </div>
                </div>
              </div>
            )}



          </div>

          {/* Right Column: Product Image, Contacts, Banners, Footer */}
          <div className="lg:col-span-5 space-y-6">

            {/* Product Image Section */}
            <div className="border border-slate-200/80 bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Product Image
              </p>

              <div className="flex justify-center">
                {productImage.hasImage && productImage.imageData ? (
                  <div className="rounded-2xl overflow-hidden border-4 border-slate-50 shadow-md bg-slate-50 w-full">
                    <img
                      src={resolveImageUrl(productImage.imageData) || ""}
                      alt="Authentic Silk product"
                      className="w-full h-auto object-cover max-h-[280px]"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full opacity-70">
                    <Award className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] text-center leading-relaxed">
                      Verified Laboratory Record Exists<br />(No Image Available)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Download Certificate PDF button (Mobile only, below product image) */}
            <button
              onClick={handleDownloadPdf}
              className="flex lg:hidden w-full h-12 bg-[#00205b] hover:bg-[#012d7c] text-white rounded-2xl font-bold transition active:scale-95 shadow-md items-center justify-center gap-2 text-xs uppercase tracking-wider relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
              <Download className="w-4 h-4 text-[#cbae6c]" />
              <span>Download PDF Certificate</span>
            </button>





            {/* Centered Made in Sualkuchi badge */}
            <div className="flex justify-center my-1">
              <div className="bg-[#00205b] text-white px-5 py-1.5 rounded-2xl flex items-center gap-2 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-green-400 fill-green-400/20" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Made in Sualkuchi
                </span>
              </div>
            </div>

            {/* 8. Footer Inquiry Section */}
            <footer className="w-full mt-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-center">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-3 leading-none">
                  Emergency Inquiry
                </p>
                <button
                  onClick={() => window.open('https://wa.me/919394552449', '_blank')}
                  className="w-full h-12 rounded-xl border border-green-200 bg-green-50 text-[#047857] hover:bg-green-100 font-black flex items-center justify-center gap-2 active:scale-95 transition text-sm"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="w-5 h-5 shrink-0"
                  />
                  WhatsApp: 9394552449
                </button>
              </div>
            </footer>

          </div>

        </div>
      </main>

    </div>
  );
}

// Info Card helper component
function InfoCard({
  icon,
  label,
  value,
  valueColorClass = "text-slate-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColorClass?: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm hover:shadow transition duration-200">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className={`text-sm font-extrabold mt-1 truncate leading-tight ${valueColorClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
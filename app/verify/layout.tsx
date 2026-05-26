import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Verification | Sualkuchi Silk Identity",
  description: "Verify the authenticity of your Sualkuchi Silk products using our secure digital identity system.",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

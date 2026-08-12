import Hero from "../../components/sections/Hero";
import Features from "../../components/sections/Features";

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EmployeeManagement",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "description": "Comprehensive employee management platform for HR, payroll, and performance tracking.",
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Features />
    </main>
  );
}

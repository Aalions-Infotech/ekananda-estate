import { Link } from "react-router-dom";
import { CheckCircle2, Home, Phone, Facebook, Instagram, Twitter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND_SOCIAL } from "@/constants/brand";

const ThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="max-w-xl w-full text-center bg-card rounded-3xl border border-border p-10 shadow-card">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-3">Thank You!</h1>
          <p className="text-muted-foreground mb-2">
            Your enquiry has been submitted successfully.
          </p>
          <p className="text-muted-foreground mb-8">
            Our Lucknow property expert will reach out to you within the next few hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <a href="tel:+919369556641" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border font-medium text-sm hover:bg-muted">
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Follow new Lucknow listings on
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {BRAND_SOCIAL.map(({ label, url, handle }) => {
                const Icon = label === "Facebook" ? Facebook : label === "Instagram" ? Instagram : Twitter;
                return (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ekananda Estate on ${label}`}
                    title={`${label}: ${handle}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label === "X (Twitter)" ? "X" : label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
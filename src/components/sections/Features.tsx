import { Feature } from "@/src/types";
import { Users, Calendar, BarChart3, ShieldCheck } from "lucide-react";

const featureList: Feature[] = [
  {
    title: "Employee Directory",
    description: "Keep all your employee records organized and accessible in a secure, centralized database.",
    iconName: "users"
  },
  {
    title: "Time & Attendance",
    description: "Track hours, manage time off requests, and monitor attendance patterns effortlessly.",
    iconName: "calendar"
  },
  {
    title: "Performance Reviews",
    description: "Conduct meaningful evaluations with customizable templates and goal tracking.",
    iconName: "chart"
  },
  {
    title: "Secure & Compliant",
    description: "Enterprise-grade security ensuring your sensitive HR data is protected and compliant.",
    iconName: "shield"
  }
];

export default function Features() {
  const getIcon = (name: string) => {
    switch(name) {
      case "users": return <Users className="h-6 w-6 text-blue-600" />;
      case "calendar": return <Calendar className="h-6 w-6 text-blue-600" />;
      case "chart": return <BarChart3 className="h-6 w-6 text-blue-600" />;
      case "shield": return <ShieldCheck className="h-6 w-6 text-blue-600" />;
      default: return <Users className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <section id="features" className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to run your team</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to save you time and help your employees thrive.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureList.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-start p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 rounded-lg mb-4">
                {getIcon(feature.iconName)}
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

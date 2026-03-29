import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { TextReveal } from "@/components/animations/TextReveal";
import { fadeUp } from "@/components/animations/variants";
import { BarChart3, Eye, MessageSquare, Settings, CreditCard, ArrowRight, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const scrollRef = useScrollReveal();

  const stats = [
    { icon: Eye, label: "Profile Views", value: "1,247", change: "+12%" },
    { icon: MessageSquare, label: "Contacts", value: "34", change: "+8%" },
    { icon: TrendingUp, label: "Search Appearances", value: "3,891", change: "+23%" },
  ];

  return (
    <div className="min-h-screen bg-background" ref={scrollRef}>
      <CursorGlow />
      <ScrollProgress />
      <Header />

      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
              >
                Provider Dashboard
              </motion.p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <TextReveal text="Welcome back, Marcus" delay={0.1} />
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <Badge variant="outline" className="text-xs">Standard Plan</Badge>
                <Link to="/pricing" className="text-xs text-muted-foreground underline-sweep hover:text-foreground transition-colors flex items-center gap-1">
                  Upgrade your listing <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden mb-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-background p-6"
                >
                  <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden mb-12">
              {[
                { icon: Settings, title: "Edit Profile", desc: "Update your listing, photos, services, and pricing", link: "/settings" },
                { icon: BarChart3, title: "Analytics", desc: "View detailed performance metrics and trends", link: "#" },
                { icon: CreditCard, title: "Billing & Plan", desc: "Manage your advertising subscription", link: "/pricing" },
              ].map((action, i) => (
                <motion.div
                  key={action.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link to={action.link} className="block bg-background p-8 hover:bg-card transition-colors group glow-hover">
                    <action.icon className="w-6 h-6 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-4 inline-flex items-center gap-1 uppercase tracking-widest">
                      Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Upgrade CTA */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="glass-card p-8 text-center"
            >
              <h3 className="text-2xl font-bold mb-3">Get More Visibility</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                Upgrade your advertising plan to get featured placement, boosted search results, and detailed analytics.
              </p>
              <Link to="/pricing">
                <Button className="group">
                  View Advertising Plans
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;

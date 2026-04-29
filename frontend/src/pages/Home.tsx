import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const features = [
  {
    icon: (
      <svg
        className="w-10 h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.528-2.659.814"
        />
      </svg>
    ),
    title: "Learn from Experts",
    description:
      "Connect with faculty mentors who specialize in your areas of interest.",
  },
  {
    icon: (
      <svg
        className="w-10 h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
    ),
    title: "Skill Swap",
    description:
      "Exchange knowledge bidirectionally — teach what you know, learn what you need.",
  },
  {
    icon: (
      <svg
        className="w-10 h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
    title: "Flexible Sessions",
    description: "Book sessions that fit your schedule. Online or in-person.",
  },
  {
    icon: (
      <svg
        className="w-10 h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
    title: "Rating System",
    description:
      "Rate your mentors after sessions to help others make informed choices.",
  },
];

const stats = [
  { value: "500+", label: "Active Students" },
  { value: "50+", label: "Expert Mentors" },
  { value: "100+", label: "Skills Available" },
  { value: "1000+", label: "Sessions Completed" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.jpeg" 
              alt="SkillSwap" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-medium text-white">SkillSwap</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="pill-btn pill-btn-ghost text-white">
              Sign In
            </Link>
            <Link to="/register" className="pill-btn pill-btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative pt-32 pb-20 px-6 min-h-screen">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-60"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 max-w-6xl mx-auto pt-48">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1
              className="font-bold mb-6"
              style={{
                letterSpacing: "-0.03em",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                lineHeight: 1.1,
              }}
            >
              <span className="text-white">Learn. Teach.</span>{" "}
              <span className="gradient-text">Grow Together.</span>
            </h1>
            <p
              className="text-xl mb-10"
              style={{
                color: "rgba(255,255,255,0.5)",
                maxWidth: "600px",
                margin: "0 auto 40px",
              }}
            >
              A peer-to-peer skill exchange platform connecting students with
              faculty mentors. Share your expertise, learn new skills, and grow
              together.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="glow-button text-base px-8 py-3">
                Join Now — It's Free
              </Link>
              <Link
                to="/login"
                className="pill-btn pill-btn-secondary text-base px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-5 text-center"
              >
                <div className="text-4xl font-medium gradient-text mb-2">
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2
              className="text-section mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-white">Why </span>
              <span className="gradient-text">SkillSwap?</span>
            </h2>
            <p
              className="text-lg"
              style={{
                color: "rgba(255,255,255,0.5)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Everything you need to exchange skills and knowledge within your
              university community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-5"
              >
                <div className="mb-4" style={{ color: "#3ecf8e" }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-white mb-3">
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="/images/home.jpg"
                alt="Students learning together"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-section" style={{ letterSpacing: "-0.02em" }}>
                <span className="text-white">Learn </span>
                <span className="gradient-text">Together</span>
              </h2>

              <p
                className="text-lg max-w-lg"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Join a thriving community of students and faculty collaborating
                to share knowledge, build skills, and grow faster—together.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4 group">
                  <div
                    className="p-2 rounded-lg transition group-hover:scale-110"
                    style={{ background: "rgba(62,207,142,0.15)" }}
                  >
                    <Check size={20} style={{ color: "#3ecf8e" }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Verified Mentors
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Learn from trusted faculty and experienced professionals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div
                    className="p-2 rounded-lg transition group-hover:scale-110"
                    style={{ background: "rgba(120,64,255,0.15)" }}
                  >
                    <Check size={20} style={{ color: "#7840ff" }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Flexible Scheduling
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Book sessions at your convenience—no rigid timings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div
                    className="p-2 rounded-lg transition group-hover:scale-110"
                    style={{ background: "rgba(255,184,0,0.15)" }}
                  >
                    <Check size={20} style={{ color: "#ffb800" }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Hands-on Learning
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Work on real-world projects to gain practical experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div
                    className="p-2 rounded-lg transition group-hover:scale-110"
                    style={{ background: "rgba(255,99,132,0.15)" }}
                  >
                    <Check size={20} style={{ color: "#ff6384" }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Peer Collaboration
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Learn with like-minded students and grow your network.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/register"
                  className="glow-button px-6 py-3 text-base"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 text-center"
          >
            <h2
              className="text-section mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-white">Ready to </span>
              <span className="gradient-text">start learning?</span>
            </h2>
            <p
              className="text-lg mb-8"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Join hundreds of students already sharing and acquiring new
              skills.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="glow-button text-base px-8 py-3">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer
        className="py-8 px-6 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="SkillSwap"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              © 2026 SkillSwap. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Built for university students
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
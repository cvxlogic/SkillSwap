import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Star,
  Bell,
  Target,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import MentorCard from "../components/MentorCard";
import { useAuth } from "../context/AuthContext";
import { sessionsApi, notificationsApi, skillsApi } from "../services/api";
import { DashboardStats, Notification, LearningGoal, User } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [suggestedMentors, setSuggestedMentors] = useState<
    (User & { user_skills?: any[] })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes, goalsRes] = await Promise.all([
          sessionsApi.getStats(),
          notificationsApi.getAll(),
          skillsApi.getLearningGoals(),
        ]);
        setStats(statsRes.data.data);
        setNotifications(notifRes.data.data.slice(0, 5));
        setLearningGoals(goalsRes.data.data);

        if (goalsRes.data.data.length > 0) {
          fetchSuggestedMentors(goalsRes.data.data[0].id);
          setSelectedGoal(goalsRes.data.data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchSuggestedMentors = async (goalId: string) => {
    try {
      const res = await skillsApi.getSuggestedMentors(goalId);
      setSuggestedMentors(res.data.data);
    } catch (error) {
      console.error("Failed to fetch suggested mentors:", error);
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    fetchSuggestedMentors(goalId);
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "wanted":
        return "rgba(255, 120, 64, 0.2)";
      case "learning":
        return "rgba(62, 207, 142, 0.2)";
      case "completed":
        return "rgba(120, 64, 255, 0.2)";
      default:
        return "rgba(255,255,255,0.1)";
    }
  };

  const getGoalStatusBorder = (status: string) => {
    switch (status) {
      case "wanted":
        return "rgba(255, 120, 64, 0.3)";
      case "learning":
        return "rgba(62, 207, 142, 0.3)";
      case "completed":
        return "rgba(120, 64, 255, 0.3)";
      default:
        return "rgba(255,255,255,0.1)";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: "rgba(62,207,142,0.3)",
              borderTopColor: "#3ecf8e",
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="relative">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(120, 64, 255, 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1
                className="text-5xl font-normal mb-3"
                style={{ letterSpacing: "-0.03em" }}
              >
                Welcome back,{" "}
                <span className="gradient-text">
                  {user?.full_name?.split(" ")[0]}
                </span>
              </h1>
              <p className="text-xl" style={{ color: "rgba(255,255,255,0.5)" }}>
                {user?.role === "faculty"
                  ? "Ready to mentor the next generation of experts?"
                  : "Your learning journey continues here."}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="hidden md:block"
            >
              <img
                src="/images/L.jpg"
                alt="Learning"
                className="rounded-2xl shadow-2xl w-[800px] h-[170px] object-cover opacity-50"
              />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card p-5 col-span-2 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(62, 207, 142, 0.2) 0%, rgba(62, 207, 142, 0.05) 100%)",
                }}
              >
                <BookOpen size={22} style={{ color: "#3ecf8e" }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  My Skills
                </p>
                <p className="text-2xl gradient-text font-medium">
                  {stats?.total_skills || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 col-span-2 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(120, 64, 255, 0.2) 0%, rgba(120, 64, 255, 0.05) 100%)",
                }}
              >
                <Calendar size={22} style={{ color: "#7840ff" }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Sessions
                </p>
                <p
                  className="text-2xl font-medium"
                  style={{ color: "#b4a0ff" }}
                >
                  {stats?.upcoming_sessions || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(64, 224, 224, 0.2) 0%, rgba(64, 224, 224, 0.05) 100%)",
                }}
              >
                <Star size={22} style={{ color: "#40e0e0" }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Rating
                </p>
                <p
                  className="text-2xl font-medium"
                  style={{ color: "#40e0e0" }}
                >
                  {stats?.avg_rating
                    ? Number(stats.avg_rating).toFixed(1)
                    : "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl relative"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 64, 96, 0.2) 0%, rgba(255, 64, 96, 0.05) 100%)",
                }}
              >
                <Bell size={22} style={{ color: "#ff4060" }} />
                {(stats?.unread_notifications || 0) > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                    style={{ background: "#ff4060", color: "white" }}
                  >
                    {(stats?.unread_notifications || 0) > 9
                      ? "9+"
                      : stats?.unread_notifications}
                  </span>
                )}
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Alerts
                </p>
                <p
                  className="text-2xl font-medium"
                  style={{ color: "#ff4060" }}
                >
                  {stats?.unread_notifications || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(62, 207, 142, 0.2) 0%, rgba(62, 207, 142, 0.05) 100%)",
                }}
              >
                <Target size={22} style={{ color: "#3ecf8e" }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Goals
                </p>
                <p className="text-2xl gradient-text font-medium">
                  {learningGoals.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {user?.role === "student" && learningGoals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-normal flex items-center gap-2">
                  <Target size={20} style={{ color: "#7840ff" }} />
                  My Learning Goals
                </h2>
                <Link
                  to="/skills"
                  className="text-sm"
                  style={{ color: "#3ecf8e" }}
                >
                  + Add
                </Link>
              </div>
              <div className="space-y-2">
                {learningGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal.id)}
                    className="w-full text-left p-5 rounded-xl transition-all duration-300"
                    style={{
                      background:
                        selectedGoal === goal.id
                          ? getGoalStatusColor(goal.status)
                          : "rgba(255,255,255,0.03)",
                      border:
                        selectedGoal === goal.id
                          ? `1px solid ${getGoalStatusBorder(goal.status)}`
                          : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.skill.name}</span>
                      <span
                        className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{
                          background: getGoalStatusColor(goal.status),
                          border: `1px solid ${getGoalStatusBorder(goal.status)}`,
                          color:
                            goal.status === "wanted"
                              ? "#ff7840"
                              : goal.status === "learning"
                                ? "#3ecf8e"
                                : "#7840ff",
                        }}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {goal.skill.category?.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} style={{ color: "#40e0e0" }} />
                <h2 className="text-lg font-normal">Suggested Mentors</h2>
              </div>
              {suggestedMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedMentors.slice(0, 4).map((mentor) => (
                    <MentorCard
                      key={mentor.user_id}
                      mentor={mentor}
                      onSelect={() =>
                        (window.location.href = `/sessions/book/${mentor.user_id}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p
                  className="text-center py-8"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Add learning goals to get mentor suggestions!
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h2 className="text-xl font-normal mb-4 flex items-center gap-2">
              <Bell size={20} style={{ color: "#3ecf8e" }} />
              Recent Notifications
            </h2>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="p-5 rounded-xl"
                    style={{
                      background: notif.is_read
                        ? "rgba(255,255,255,0.03)"
                        : "linear-gradient(135deg, rgba(62, 207, 142, 0.1) 0%, rgba(62, 207, 142, 0.03) 100%)",
                      border: notif.is_read
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "1px solid rgba(62, 207, 142, 0.2)",
                    }}
                  >
                    <p className="text-sm">{notif.message}</p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-center py-8"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                No notifications yet
              </p>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-xl font-normal mb-4 flex items-center gap-2">
              <TrendingUp size={20} style={{ color: "#40e0e0" }} />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/skills"
                className="block p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(62, 207, 142, 0.1) 0%, rgba(62, 207, 142, 0.03) 100%)",
                  border: "1px solid rgba(62, 207, 142, 0.2)",
                }}
              >
                <BookOpen
                  size={24}
                  style={{ color: "#3ecf8e" }}
                  className="mb-2"
                />
                <h3 className="font-medium">My Skills</h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Manage expertise
                </p>
              </Link>
              <Link
                to="/browse"
                className="block p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(120, 64, 255, 0.1) 0%, rgba(120, 64, 255, 0.03) 100%)",
                  border: "1px solid rgba(120, 64, 255, 0.2)",
                }}
              >
                <Target
                  size={24}
                  style={{ color: "#7840ff" }}
                  className="mb-2"
                />
                <h3 className="font-medium">Find Mentors</h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Browse experts
                </p>
              </Link>
              <Link
                to="/sessions"
                className="block p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 120, 64, 0.1) 0%, rgba(255, 120, 64, 0.03) 100%)",
                  border: "1px solid rgba(255, 120, 64, 0.2)",
                }}
              >
                <Calendar
                  size={24}
                  style={{ color: "#ff7840" }}
                  className="mb-2"
                />
                <h3 className="font-medium">Sessions</h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  View bookings
                </p>
              </Link>
              <Link
                to="/leaderboard"
                className="block p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(64, 224, 224, 0.1) 0%, rgba(64, 224, 224, 0.03) 100%)",
                  border: "1px solid rgba(64, 224, 224, 0.2)",
                }}
              >
                <Star size={24} style={{ color: "#40e0e0" }} className="mb-2" />
                <h3 className="font-medium">Leaderboard</h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Top mentors
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

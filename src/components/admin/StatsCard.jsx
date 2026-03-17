import { FiActivity } from "react-icons/fi";

export default function StatsCard({ title, value, change, changeType, icon: Icon, color }) {
    const colorClasses = {
        gold: {
            bg: "bg-gradient-to-br from-gold-500 to-yellow-600",
            light: "bg-orange-50/80",
            iconBg: "bg-orange-100",
            text: "text-gold-600",
            border: "border-orange-100"
        },
        blush: {
            bg: "bg-gradient-to-br from-rose-400 to-rose-600",
            light: "bg-rose-50/80",
            iconBg: "bg-rose-100",
            text: "text-rose-600",
            border: "border-rose-100"
        },
        green: {
            bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            light: "bg-emerald-50/80",
            iconBg: "bg-emerald-100",
            text: "text-emerald-600",
            border: "border-emerald-100"
        },
        purple: {
            bg: "bg-gradient-to-br from-violet-400 to-violet-600",
            light: "bg-violet-50/80",
            iconBg: "bg-violet-100",
            text: "text-violet-600",
            border: "border-violet-100"
        },
        blue: {
            bg: "bg-gradient-to-br from-blue-400 to-blue-600",
            light: "bg-blue-50/80",
            iconBg: "bg-blue-100",
            text: "text-blue-600",
            border: "border-blue-100"
        }
    };

    const colors = colorClasses[color] || colorClasses.gold;

    return (
        <div className={`relative overflow-hidden ${colors.light} rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] border ${colors.border}`}>
            {/* Background Decoration */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${colors.bg} opacity-5 blur-2xl`}></div>

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{value}</h3>

                    {change !== undefined && (
                        <div className="flex items-center gap-2 mt-4">
                            <span
                                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${changeType === "increase"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                            >
                                <FiActivity className={changeType === "increase" ? "-rotate-45" : "rotate-45"} />
                                {changeType === "increase" ? "+" : "-"}{change}%
                            </span>
                            <span className="text-xs text-gray-400 font-medium">مقارنة بالشهر الماضي</span>
                        </div>
                    )}
                </div>

                <div className={`w-14 h-14 ${colors.bg} rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-gray-200/50 group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon size={24} className="text-white drop-shadow-md" />
                </div>
            </div>
        </div>
    );
}

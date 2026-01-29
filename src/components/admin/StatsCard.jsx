"use client";

export default function StatsCard({ title, value, change, changeType, icon: Icon, color }) {
    const colorClasses = {
        gold: {
            bg: "bg-gradient-to-br from-gold-400 to-gold-600",
            light: "bg-gold-50",
            text: "text-gold-600",
        },
        blush: {
            bg: "bg-gradient-to-br from-blush-400 to-blush-600",
            light: "bg-blush-50",
            text: "text-blush-600",
        },
        green: {
            bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            light: "bg-emerald-50",
            text: "text-emerald-600",
        },
        purple: {
            bg: "bg-gradient-to-br from-purple-400 to-purple-600",
            light: "bg-purple-50",
            text: "text-purple-600",
        },
    };

    const colors = colorClasses[color] || colorClasses.gold;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
                    {change && (
                        <div className="flex items-center gap-1 mt-3">
                            <span
                                className={`text-sm font-medium ${changeType === "increase" ? "text-emerald-500" : "text-red-500"
                                    }`}
                            >
                                {changeType === "increase" ? "+" : "-"}{change}%
                            </span>
                            <span className="text-xs text-gray-400">من الشهر الماضي</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );
}

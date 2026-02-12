"use client";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

export default function DataTable({
    columns,
    data = [],
    title,
    searchable = true,
    pageSize = 10,
    actions,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const safeData = Array.isArray(data) ? data : [];

    const filteredData = safeData.filter((item) =>
        Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-400 mt-1">عرض {data.length} عنصر في القائمة</p>
                </div>

                {searchable && (
                    <div className="relative group">
                        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="بحث سريع..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-80 pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-gold-100 focus:border-gold-300 transition-all font-medium placeholder-gray-400 text-gray-700"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider first:rounded-tr-2xl last:rounded-tl-2xl"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider last:rounded-tl-2xl">
                                    الإجراءات
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="px-8 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <FiSearch size={24} />
                                        </div>
                                        <p className="font-medium">لا توجد بيانات متاحة</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/80 transition-all duration-200">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-8 py-5 text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-8 py-5 text-sm">
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500 font-medium">
                            عرض {startIndex + 1} - {Math.min(startIndex + pageSize, filteredData.length)} من{" "}
                            {filteredData.length}
                        </p>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
                            >
                                <FiChevronRight size={18} />
                            </button>
                            <div className="flex items-center px-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all mx-0.5 ${currentPage === page
                                            ? "bg-gold-500 text-white shadow-md shadow-gold-500/30 scale-110"
                                            : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
                            >
                                <FiChevronLeft size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({
                     variant = 'default',
                     menuItems,
                     handleTabChange,
                     activeTab,
                 }) {

    return (
        <div className="min-w-fit fixed">

            {/* Sidebar */}
            <div
                id="sidebar"
                className={`flex lg:!flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-sm'} pt-[60px]`}
            >
                {/* Links */}
                <div className="space-y-8">
                    {/* Pages group */}
                    <div>
                        <ul className="mt-3">
                            {menuItems.map((item, index) => (
                                <li key={index} className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${activeTab === item.index && "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"}`}>
                                    <NavLink
                                        end
                                        to="/"
                                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                                            activeTab === item.index ? "" : "hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                        onClick={() => handleTabChange(item.index)}
                                    >
                                        <div className="flex items-center">
                                            <span>{item.icon}</span>
                                            <span className="text-sm font-medium ml-4 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">{item.text}</span>
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;

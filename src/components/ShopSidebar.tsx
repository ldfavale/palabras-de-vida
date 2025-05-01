import React from 'react';
import { CheckIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { BeakerIcon } from '@heroicons/react/24/solid'

import { clsx } from 'clsx';

interface SidebarItem {
    label: string;
    value: string;
    isActive?: boolean;
    icon?: React.ReactNode;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarData: SidebarSection[] = [
    {
        title: 'Categories',
        items: [
            { label: 'All', value: 'all' },
            { label: 'Highlights', value: 'highlights' },
            { label: 'Libros para niños', value: 'libros-ninos' },
            { label: 'Estudio Bíblico', value: 'estudio-biblico' },
            { label: 'Biblias', value: 'biblias', isActive: true },
            { label: 'Biblias de estudio', value: 'biblias-estudio' },
            { label: 'Libros', value: 'libros' },
            { label: 'Himnarios', value: 'himnarios' },
            { label: 'Devocionales', value: 'devocionales' },
            { label: 'Regalería', value: 'regaleria' },
            { label: 'Juegos', value: 'juegos' },
            { label: 'Biografías', value: 'biografias' },
            { label: 'Librillos', value: 'librillos' },
        ],
    },
    {
        title: 'Sort by',
        items: [
            { label: 'Categories', value: 'categories', isActive: true },
            { label: 'Lowest price', value: 'lowest-price' },
            { label: 'Highest price', value: 'highest-price' },
            { label: 'A - Z', value: 'a-z' },
            { label: 'Z - A', value: 'z-a' },
        ],
    },
    {
        title: 'Layout',
        items: [
            { label: 'Instaview', value: 'instaview', icon: <Squares2X2Icon className="w-4 h-4" /> },
            { label: 'List', value: 'list', icon: <ListBulletIcon className="w-4 h-4" /> },
        ],
    },
];

// Definimos un componente para el icono de check amarillo
const YellowCheckCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-500">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const Sidebar = () => {
    return (
        <aside className="min-h-screen w-60 pt-36 xl:w-64 2xl:w-72 hidden lg:flex lg:flex-col  bg-gray-50 border-r border-gray-200 p-4">
            {sidebarData.map((section, index) => (
                <div key={index} className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">{section.title}</h2> {/* Aumenté el tamaño de la letra a lg */}
                    <ul className=''>
                        {section.items.map((item) => (
                            <li key={item.value} className="py-2">
                                <button
                                    className={clsx(
                                        "flex items-center w-full text-left text-sm", // Disminuí el tamaño de la letra a sm
                                        item.isActive
                                            ? "text-black font-semibold"
                                            : "text-gray-600 hover:text-black"
                                    )}
                                >
                                    {item.isActive && <CheckIcon className="mr-2 w-6 h-6 text-primary" />}
                                    <div className={
                                        clsx(!item.isActive 
                                            ? "ml-8"
                                            : "" 
                                        )}
                                    >
                                        {item.icon && <span className="mr-2">{item.icon}</span>}
                                        {item.label}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </aside>
    );
};

export default Sidebar;

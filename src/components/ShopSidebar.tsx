import React from 'react';

export interface SidebarParams {
    // isOpen: boolean;
    // onClose: () => void;
    // title?: string;
    // position?: 'left' | 'right';
    // className?: string;
    children?: React.ReactNode;
  }
  



const Sidebar = ({children}:SidebarParams) => {
    return (
        <aside className="min-h-screen w-60 pt-36 xl:w-64 2xl:w-72 hidden lg:flex lg:flex-col  bg-gray-50 border-r border-gray-200 p-4">
            {children}
        </aside>
    );
};

export default Sidebar;

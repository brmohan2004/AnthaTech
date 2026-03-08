import React, { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import './AppShell.css';

const AppShell = ({ children, pageTitle = 'Dashboard', activePath = '/admin/dashboard' }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
                activePath={activePath}
            />
            <TopBar pageTitle={pageTitle} collapsed={collapsed} />
            <main className="app-main">
                {children}
            </main>
        </div>
    );
};

export default AppShell;

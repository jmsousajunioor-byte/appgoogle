import React from 'react';

interface CosmicAuthLayoutProps {
    children: React.ReactNode;
}

export const CosmicAuthLayout: React.FC<CosmicAuthLayoutProps> = ({ children }) => {
    return (
        <div className="cosmic-login relative min-h-screen w-full overflow-hidden bg-background text-foreground">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/25 via-background to-cosmic-blue/20" />
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-cosmic blur-[160px] opacity-60 animate-spin-slow" />
                    <div className="absolute -bottom-24 -left-24 h-[24rem] w-[24rem] rounded-full bg-cosmic blur-[180px] opacity-50 animate-float" />
                    <div className="absolute left-24 top-24 h-32 w-32 rounded-full border border-cosmic-blue/40 opacity-80 animate-spin-slow" />
                    <div className="absolute right-12 bottom-16 h-24 w-24 rounded-full border border-cosmic-pink/40 opacity-60 animate-float-slow" />
                </div>
            </div>
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                {children}
            </div>
        </div>
    );
};

export default CosmicAuthLayout;

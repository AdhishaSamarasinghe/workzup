"use client";

type AuthVisualPanelProps = {
    title?: string;
    subtitle?: string;
};

export default function AuthVisualPanel({
    title = "Grow With WorkzUp",
    subtitle = "Connect with the right people faster using a trusted hiring platform.",
}: AuthVisualPanelProps) {
    return (
        <aside className="auth-visual-panel hidden lg:flex lg:w-[40%]" aria-hidden="true">
            <div className="auth-visual-glow auth-visual-glow-top" />
            <div className="auth-visual-glow auth-visual-glow-mid" />
            <div className="auth-visual-grid" />

            <div className="auth-floating-card auth-floating-card-sm">
                24k+ verified users
            </div>
            <div className="auth-floating-card auth-floating-card-lg">
                Smart hiring workflows
            </div>

            <div className="relative z-10 mt-auto w-full p-10 text-white">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-100/90">WorkzUp</p>
                <h3 className="mt-3 text-3xl font-bold leading-tight">{title}</h3>
                <p className="mt-3 max-w-xs text-sm text-blue-50/95">{subtitle}</p>
            </div>
        </aside>
    );
}

import React from "react";

export const ActionBtn = ({
    onClick,
    title,
    colorClass,
    children,
    disabled,
}: {
    onClick?: () => void;
    title: string;
    colorClass: string;
    children: React.ReactNode;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded-lg transition-colors ${disabled ? "opacity-30 cursor-not-allowed" : colorClass
            }`}
    >
        {children}
    </button>
);
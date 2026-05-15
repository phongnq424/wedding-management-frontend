function getImageFallback(label: string | null | undefined) {
    if (!label) return "NA";

    return label
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function ItemImage({
    src,
    label,
    className = "h-20 w-full",
}: {
    src?: string | null;
    label?: string | null;
    className?: string;
}) {
    return (
        <div className={`${className} overflow-hidden bg-muted flex-shrink-0`}>
            {src ? (
                <img
                    src={src}
                    alt={label ?? "Item"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground bg-secondary">
                    {getImageFallback(label)}
                </div>
            )}
        </div>
    );
}
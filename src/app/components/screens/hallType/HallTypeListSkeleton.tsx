import { SkeletonBlock } from "./SkeletonBlock";

export function HallTypeListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <SkeletonBlock className="h-8 w-80" />
                    <SkeletonBlock className="h-4 w-96" />
                </div>

                <SkeletonBlock className="h-12 w-44 rounded-xl" />
            </div>

            <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <SkeletonBlock className="h-12 flex-1 rounded-xl" />
                    <SkeletonBlock className="h-12 w-48 rounded-xl" />
                    <SkeletonBlock className="h-12 w-40 rounded-xl" />
                    <SkeletonBlock className="h-12 w-32 rounded-xl" />
                </div>
            </div>

            <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
                <div className="bg-secondary px-6 py-4 grid grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonBlock key={index} className="h-4" />
                    ))}
                </div>

                <div className="divide-y divide-border">
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="px-6 py-4 grid grid-cols-6 gap-4 items-center"
                        >
                            <div className="flex items-center gap-3">
                                <SkeletonBlock className="h-10 w-10 rounded-lg" />
                                <SkeletonBlock className="h-4 w-32" />
                            </div>

                            <SkeletonBlock className="h-4 w-28" />
                            <SkeletonBlock className="h-4 w-52" />
                            <SkeletonBlock className="h-6 w-20 rounded-full" />
                            <SkeletonBlock className="h-4 w-32" />

                            <div className="flex justify-center gap-2">
                                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-card rounded-[20px] p-6 border border-border shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <SkeletonBlock className="h-12 w-12 rounded-xl" />

                            <div className="space-y-3">
                                <SkeletonBlock className="h-4 w-28" />
                                <SkeletonBlock className="h-7 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
import { SkeletonBlock } from "./SkeletonBlock";

export function HallFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <SkeletonBlock className="h-8 w-56" />
                    <SkeletonBlock className="h-4 w-80" />
                </div>

                <SkeletonBlock className="h-12 w-32 rounded-xl" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-5">
                        <SkeletonBlock className="h-6 w-48" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />

                        <div className="grid grid-cols-2 gap-4">
                            <SkeletonBlock className="h-12 rounded-xl" />
                            <SkeletonBlock className="h-12 rounded-xl" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SkeletonBlock className="h-12 rounded-xl" />
                            <SkeletonBlock className="h-12 rounded-xl" />
                        </div>

                        <SkeletonBlock className="h-28 w-full rounded-xl" />
                    </div>

                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <SkeletonBlock className="h-6 w-48" />
                                <SkeletonBlock className="h-4 w-72" />
                            </div>

                            <SkeletonBlock className="h-5 w-5 rounded-full" />
                        </div>

                        <SkeletonBlock className="h-44 w-full rounded-xl" />
                        <SkeletonBlock className="h-16 w-full rounded-xl" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
                        <SkeletonBlock className="h-6 w-32" />
                        <SkeletonBlock className="aspect-[4/3] w-full rounded-xl" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                    </div>

                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
                        <SkeletonBlock className="h-6 w-40" />
                        <SkeletonBlock className="h-16 w-full rounded-xl" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                    </div>

                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
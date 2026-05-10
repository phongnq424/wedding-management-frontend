import { SkeletonBlock } from "./SkeletonBlock";

export function HallTypeFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <SkeletonBlock className="h-8 w-64" />
                    <SkeletonBlock className="h-4 w-96" />
                </div>

                <SkeletonBlock className="h-12 w-32 rounded-xl" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-5">
                        <SkeletonBlock className="h-6 w-48" />

                        <div className="space-y-3">
                            <SkeletonBlock className="h-4 w-36" />
                            <SkeletonBlock className="h-12 w-full rounded-xl" />
                            <SkeletonBlock className="h-3 w-52" />
                        </div>

                        <div className="space-y-3">
                            <SkeletonBlock className="h-4 w-32" />
                            <SkeletonBlock className="h-12 w-full rounded-xl" />
                            <SkeletonBlock className="h-3 w-44" />
                        </div>

                        <div className="space-y-3">
                            <SkeletonBlock className="h-4 w-28" />
                            <SkeletonBlock className="h-32 w-full rounded-xl" />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <SkeletonBlock className="h-5 w-5 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <SkeletonBlock className="h-4 w-44" />
                                <SkeletonBlock className="h-3 w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
                        <SkeletonBlock className="h-6 w-44" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                        <SkeletonBlock className="h-20 w-full rounded-xl" />
                    </div>

                    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm space-y-4">
                        <SkeletonBlock className="h-6 w-44" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                    </div>

                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "md" | "lg" | "xl" | "full" | string
  animate?: boolean
  color?: string
}

function Skeleton({
  className,
  rounded = "md",
  animate = true,
  color = "bg-muted",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        animate && "animate-pulse",
        `rounded-${rounded}`,
        color,
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

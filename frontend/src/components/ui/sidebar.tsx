import * as React from "react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/components/hooks/use-mobile"
import { useLocation } from "react-router-dom"

const SIDEBAR_COOKIE_NAME = "ladicare_sidebar_open"

export function Sidebar({
  children,
  menu,
}: {
  children?: React.ReactNode
  menu: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(true)
  const location = useLocation()

  React.useEffect(() => {
    const saved = document.cookie
      .split('; ')
      .find(row => row.startsWith(SIDEBAR_COOKIE_NAME + '='))
      ?.split('=')[1]
    if (saved !== undefined) setOpen(saved === 'true')
  }, [])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setOpen((prev) => {
          const next = !prev
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}`
          return next
        })
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <PanelLeft className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="w-[240px] pr-6">
            <SidebarMenu>{menu}</SidebarMenu>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        data-collapsed={!open}
        className={cn(
          "group/sidebar relative z-30 hidden h-full flex-col border-r bg-background text-muted-foreground lg:flex",
          !open && "w-14"
        )}
      >
        <div className="flex h-14 items-center justify-center border-b p-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setOpen((prev) => {
                const next = !prev
                document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}`
                return next
              })
            }}
          >
            <PanelLeft className={cn("h-5 w-5 transition-transform", open ? "rotate-0" : "-rotate-180")} />
          </Button>
        </div>
        <div className="flex-1">
          <SidebarMenu>{menu}</SidebarMenu>
        </div>
        <div className="flex items-center justify-center border-t p-4">
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>
    </TooltipProvider>
  )
}

export function SidebarMenu({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {children}
    </nav>
  )
}

export function SidebarMenuItem({
  icon: Icon,
  label,
  active,
  ...props
}: React.ComponentProps<"button"> & {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
}) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
            active && "bg-muted text-foreground hover:bg-muted",
            "w-full"
          )}
          {...props}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate whitespace-nowrap">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
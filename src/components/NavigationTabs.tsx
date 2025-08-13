'use client';

import { BoxIcon, HouseIcon, PanelsTopLeftIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    href: "/",
    icon: HouseIcon,
    label: "Home",
    value: "home"
  },
  {
    href: "/emotions", 
    icon: PanelsTopLeftIcon,
    label: "Emotions",
    value: "emotions",
    hasBadge: true,
    badgeCount: 3
  },
  {
    href: "/actions",
    icon: BoxIcon,
    label: "Actions", 
    value: "actions"
  }
]

export default function NavigationTabs() {
  const pathname = usePathname()

  return (
    <div className="dark">
      <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <TooltipProvider key={item.value} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex h-[calc(100%-1px)] flex-none items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-3 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 !h-8",
                      isActive 
                        ? "bg-background dark:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:border-input dark:bg-input/30 text-foreground shadow-sm"
                        : "text-foreground dark:text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    {item.hasBadge ? (
                      <span className="relative group">
                        <Icon size={16} aria-hidden="true" />
                        <Badge className="border-background absolute -top-2.5 left-full min-w-4 -translate-x-1.5 px-0.5 text-[10px]/[.875rem] transition-opacity group-hover:opacity-75">
                          {item.badgeCount}
                        </Badge>
                      </span>
                    ) : (
                      <Icon size={16} aria-hidden="true" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}
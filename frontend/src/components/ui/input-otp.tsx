import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

// Root OTP input wrapper
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center justify-center gap-2 sm:gap-3",
      containerClassName
    )}
    className={cn(
      "outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    aria-label="One-time password"
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

// Group multiple slots
const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 sm:gap-3", className)}
    {...props}
  />
))
InputOTPGroup.displayName = "InputOTPGroup"

// Each input character slot
const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots?.[index] || {}

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label={`Digit ${index + 1}`}
      aria-selected={isActive}
      className={cn(
        "relative flex h-12 w-10 items-center justify-center rounded-md border border-input bg-background text-lg font-medium text-foreground shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring sm:h-14 sm:w-12",
        isActive && "ring-2 ring-ring ring-offset-1",
        className
      )}
      {...props}
    >
      {char ?? ""}
      {hasFakeCaret && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-5 w-[1px] animate-caret-blink bg-foreground duration-700" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

// Optional separator (e.g. dot or hyphen)
const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-hidden
    className={cn("text-muted-foreground", className)}
    {...props}
  >
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

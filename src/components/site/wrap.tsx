import { cn } from "@/lib/utils";

/** Full-width page container: fills large screens, with generous side padding. */
export function Wrap({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-14", className)} {...props} />;
}

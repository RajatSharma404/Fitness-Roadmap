import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SurfaceLevel = "base" | "elevated" | "highlight";
type ActionVariant = "primary" | "secondary" | "danger";
export type StackActionState = "start" | "in_progress" | "done";

export interface TodayStackItem {
  id: string;
  title: string;
  detail: string;
  state: StackActionState;
}

interface CardProps {
  children: ReactNode;
  level?: SurfaceLevel;
  className?: string;
}

const levelClasses: Record<SurfaceLevel, string> = {
  base: "lab-surface-base",
  elevated: "lab-surface-elevated",
  highlight: "lab-surface-highlight",
};

export function Card({ children, level = "base", className }: CardProps) {
  return (
    <section className={cn("card p-4", levelClasses[level], className)}>
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        {kicker ? <p className="lab-kicker text-[#60a5fa]">{kicker}</p> : null}
        <h2 className="mt-1 font-display text-lg font-semibold text-[#eeeef2]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[#636380]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

interface MetricTileProps {
  label: string;
  value: string | number;
  note?: string;
  icon?: ReactNode;
  intent?: "neutral" | "action" | "progress" | "caution" | "danger";
}

const intentClasses: Record<NonNullable<MetricTileProps["intent"]>, string> = {
  neutral: "text-[#edf3f7]",
  action: "text-[#7fe8ff]",
  progress: "text-[#6be9af]",
  caution: "text-[#ffd36a]",
  danger: "text-[#ff6b6b]",
};

export function MetricTile({
  label,
  value,
  note,
  icon,
  intent = "neutral",
}: MetricTileProps) {
  return (
    <div className="card p-3">
      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-[#adc0cd]">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-2xl font-bold metric-number",
          intentClasses[intent],
        )}
      >
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-[#adc0cd]">{note}</p> : null}
    </div>
  );
}

interface ActionButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: ActionVariant;
}

const buttonVariants: Record<ActionVariant, string> = {
  primary: "lab-btn-primary",
  secondary: "lab-btn-secondary",
  danger:
    "border border-[rgba(255,107,107,0.55)] bg-[rgba(58,19,19,0.82)] text-[#ffb3b3] hover:border-[#ff6b6b]",
};

export function ActionButton({
  children,
  type = "button",
  onClick,
  className,
  disabled,
  variant = "primary",
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TodayStackPanelProps {
  items: TodayStackItem[];
  onStateChange: (id: string, next: StackActionState) => void;
  className?: string;
}

const stateOrder: StackActionState[] = ["start", "in_progress", "done"];
const stateLabel: Record<StackActionState, string> = {
  start: "Start",
  in_progress: "In Progress",
  done: "Done",
};

export function TodayStackPanel({
  items,
  onStateChange,
  className,
}: TodayStackPanelProps) {
  return (
    <Card level="elevated" className={cn("space-y-3", className)}>
      <SectionHeader
        kicker="Today Stack"
        title="Execute In This Order"
        description="Warmup -> Main lifts -> Accessories -> Recovery"
      />
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-lg border border-[rgba(67,81,95,0.45)] bg-[rgba(16,22,27,0.74)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#adc0cd]">
                  Step {index + 1}
                </p>
                <p className="text-sm font-semibold text-[#edf3f7]">
                  {item.title}
                </p>
                <p className="text-xs text-[#adc0cd]">{item.detail}</p>
              </div>
              <span className="rounded-full border border-[rgba(74,92,108,0.72)] px-2 py-0.5 text-[11px] text-[#7fe8ff]">
                {stateLabel[item.state]}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {stateOrder.map((state) => (
                <button
                  key={`${item.id}-${state}`}
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-[11px] transition",
                    item.state === state
                      ? "border border-[#16d9ff] bg-[#0b2f3a] text-white"
                      : "border border-[rgba(74,92,108,0.55)] bg-[#10161b] text-[#adc0cd] hover:text-[#edf3f7]",
                  )}
                  onClick={() => onStateChange(item.id, state)}
                >
                  {stateLabel[state]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

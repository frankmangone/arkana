interface QuizProgressBarProps {
  /** 0-based count of questions already answered - the current question's index. */
  position: number;
  total: number;
  label: string;
}

export function QuizProgressBar({ position, total, label }: QuizProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (position / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow text-ink-faint">{label}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay">
        <div
          className="h-full rounded-full bg-primary-700 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

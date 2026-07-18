import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

// A simple cross (both diagonals, no filled diamond) with the left/right
// arm stubs — minimal and static, for any "nothing more here" state.
export const MUTED_CROSS_GLYPH: Pattern["elements"] = {
  left: true,
  right: true,
  top: false,
  bottom: false,
  top_left_ray: false,
  top_right_ray: false,
  bottom_left_ray: false,
  bottom_right_ray: false,
  top_left_left_side: false,
  top_top_left_side: false,
  top_top_right_side: false,
  top_right_right_side: false,
  bottom_right_right_side: false,
  bottom_bottom_right_side: false,
  bottom_bottom_left_side: false,
  bottom_left_left_side: false,
  central_diagonal_1: false,
  central_diagonal_2: false,
};

export const MUTED_CROSS_COLOR = "hsla(260, 20%, 60%, 0.5)";

interface EndOfFeedProps {
  message: string;
  className?: string;
}

export function EndOfFeed({ message, className }: EndOfFeedProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-10 text-center ${className ?? ""}`}
    >
      <ArkanaPattern
        elements={MUTED_CROSS_GLYPH}
        canvasSize={36}
        lineColor={MUTED_CROSS_COLOR}
        backgroundColor="transparent"
      />
      <p className="text-sm text-ink-faint">{message}</p>
    </div>
  );
}

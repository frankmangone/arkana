import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

// Central diamond plus all four diagonal rays, no outer sides — reads
// cleanly as a glyph even while spinning.
const SPINNER_GLYPH: Pattern["elements"] = {
  left: true,
  right: true,
  top: true,
  bottom: true,
  top_left_ray: true,
  top_right_ray: true,
  bottom_left_ray: true,
  bottom_right_ray: true,
  top_left_left_side: false,
  top_top_left_side: false,
  top_top_right_side: false,
  top_right_right_side: false,
  bottom_right_right_side: false,
  bottom_bottom_right_side: false,
  bottom_bottom_left_side: false,
  bottom_left_left_side: false,
  central_diagonal_1: true,
  central_diagonal_2: true,
};

interface ArkanaSpinnerProps {
  size?: number;
  className?: string;
}

export function ArkanaSpinner({ size = 32, className }: ArkanaSpinnerProps) {
  return (
    <ArkanaPattern
      elements={SPINNER_GLYPH}
      canvasSize={size}
      lineColor="hsla(260, 80%, 68%, 0.7)"
      backgroundColor="transparent"
      className={`animate-spin ${className ?? ""}`}
    />
  );
}

import ArkanaPattern from "@/components/arkana-pattern";

// A fixed, symmetric glyph — the divider mark stays identical everywhere
const DIVIDER_GLYPH = {
  left: true,
  right: true,
  top: false,
  bottom: false,
  top_left_ray: false,
  top_right_ray: false,
  bottom_left_ray: false,
  bottom_right_ray: false,
  top_left_left_side: true,
  top_top_left_side: true,
  top_top_right_side: true,
  top_right_right_side: true,
  bottom_right_right_side: true,
  bottom_bottom_right_side: true,
  bottom_bottom_left_side: true,
  bottom_left_left_side: true,
  central_diagonal_1: true,
  central_diagonal_2: true,
};

/**
 * SectionDivider component
 *
 * A centered Arkana glyph flanked by hairline rules.
 *
 * @returns {JSX.Element} The SectionDivider component
 */
export function SectionDivider() {
  return (
    <div
      className="my-12 flex items-center justify-center gap-6"
      aria-hidden="true"
    >
      <span className="h-px w-full max-w-24 bg-rule" />
      <ArkanaPattern
        elements={DIVIDER_GLYPH}
        canvasSize={24}
        lineWidth={1.5}
        lineColor="#a777ff"
        backgroundColor="transparent"
        className="opacity-70"
      />
      <span className="h-px w-full max-w-24 bg-rule" />
    </div>
  );
}

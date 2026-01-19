/**
 * SectionDivider component
 * 
 * This component is used to display a section divider.
 * It is a horizontal line with three dots in the center.
 * 
 * @returns {JSX.Element} The SectionDivider component
 */
export function SectionDivider() {
  return (
    <div className="flex justify-center items-center gap-[1.8rem] my-12 text-center">
      <span className="text-[1.1rem] leading-none text-foreground opacity-60">•</span>
      <span className="text-[1.1rem] leading-none text-foreground opacity-60">•</span>
      <span className="text-[1.1rem] leading-none text-foreground opacity-60">•</span>
    </div>
  );
}

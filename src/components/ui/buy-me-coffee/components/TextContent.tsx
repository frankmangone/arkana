interface TextContentProps {
  title: string;
  description: string;
  authorName: string;
}

export function TextContent({ title, description, authorName }: TextContentProps) {
  return (
    <div className="mb-8 max-w-2xl">
      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 flex items-center gap-2">
        {title}
      </h3>
      <p className="text-gray-200 text-base md:text-lg">
        {description.replace('{authorName}', authorName)}
      </p>
    </div>
  );
}

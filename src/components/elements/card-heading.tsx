export const CardHeading = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-3 h-3 rounded-full bg-red-500" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" />
      <div className="w-3 h-3 rounded-full bg-green-500" />
      <div className="ml-2 text-xs text-muted-foreground tracking-wider">
        {title}
      </div>
    </div>
  );
};
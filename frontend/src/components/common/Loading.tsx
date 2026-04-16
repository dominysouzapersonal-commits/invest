export default function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-4 h-4 border border-text-faint border-t-text-secondary rounded-full animate-spin" />
      <p className="text-xs text-text-muted">{text}</p>
    </div>
  );
}

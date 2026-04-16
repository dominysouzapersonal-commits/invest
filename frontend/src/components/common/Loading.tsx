export default function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-5 h-5 border border-text-muted border-t-white rounded-full animate-spin" />
      <p className="text-[13px] text-text-muted">{text}</p>
    </div>
  );
}

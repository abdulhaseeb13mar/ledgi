import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
}

export function PageHeader({ title, showBack = false }: PageHeaderProps) {
  return (
    <div className="mb-2 flex items-center gap-3">
      {showBack && (
        <button onClick={() => window.history.back()} className="rounded-lg p-1 text-gray-600 hover:bg-gray-100">
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="text-xl font-bold text-[#01017e]">{title}</h1>
    </div>
  );
}

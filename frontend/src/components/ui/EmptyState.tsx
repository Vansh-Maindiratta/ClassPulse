import { Inbox } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <Inbox className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}

import { type ComponentProps, type ReactNode } from "react";

import { PageHeader } from "@/components/PageHeader";

interface ScrollablePageLayoutProps {
  headerProps: ComponentProps<typeof PageHeader>;
  submitSection?: ReactNode;
  children: ReactNode;
}

export function ScrollablePageLayout({ headerProps, submitSection, children }: ScrollablePageLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col">
      <PageHeader {...headerProps} />

      <div className="flex-1 overflow-y-auto pb-2">{children}</div>

      {submitSection && <div className="mt-4 shrink-0">{submitSection}</div>}
    </div>
  );
}

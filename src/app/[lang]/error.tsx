"use client";

import { useParams } from "next/navigation";
import { StatusPanel } from "@/components/layout/StatusPanel";
import { Button, ButtonLink } from "@/components/ui/Button";
import { defaultLocale, isLocale, localizedHref } from "@/i18n/config";
import { statusCopy } from "@/i18n/status-copy";

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ lang: string }>();
  const locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const copy = statusCopy[locale];

  return (
    <StatusPanel code="—" title={copy.errorTitle} body={copy.errorBody}>
      <Button onClick={reset} variant="accent">
        {copy.retry}
      </Button>
      <ButtonLink href={localizedHref(locale)} variant="outlineLight">
        {copy.home}
      </ButtonLink>
    </StatusPanel>
  );
}

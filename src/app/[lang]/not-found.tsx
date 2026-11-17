import { StatusPanel } from "@/components/layout/StatusPanel";
import { ButtonLink } from "@/components/ui/Button";
import { localizedHref } from "@/i18n/config";
import { getLocale } from "@/i18n/get-dictionary";
import { statusCopy } from "@/i18n/status-copy";

export default async function NotFound() {
  const locale = await getLocale();
  const copy = statusCopy[locale];
  return (
    <StatusPanel code="404" title={copy.notFoundTitle} body={copy.notFoundBody}>
      <ButtonLink href={localizedHref(locale)} variant="accent">
        {copy.home}
      </ButtonLink>
    </StatusPanel>
  );
}

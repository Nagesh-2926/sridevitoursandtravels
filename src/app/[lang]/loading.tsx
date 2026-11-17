import { Spinner } from "@/components/ui/Spinner";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function Loading() {
  const { dict } = await getDictionary();
  return (
    <div className="surface-atmos vignette flex min-h-[70svh] items-center justify-center pt-(--header-height)">
      <Spinner label={dict.status.loading} className="[&_span]:text-mist" />
    </div>
  );
}

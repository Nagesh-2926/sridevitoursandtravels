import {
  BookUser,
  Briefcase,
  Bus,
  Compass,
  FileUser,
  Globe,
  GraduationCap,
  IdCard,
  Landmark,
  Plane,
  Printer,
  Stethoscope,
  TrainFront,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIcon as ServiceIconName } from "@/config/services";

const icons: Record<ServiceIconName, LucideIcon> = {
  plane: Plane,
  train: TrainFront,
  bus: Bus,
  temple: Landmark,
  passport: BookUser,
  idCard: IdCard,
  medical: Stethoscope,
  printer: Printer,
  bill: Zap,
  briefcase: Briefcase,
  resume: FileUser,
  graduation: GraduationCap,
  compass: Compass,
  globe: Globe,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceIconName;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" strokeWidth={1.25} className={className} />;
}

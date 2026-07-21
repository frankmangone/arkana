import { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface NotificationsPageParams {
  lang: string;
}

interface NotificationsPageProps {
  params: Promise<NotificationsPageParams>;
}

export async function generateMetadata({
  params,
}: NotificationsPageProps): Promise<Metadata> {
  const { lang } = await params;

  return generateBaseMetadata({
    lang,
    path: "notifications",
    title: "Arkana | Notifications",
    description: "Your notifications on Arkana.",
    type: "website",
  });
}

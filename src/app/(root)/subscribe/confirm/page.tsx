import { Suspense } from "react";
import { SubscribeConfirmClient } from "./subscribe-confirm-client";

export default function SubscribeConfirmPage() {
  return (
    <Suspense fallback={null}>
      <SubscribeConfirmClient />
    </Suspense>
  );
}

import { Button } from "../button";
import { UseMutationResult } from "@tanstack/react-query";
import { ToggleReadResponse } from "@/lib/api/services/posts";
import { UseToggleReadParams } from "@/lib/api";
import { Circle, CheckCircle2 } from "lucide-react";

interface ReadButtonProps {
  read: boolean;
  handleRead: () => void;
  readMutation: UseMutationResult<ToggleReadResponse, Error, UseToggleReadParams>;
}

export function ReadButton(props: ReadButtonProps) {
  const { read, handleRead, readMutation } = props;
  const Icon = read ? CheckCircle2 : Circle;

  return (
    <Button
      variant="ghost"
      className={`h-auto !px-2.5 !py-2 rounded-[4px] cursor-pointer bg-transparent hover:bg-black/10 flex items-center gap-1.5 ${
        read ? "text-primary-700 hover:text-primary-900" : "text-white/70 hover:text-white"
      }`}
      aria-label={read ? "Mark post as unread" : "Mark post as read"}
      title={read ? "Mark post as unread" : "Mark post as read"}
      onClick={handleRead}
      disabled={readMutation.isPending}
    >
      <Icon className="!size-5" strokeWidth={2} />
    </Button>
  );
}

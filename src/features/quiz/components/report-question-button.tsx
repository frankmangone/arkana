"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFlagQuestion } from "@/lib/api";
import { EVENTS, trackEvent } from "@/lib/analytics";
import type { QuizzesDictionary } from "@/features/quiz/types";

const MAX_REASON_LENGTH = 1000;

interface ReportQuestionButtonProps {
  questionUuid: string;
  dictionary: QuizzesDictionary;
}

const styles = {
  trigger: "flex justify-center",
  reasonChips: "flex flex-wrap gap-2",
  textarea:
    "w-full min-h-[100px] resize-y field-sizing-content max-h-[50vh] rounded-[4px] border border-rule-strong bg-surface-raised p-3 text-sm text-ink-body placeholder:text-ink-faint transition-[border-color,box-shadow] focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/25",
};

export function ReportQuestionButton({ questionUuid, dictionary }: ReportQuestionButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const flagQuestion = useFlagQuestion();
  const strings = dictionary.report;

  const addReason = (label: string) => {
    setReason((current) => {
      if (!current.trim()) return label;
      if (current.includes(label)) return current;
      return `${current}; ${label}`;
    });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setReason("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.length > MAX_REASON_LENGTH) return;

    try {
      await flagQuestion.mutateAsync({ questionUuid, reason: reason.trim() });
      trackEvent(EVENTS.QUESTION_FLAGGED);
      toast.success(strings.success);
      handleOpenChange(false);
    } catch {
      toast.error(strings.error);
    }
  };

  return (
    <>
      <div className={styles.trigger}>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Flag aria-hidden="true" className="size-3.5" />
          {strings.trigger}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{strings.modalTitle}</DialogTitle>
            <DialogDescription>{strings.modalDescription}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className={styles.reasonChips}>
              {Object.entries(strings.reasons).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addReason(label)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={strings.placeholder}
              className={styles.textarea}
              disabled={flagQuestion.isPending}
              autoFocus
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={flagQuestion.isPending}
              >
                {strings.cancel}
              </Button>
              <Button
                type="submit"
                disabled={!reason.trim() || reason.length > MAX_REASON_LENGTH || flagQuestion.isPending}
              >
                {flagQuestion.isPending ? strings.sending : strings.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

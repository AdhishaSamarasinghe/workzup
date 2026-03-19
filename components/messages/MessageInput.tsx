"use client";

import { useState } from "react";

type MessageInputProps = {
  disabled: boolean;
  sending: boolean;
  onSend: (value: string) => Promise<void>;
};

export default function MessageInput({ disabled, sending, onSend }: MessageInputProps) {
  const [value, setValue] = useState("");

  const submit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || disabled || sending) {
      return;
    }

    setValue("");

    try {
      await onSend(trimmedValue);
    } catch {
      setValue(trimmedValue);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-end gap-3">
        <textarea
          rows={1}
          value={value}
          disabled={disabled || sending}
          placeholder="Type a message"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          className="max-h-32 min-h-[52px] flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#6b8bff] focus:bg-white focus:ring-4 focus:ring-[#6b8bff]/10 disabled:cursor-not-allowed disabled:opacity-70"
        />

        <button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || sending || !value.trim()}
          className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-3xl bg-[#6b8bff] px-5 text-sm font-semibold text-white transition hover:bg-[#5a7af0] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

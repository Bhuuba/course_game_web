import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useGameStore } from '../../state/useGameStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { cn, formatNarration } from '../../lib/utils';

export function ChatPanel() {
  const { messages, sessionId, playerId } = useGameStore((state) => ({
    messages: state.messages,
    sessionId: state.sessionId,
    playerId: state.playerId,
  }));
  const [value, setValue] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      await api.sendMessage({ sessionId, text: value });
    },
    onSuccess: () => setValue(''),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim() || !sessionId) return;
    mutation.mutate();
  };

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Чат</h2>
      </div>
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'rounded-md border px-3 py-2 text-sm shadow-sm',
                message.playerId === playerId && 'border-primary bg-primary/10',
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium capitalize">{message.author}</span>
                <span>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {formatNarration(message.text)}
              </p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <form onSubmit={onSubmit} className="flex gap-2 border-t px-4 py-3">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Напишіть повідомлення..."
          disabled={mutation.isPending || !sessionId}
        />
        <Button type="submit" disabled={mutation.isPending || !value.trim()}>
          Надіслати
        </Button>
      </form>
    </div>
  );
}

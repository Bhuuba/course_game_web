import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useGameStore } from '../../state/useGameStore';
import { toast } from 'sonner';

export function PuzzleOne() {
  const sessionId = useGameStore((state) => state.sessionId);
  const patchFlags = useGameStore((state) => state.patchStoryFlags);
  const [answer, setAnswer] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return { correct: false };
      return api.validatePuzzle({ sessionId, answer });
    },
    onSuccess: (data) => {
      if (data?.correct) {
        toast.success('Двері відчиняються!');
        patchFlags({ openedDoorA: true });
      } else {
        toast.error('Ще ні. Спробуй інакшу комбінацію.');
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="flex items-end gap-2"
    >
      <div className="flex-1">
        <label className="text-sm font-medium">Порядок символів</label>
        <Input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Напр. TRI-CIRCLE-SQUARE"
          disabled={mutation.isPending || !sessionId}
        />
      </div>
      <Button type="submit" disabled={mutation.isPending || !answer.trim()}>
        Перевірити
      </Button>
    </form>
  );
}

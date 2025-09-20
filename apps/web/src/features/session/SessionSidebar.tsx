import { useMutation } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useGameStore } from '../../state/useGameStore';
import { api } from '../../lib/api';

export function SessionSidebar({ showStart }: { showStart?: boolean }) {
  const { sessionId, sessionCode, players, isOwner } = useGameStore(
    (state) => ({
      sessionId: state.sessionId,
      sessionCode: state.sessionCode,
      players: state.players,
      isOwner: state.isOwner,
    }),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      await api.startSession({ sessionId });
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Гравці
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionCode ? (
            <div className="text-sm text-muted-foreground">
              Код сесії:{' '}
              <span className="font-mono text-base text-foreground">
                {sessionCode}
              </span>
            </div>
          ) : null}
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>{player.displayName}</span>
                {player.isOwner ? <Badge variant="outline">GM</Badge> : null}
              </li>
            ))}
            {players.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Чекаємо на гравців…
              </li>
            )}
          </ul>
          {showStart && isOwner ? (
            <Button
              className="w-full"
              onClick={() => mutation.mutate()}
              disabled={
                mutation.isPending || !sessionId || players.length === 0
              }
            >
              Почати пригоду
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

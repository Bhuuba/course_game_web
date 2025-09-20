import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useGameStore } from '../../state/useGameStore';
import { useSessionSubscriptions } from '../../features/session/useSessionSubscriptions';
import { SessionSidebar } from '../../features/session/SessionSidebar';

export function LobbyRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = useGameStore((state) => state.sessionId);
  const session = useGameStore((state) => state.session);
  const setSessionRef = useGameStore((state) => state.setSessionRef);

  useEffect(() => {
    if (
      !sessionId &&
      (location.state as { sessionId?: string } | null)?.sessionId
    ) {
      const { sessionId: incoming } = location.state as { sessionId?: string };
      if (incoming) {
        setSessionRef(incoming);
      }
    }
  }, [location.state, sessionId, setSessionRef]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [navigate, sessionId]);

  useEffect(() => {
    if (session?.status === 'active' && sessionId) {
      navigate(`/session/${sessionId}`);
    }
  }, [navigate, session?.status, sessionId]);

  useSessionSubscriptions(sessionId);

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Лобі пригоди</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Поділись кодом з друзями та починай, коли всі готові.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p>
              Код сесії:{' '}
              <span className="font-mono text-lg font-bold">
                {session?.code ?? '------'}
              </span>
            </p>
            <p className="mt-2 text-muted-foreground">
              Статус:{' '}
              <span className="font-medium">{session?.status ?? 'lobby'}</span>
            </p>
          </div>
          <Button
            onClick={() => sessionId && navigate(`/session/${sessionId}`)}
          >
            Перейти до сцени
          </Button>
        </CardContent>
      </Card>
      <SessionSidebar showStart />
    </div>
  );
}

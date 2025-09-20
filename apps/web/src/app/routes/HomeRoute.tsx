import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import { useGameStore } from '../../state/useGameStore';
import { toast } from 'sonner';

export function HomeRoute() {
  const navigate = useNavigate();
  const setSession = useGameStore((state) => state.setSession);
  const setSessionRef = useGameStore((state) => state.setSessionRef);
  const playerId = useGameStore((state) => state.playerId);

  const [createName, setCreateName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await api.createSession({ displayName: createName });
      setSession(
        {
          id: result.sessionId,
          code: result.code,
          status: 'lobby',
          ownerId: playerId ?? '',
          createdAt: Date.now(),
        },
        result.code,
      );
      setSessionRef(result.sessionId, result.code);
      return result;
    },
    onSuccess: () => {
      navigate('/lobby');
    },
    onError: () => toast.error('Не вдалося створити сесію'),
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const code = joinCode.trim().toUpperCase();
      const result = await api.joinSession({ code, displayName: joinName });
      setSessionRef(result.sessionId, code);
      return result;
    },
    onSuccess: (data) => {
      navigate('/lobby', { state: { sessionId: data.sessionId } });
    },
    onError: () => toast.error('Не вдалося приєднатися'),
  });

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate();
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    joinMutation.mutate();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Створити нову сесію</CardTitle>
          <CardDescription>
            Запроси друзів і стань провідником пригоди.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ваше ім’я</label>
              <Input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Архітектор пригод"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || createName.length < 2}
            >
              Створити сесію
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Приєднатися за кодом</CardTitle>
          <CardDescription>Введи код, який надіслав твій GM.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ваше ім’я</label>
              <Input
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                placeholder="Напр. Шукач Тіней"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Код сесії</label>
              <Input
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(event.target.value.toUpperCase())
                }
                placeholder="ABC123"
                maxLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                joinMutation.isPending ||
                joinCode.length !== 6 ||
                joinName.length < 2
              }
            >
              Приєднатися
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

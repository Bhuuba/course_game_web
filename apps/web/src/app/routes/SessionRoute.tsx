import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatPanel } from '../../features/chat/ChatPanel';
import { InventoryPanel } from '../../features/inventory/InventoryPanel';
import { ScenePanel } from '../../features/scene/ScenePanel';
import { SessionSidebar } from '../../features/session/SessionSidebar';
import { useSessionSubscriptions } from '../../features/session/useSessionSubscriptions';
import { useGameStore } from '../../state/useGameStore';

export function SessionRoute() {
  const params = useParams<{ sessionId: string }>();
  const storeSessionId = useGameStore((state) => state.sessionId);
  const setSessionRef = useGameStore((state) => state.setSessionRef);

  useEffect(() => {
    if (params.sessionId && params.sessionId !== storeSessionId) {
      setSessionRef(params.sessionId);
    }
  }, [params.sessionId, setSessionRef, storeSessionId]);

  useSessionSubscriptions(params.sessionId ?? storeSessionId);

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1.2fr_1fr]">
      <ScenePanel />
      <div className="flex h-full flex-col gap-4">
        <ChatPanel />
      </div>
      <div className="space-y-4">
        <SessionSidebar />
        <InventoryPanel />
      </div>
    </div>
  );
}

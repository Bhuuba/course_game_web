import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { subscribeGM } from '../../lib/sse';
import { GmOut } from '../../lib/zod';
import { useGameStore } from '../../state/useGameStore';
import { PuzzleOne } from './PuzzleOne';

export function ScenePanel() {
  const sessionId = useGameStore((state) => state.sessionId);
  const storyState = useGameStore((state) => state.storyState);
  const gmStream = useGameStore((state) => state.gmStream);
  const pushChunk = useGameStore((state) => state.pushGmChunk);
  const resetStream = useGameStore((state) => state.resetGmStream);
  const updateStory = useGameStore((state) => state.updateStoryFromGm);
  const [isStreaming, setIsStreaming] = useState(false);
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => () => unsubscribeRef.current?.(), []);

  const handleNextScene = () => {
    if (!sessionId || isStreaming) return;
    resetStream();
    setIsStreaming(true);
    unsubscribeRef.current = subscribeGM(
      sessionId,
      (chunk) => pushChunk(chunk),
      (payload) => {
        setIsStreaming(false);
        const parsed = GmOut.safeParse(payload);
        if (parsed.success) {
          updateStory({
            narration: parsed.data.narration,
            publicHints: parsed.data.publicHints,
            privateHints: parsed.data.privateHints,
          });
        }
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Нарація</CardTitle>
          <Button
            onClick={handleNextScene}
            disabled={!sessionId || isStreaming}
          >
            GM: наступна сцена
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="max-h-64 rounded-md border p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {storyState?.narration ?? 'GM ще готує опис...'}
            </p>
            {gmStream.length > 0 && (
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                {gmStream.map((chunk, index) => (
                  <p key={`${chunk}-${index}`}>{chunk}</p>
                ))}
                {isStreaming ? <p>GM друкує...</p> : null}
              </div>
            )}
          </ScrollArea>
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Підказки
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {(storyState?.publicHints ?? []).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
              {storyState?.publicHints?.length === 0 && (
                <li className="list-none text-muted-foreground">
                  Ще немає підказок.
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Головоломка: Символи дверей</CardTitle>
        </CardHeader>
        <CardContent>
          <PuzzleOne />
        </CardContent>
      </Card>
    </div>
  );
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useGameStore } from '../../state/useGameStore';

export function InventoryPanel() {
  const storyState = useGameStore((state) => state.storyState);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Інвентар</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(storyState?.inventory ?? []).map((item) => (
              <li key={item} className="rounded-md border px-3 py-2">
                {item}
              </li>
            ))}
            {storyState?.inventory?.length === 0 && (
              <li className="text-muted-foreground">Поки що порожньо.</li>
            )}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Статус</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {Object.entries(storyState?.flags ?? {}).map(([key, value]) => (
              <li key={key} className="flex justify-between gap-2">
                <span className="font-medium capitalize">{key}</span>
                <span className="text-muted-foreground">{String(value)}</span>
              </li>
            ))}
            {Object.keys(storyState?.flags ?? {}).length === 0 && (
              <li className="text-muted-foreground">Ще немає оновлень.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

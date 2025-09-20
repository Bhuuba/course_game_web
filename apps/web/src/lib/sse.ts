export function subscribeGM(
  sessionId: string,
  onChunk: (text: string) => void,
  onDone: (data: unknown) => void,
) {
  const es = new EventSource(`/api/gm-sse?sessionId=${sessionId}`);
  let buffer = '';
  es.onmessage = (event) => {
    if (event.data === '[DONE]') {
      try {
        onDone(JSON.parse(buffer));
      } catch (err) {
        console.error('Failed to parse GM payload', err);
      }
      es.close();
    } else {
      buffer += event.data;
      onChunk(event.data);
    }
  };
  es.onerror = () => es.close();
  return () => es.close();
}

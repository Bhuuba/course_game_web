import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomeRoute } from './routes/HomeRoute';
import { LobbyRoute } from './routes/LobbyRoute';
import { SessionRoute } from './routes/SessionRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'lobby', element: <LobbyRoute /> },
      { path: 'session/:sessionId', element: <SessionRoute /> },
    ],
  },
]);

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: 'ab16f53fdadf06641345',
  secret: process.env.PUSHER_SECRET || '',
  cluster: 'us2',
  useTLS: true,
});

export const pusherClient = new PusherClient('ab16f53fdadf06641345', {
  cluster: 'us2',
});

export const EVENTS = {
  CONSULTANT_MOVED: 'consultant-moved',
  CONSULTANT_ADDED: 'consultant-added',
  CONSULTANT_DELETED: 'consultant-deleted',
  PROJECT_ADDED: 'project-added',
  PROJECT_DELETED: 'project-deleted',
  CLIENT_ADDED: 'client-added',
  CLIENT_DELETED: 'client-deleted',
};

export const CHANNELS = {
  KANBAN_UPDATES: 'kanban-updates',
};

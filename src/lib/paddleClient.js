import { initializePaddle } from '@paddle/paddle-js';

let paddle = null;

export const getPaddleInstance = async () => {
  if (paddle) return paddle;
  
  paddle = await initializePaddle({
    environment: 'production',
    token: 'live_b7e94ab41d27efdba8a08f9f356'
  });
  
  return paddle;
};
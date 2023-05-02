import { initializeTestDatabase } from './utils';

export default async function globalSetup() {
  await initializeTestDatabase();
}

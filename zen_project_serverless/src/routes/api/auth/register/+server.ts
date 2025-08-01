import { registerUser } from "$lib/services/auth-service.js";

export async function POST({ request }) {
  const data = await request.json();
  return await registerUser(data);
}

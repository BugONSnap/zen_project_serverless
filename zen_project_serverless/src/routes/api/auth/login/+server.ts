import { loginUser } from "$lib/services/auth-service.js";

export async function POST({ request, cookies }) {
  const data = await request.json();
  return await loginUser(data, cookies);
}

import { auth } from "@/lib/auth"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return auth.handler(req as any)
}

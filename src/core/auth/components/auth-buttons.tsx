import { Button } from "@/components/ui/button"
import Link from "next/link"


export const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Signup</Link>
      </Button>
    </div>
  )
}
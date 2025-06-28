import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  redirect("/home")
  return null
}

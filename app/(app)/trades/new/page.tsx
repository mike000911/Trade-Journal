import { redirect } from "next/navigation";
import { getDateKey } from "@/lib/date";

export default function NewTradePage() {
  redirect(`/calendar?date=${getDateKey(new Date())}`);
}

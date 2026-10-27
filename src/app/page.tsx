import { redirect } from "next/navigation";

// Le proxy oriente déjà « / » vers /etudiant ou /login ; filet de sécurité si on arrive ici.
export default function Home() {
  redirect("/etudiant");
}

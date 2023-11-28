import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import Thread from "@/lib/models/thread.model";
import { UserButton, currentUser } from "@clerk/nextjs";

 
async function Home() {
  const result = await fetchThreads();
  const user = await currentUser();
  return (
    <>
      <h1>Accueil</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.threads.length === 0 ? (
          <p className="no-result"> Pas de posts </p>
        ): (
          <>
            {result.threads.map((thread) => (
              <ThreadCard 
                key= {thread._id}
                id={thread._id}
                currentUserId={user?.id || ""}
                parentId={thread.parentId}
                content= {thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
            ))}
          </>
        )}
         
      </section>
    </>
  )
}

export default Home;
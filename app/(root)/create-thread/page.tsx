import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation"; 

import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";



async function page() {
    const user = await currentUser();
    if(!user) return null;

    //fecth organisation list created by user
    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect("/onboarding");

    return(
        <>
            <h1 className="head-text">Creer un post</h1>

            <PostThread userId ={userInfo._id} />
        </>
    )
}

export default page;
"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";

export async function fetchUser(userId: string){
    
  try {
      connectToDB();

      return await User.findOne({ id: userId }).populate({
        path: 'communities',
        model: Community
      })
  } catch (error: any) {
     throw new Error(`impossible d'afficher L'utilisateur: ${error.message}`)
  }
}

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}
// updateSer function is going to return a promise and its going to be void
export async function updateUser({
    userId,
    username,
    name,
    bio, 
    image,
    path, 
} : Params): Promise<void> {
   try {

    //Connexion a la base de donnee
    connectToDB();
    await User.findOneAndUpdate(
        { id: userId },
        {
          username: username.toLowerCase(),
          name,
          bio,
          image,
          onboarded: true,
        },

        /** upserting simply mean both updating and inserting */
        { upsert: true }
    );

        if(path === "/pofile/edit"){

          //Revalidate a specific data associate with a specific path
          revalidatePath(path);
        }
   } catch (error: any) {
        throw new Error(`impossible de creer/mettre a jour l'utilsateur: ${error.message} `)
   }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB(); // Établit la connexion à la base de données.

    //Calcule le nombre d'utilisateurs à ignorer en fonction du numéro de page et de la taille de la page.
    const skipAmount = (pageNumber - 1) * pageSize;

    //Crée une expression régulière insensible à la casse pour la chaîne de recherche fournie.
    const regex  = new RegExp(searchString, "i");

    // Crée un objet de requête initial pour filtrer les utilisateurs.
    const query: FilterQuery<typeof User> = {
      id: { 
        $ne: userId 
      }, // Exclut l'utilisateur actuel des résultats.
    }

    // Si la chaîne de recherche n'est pas vide, ajoute l'opérateur $or pour faire correspondre le nom d'utilisateur ou le nom.
    if(searchString.trim() !== "") {
      query.$or = [
        {username: {$regex: regex }},
        { name: { $regex: regex }},
      ];
    }
    // Définit les options de tri pour les utilisateurs récupérés en fonction du champ createdAt et de l'ordre de tri fourni.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)// Effectue une requête pour récupérer les utilisateurs filtrés.
      .sort(sortOptions) // Trie les utilisateurs selon les options de tri définies.
      .skip(skipAmount) // Ignore les utilisateurs selon le nombre à sauter (pagination).
      .limit(pageSize); // Limite le nombre d'utilisateurs récupérés par page.

    // Compte le nombre total d'utilisateurs correspondant aux critères de recherche (sans la pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users  = await usersQuery.exec(); // Exécute la requête pour récupérer les utilisateurs.

    // Vérifie s'il y a plus d'utilisateurs au-delà de la page actuelle.
    const isNext = totalUsersCount > skipAmount + users.length

    return { users, isNext } // Renvoie les utilisateurs récupérés avec un indicateur s'il y a plus d'utilisateurs.

  } catch (error: any) {
    
      console.error("Erreur d'affichage de l'utilisateur:", error); // Affiche une erreur s'il y a un problème lors de la récupération des utilisateurs.
      throw error; // Lance une nouvelle erreur pour indiquer l'échec de la récupération des utilisateurs.

  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
      console.error("Error fetching replies: ", error);
      throw error;
  }
}

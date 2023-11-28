"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
//import Community from "../models/community.model";

interface Params {
    text: string,
    author: string,
    communityId: string | null, 
    path: string
}

export async function createThread({ text, author, communityId, path}: Params) {
    try {
        connectToDB();

        const createdThread = await Thread.create({
            text,
            author,
            communityId: null,
        });

        /**  Update User 
         * Ce nest pas assez de juste creer un thread 
         * il faut le push dans la table user correspondant 
         * */ 
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })

        // make sur change is happened immediately
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Impossible de creer un thread: ${error.message}`)
    }
}

/**
 * Récupère les threads principaux (top-level threads) avec pagination.
 * en récupérant les détails des auteurs, 
 * des communautés et des enfants associés à chaque post.
 * @param pageNumber Le numéro de la page.
 * @param pageSize La taille de la page.
 * @returns Un objet contenant les threads paginés et un indicateur (isNext) s'il y a plus de posts à récupérer.
 */
export async function fetchThreads(pageNumber = 1, pageSize = 20){
  connectToDB();

  // Calcul du nombre de posts à ignorer en fonction de la pagination.
  const skipAmount = (pageNumber - 1)* pageSize;

 
  /** Récupération des threads principaux (top-level threads) avec relations associées. */
  const threadsQuery = Thread.find({parentId: {$in: [null, undefined] } })

    // La requête trie les posts par date de création décroissante,
    .sort({ createdAt: "desc" })
    //Saute les posts qui doivent être ignorés en fonction de la pagination, 
    .skip(skipAmount)
    //Limite le nombre de posts récupérés à la taille de la page spécifiée. 
    .limit(pageSize)
    //Les champs author, community, et children (enfants) sont peuplés (populés) pour récupérer les détails des auteurs, des communautés et des enfants de chaque post.
    .populate({
      path: "author",
      model: User,
    })
    /* .populate({
      path: "community",
      model: Community,
    }) */
    .populate({
      path: "children", // peuplés (populés) pour récupérer les détails de l'enfant
      populate: {
        path: "author", // peuplés (populés) pour récupérer les détails l'auteur
        model: User,
        select: "_id name parentId image," // Selectionner seulement le champ '_id 'et 'username' de l'auter
      }
    });

    /** Comptage total des threads principaux (top-level threads).. */
    const totalThreadsCount = await Thread.countDocuments({
      parentId: {$in: [null, undefined] }, 
    });

    const threads = await threadsQuery.exec();

    /** Détermination s'il y a plus de posts à récupérer.*/
    const isNext = totalThreadsCount > skipAmount + threads.length;

    return { threads, isNext };
}

/** Afficher les Threads pa id
 * Utilise .populate() pour récupérer les détails des auteurs, 
 * des communautés, et des enfants du fil de discussion, 
 * y compris les auteurs des commentaires et des réponses imbriquées.
 * @param threadId 
 */
export async function fetchThreadById(threadId: string){
  connectToDB();

  try {
    const thread = await Thread.findById(threadId) 
      .populate({
        path: "author",
        model: User,
        select: "_id id name image"
      }) // populate le champ author avec _id et username
      /* .populate({
        path:"community",
        model: Community,
        select: "_id id name image",
      }) */
      .populate({
        path: "children", // populate le champ children
        populate: [
          {
            path: "author", // populate le champ author avec children
            model: User,
            select: "_id id name patrentId image", // selectionner seulement le champ '_id' et username de l'auteur
          },
          {
            path: "children", // Populate le champ children avec children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // populate le champ author avec children
              model: User,
              select: "_id id name parentId image", // Selectionner seulement le champ _id et username de l'auteur
            }, 
          },
        ],
      })
      .exec();
      return thread;
  } catch (error: any) {
    throw new Error(`Erueurlors de laffichage de thread: ${error.message}`)
  }
}

/** Ajouter un commentaire
 * @param threadId
   @param commentText
   @param userId 
   @param path
 */
export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
){
  connectToDB();
  try {
    // Trouver le thread original par son ID
    const originalThread = await Thread.findById(threadId);

    if(!originalThread){
      throw new Error(`Thread non trouve`);
    }

    // Creer le nouveau Thread comment
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId // Definir le 'parentId' comme l'ID original du thread 
    });

    // Sauvegarger le comment thread dans la data base
    const savedCommentThread = await commentThread.save();

    // Ajouter l'ID du thread original dans le tableau du children thread
    originalThread.children.push(savedCommentThread._id);

    // Sauvegarder les mises a jours (originalThread)
    await originalThread.save();

    // Show instintaly the changes
    revalidatePath(path);

  } catch (error: any) {
    throw new Error(`Impossible d'ajouter un commentaire: ${error.message}`)
  }
}
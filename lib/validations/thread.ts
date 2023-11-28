import * as z from "zod";

// Valider le typade de chaque thread 
export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 
        "minimum 3 charateres" }),
    accountId: z.string()
})

// Valider le typade de chaque commentaire 
export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 
        "minimum 3 charateres" })
})
import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { desc, eq } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
    try {
        const { id: matchId } = matchIdParamSchema.parse(req.params);
        const { limit } = listCommentaryQuerySchema.parse(req.query);

        const finalLimit = Math.min(limit || MAX_LIMIT, MAX_LIMIT);

        const results = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(finalLimit);

        res.status(200).json(results);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors
            });
        }
        console.error('Error fetching commentary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

commentaryRouter.post('/', async (req, res) => {
    try {
        const { id: matchId } = matchIdParamSchema.parse(req.params);
        const validatedBody = createCommentarySchema.parse(req.body);

        const [result] = await db.insert(commentary).values({
            ...validatedBody,
            matchId
        }).returning();

        if (res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(result.matchId, result);
        }
        res.status(201).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors
            });
        }
        console.error('Error creating commentary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
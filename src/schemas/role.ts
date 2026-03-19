import { z } from "zod";

export const roleSchema = z
	.object({
		company: z.string().min(1),
		title: z.string().min(1),
		start: z.string().regex(/^\d{4}-\d{2}$/),
		end: z.string().regex(/^\d{4}-\d{2}$/).optional(),
		present: z.boolean().optional(),
		location: z.string().min(1),
		summary: z.string().min(1),
		order: z.number().int(),
		stack: z.array(z.string()).optional(),
		metrics: z.array(z.string()).optional(),
	})
	.refine((d) => d.present === true || Boolean(d.end?.length), {
		message: "Either present: true or end date required",
	});

export type RoleFrontmatter = z.infer<typeof roleSchema>;

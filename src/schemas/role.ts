import { z } from "zod";

const projectSchema = z.object({
	name: z.string().min(1),
	dates: z.string().min(1),
	summary: z.string().min(1),
	impact: z.array(z.string().min(1)).min(1),
	skills: z.array(z.string().min(1)).optional(),
	link: z.url().optional(),
});

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
		projects: z.array(projectSchema).optional(),
	})
	.refine((d) => d.present === true || Boolean(d.end?.length), {
		message: "Either present: true or end date required",
	});

export type RoleFrontmatter = z.infer<typeof roleSchema>;

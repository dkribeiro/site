import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { roleSchema } from "./schemas/role";

const roles = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/roles" }),
	schema: roleSchema,
});

export const collections = { roles };

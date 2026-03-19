import { describe, it, expect } from "vitest";
import { roleSchema } from "./role";

const validBase = {
	company: "Acme",
	title: "Engineer",
	start: "2025-10",
	present: true as const,
	location: "Remote",
	summary: "Building things.",
	order: 1,
};

describe("roleSchema", () => {
	it("rejects invalid start date format", () => {
		expect(
			roleSchema.safeParse({ ...validBase, start: "Oct 2025" }).success,
		).toBe(false);
	});

	it("rejects missing company", () => {
		expect(
			roleSchema.safeParse({
				...validBase,
				company: "",
			}).success,
		).toBe(false);
	});

	it("rejects when neither present nor end", () => {
		expect(
			roleSchema.safeParse({
				company: "X",
				title: "Y",
				start: "2020-01",
				location: "Z",
				summary: "s",
				order: 1,
			}).success,
		).toBe(false);
	});

	it("accepts valid present role", () => {
		expect(roleSchema.safeParse(validBase).success).toBe(true);
	});

	it("accepts valid past role with end", () => {
		expect(
			roleSchema.safeParse({
				company: "OldCo",
				title: "Dev",
				start: "2010-01",
				end: "2015-12",
				location: "BR",
				summary: "Did work.",
				order: 99,
			}).success,
		).toBe(true);
	});

	it("accepts valid projects array", () => {
		expect(
			roleSchema.safeParse({
				...validBase,
				projects: [
					{
						name: "Lending Platform",
						dates: "2025-04 to Present",
						summary:
							"Built a modular lending platform for multiple credit products.",
						impact: ["Improved extensibility for new instruments"],
						skills: ["Node.js", "PostgreSQL"],
						link: "https://www.kanastra.com.br/en/banking",
					},
				],
			}).success,
		).toBe(true);
	});

	it("rejects project with invalid link", () => {
		expect(
			roleSchema.safeParse({
				...validBase,
				projects: [
					{
						name: "Broken",
						dates: "2024-01 to 2024-02",
						summary: "x",
						impact: ["y"],
						link: "not-a-url",
					},
				],
			}).success,
		).toBe(false);
	});
});

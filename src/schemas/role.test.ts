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
});

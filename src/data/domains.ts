export interface Domain {
	label: string;
	descriptor: string;
	chips: string[];
}

export const domains: Domain[] = [
	{
		label: "Cards & Issuing",
		descriptor:
			"Built consumer and corporate credit cards end to end: issuer integration, card networks, and interchange.",
		chips: ["PicPay"],
	},
	{
		label: "Receivables & Payroll",
		descriptor:
			"Receivables-backed credit and salary advance, wired into receivables registries and payroll.",
		chips: ["PicPay"],
	},
	{
		label: "Lending & Capital Markets",
		descriptor:
			"A lending platform that originates and issues CCBs, commercial notes, and debentures, with FIDC and securitization flows.",
		chips: ["Kanastra"],
	},
	{
		label: "Cross-border & Stablecoins",
		descriptor:
			"Cross-border money movement orchestrated across multiple banking partners, FX, and stablecoin settlement.",
		chips: ["Conduit"],
	},
	{
		label: "Core Banking & Ledger",
		descriptor:
			"Double-entry ledgers and core-banking primitives that keep money movement correct and auditable.",
		chips: ["Kanastra", "Conduit"],
	},
	{
		label: "Payments & Integrations",
		descriptor:
			"Payment-method and banking integrations across acquirers, processors, and partner banks.",
		chips: ["PicPay", "Conduit"],
	},
];

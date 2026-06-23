export interface Domain {
	label: string;
	descriptor: string;
	chips: string[];
}

export const domains: Domain[] = [
	{
		label: "Cards & Issuing",
		descriptor: "Credit cards, issuers, card networks, interchange",
		chips: ["PicPay", "Conduit"],
	},
	{
		label: "Receivables & Payroll",
		descriptor: "Receivables financing, registries, payroll, salary advance",
		chips: ["PicPay"],
	},
	{
		label: "Lending & Capital Markets",
		descriptor: "CCB, commercial notes, debentures, CRI/CRA, FIDCs",
		chips: ["Kanastra"],
	},
	{
		label: "Cross-border & Stablecoins",
		descriptor: "Multi-bank orchestration, FX, stablecoin rails",
		chips: ["Conduit"],
	},
	{
		label: "Core Banking & Ledger",
		descriptor: "Double-entry ledger, BaaS, money movement",
		chips: ["Kanastra", "Conduit"],
	},
	{
		label: "Payments & Integrations",
		descriptor: "Payment methods, acquiring, banking integrations",
		chips: ["PicPay", "Conduit"],
	},
];

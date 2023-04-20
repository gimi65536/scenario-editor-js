import { Map } from "immutable";

export const slateMacros = new Map({
	separate_line: {
		macroName: "separate",
		displayName: "分隔線",
		childrenNumber: 0,
		canSub: []
	},
	separate_text: {
		macroName: "separate",
		displayName: "有字分隔線",
		childrenNumber: 1,
		canSub: [true]
	},
	ruby: {
		macroName: "ruby",
		displayName: "假名",
		childrenNumber: 2,
		canSub: [false, false]
	}
});
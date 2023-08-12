import { Map } from "immutable";
import { Box, Divider } from "@mui/material";

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
	},
	center: {
		macroName: "center",
		displayName: "置中",
		childrenNumber: 1,
		canSub: [true]
	}
});

// Key is the identifier in the scenario, i.e., macro name
export const renderMacro = new Map({
	separate: (children, renderComponents) => {
		if(children.length === 0){
			return <Divider />;
		}else{
			return <Divider>{renderComponents(children[0])}</Divider>;
		}
	},
	ruby: (children, renderComponents) => {/* The children of ruby cannot contains subchildren */
		return <span><ruby>{children[0]}<rp> (</rp><rt>{children[1]}</rt><rp> )</rp></ruby></span>;
	},
	center: (children, renderComponents) => {
		return <Box display="flex" alignItems="center" justifyContent="center">{renderComponents(children[0])}</Box>;
	},
});
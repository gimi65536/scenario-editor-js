import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import { useHotkeysContext } from 'react-hotkeys-hook';
import { List as ImmutableList, OrderedMap } from "immutable";
import { Delete } from "@mui/icons-material";

/**
 * @typedef {import('@/lib/scenario').Scenario} Scenario
 * @typedef {import("react").ReactNode} ReactNode
 */

/**
 * @type {OrderedMap<String, {name: String, helperText: ReactNode, deprecated?: Boolean}>}
 */
const commonKeys = OrderedMap([
	['index', { name: "編號", helperText: "台本的編號" }],
	['subtitle', { name: "副標題", helperText: "用於標示此話的真正標題（而非「第幾話」）" }],
	['date', { name: "日期", helperText: "配音日期" }],
	['image', { name: "標題圖像", helperText: "用於在LaTeX讀取標題圖像檔（棄置）", deprecated: true }],
	['imagelist', { name: "尾圖列表", helperText: "用於在LaTeX讀取台本結尾圖像檔（棄置）", deprecated: true }],
]);

/**
 * The scenario should be in AM1 normalization.
 * @param {Object} param
 * @param {Scenario} param.scenario
 */
export default function InfoEditor({scenario, dispatch, sx}){
	const [open, setOpen] = useState(false);

	return (<Stack sx={sx}>
		<Box>
			<Typography variant="h4">標題：{scenario.title || "(無標題)"}</Typography>
		</Box>
		<Stack sx={{ mt: 1 }}>
			<Box>其它參數</Box>
			{Object.entries(scenario.info).map(([key, value]) => (
				<Box key={key} sx={{ my: 1 }}>{key}: {value}</Box>
			))}
		</Stack>
		<Button variant="contained" sx={{alignSelf: "center"}} onClick={() => setOpen(true)}>
			修改
		</Button>
		<InfoDialog
			scenario={scenario}
			dispatch={dispatch}
			openSignal={open}
			onClose={() => setOpen(false)}
		/>
	</Stack>);
}

function InfoDialog({scenario, dispatch, openSignal, onClose}){
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [info, setInfo] = useState(/** @type {ImmutableList<[String, String]>} */(ImmutableList()));
	const [chooseKey, setChooseKey] = useState(null);

	const { enableScope, disableScope } = useHotkeysContext();

	if(!open && openSignal){
		// Initialize
		setOpen(true);
		setTitle(scenario.title);
		setInfo(ImmutableList(Object.entries(scenario.info)));
		setChooseKey(null);
	}else if(open && !openSignal){
		setOpen(false);
	}

	useEffect(() => {
		if (open) {
			disableScope("scenario-record");
		} else {
			enableScope("scenario-record");
		}
	}, [disableScope, enableScope, open])

	const handleClose = useCallback(() => {
		const obj = {};
		for(const [key, value] of info){
			obj[key] = value;
		}
		dispatch([{
			type: 'edit_title',
			title: title
		},{
			type: 'edit_info',
			info: obj
		}]);
		onClose();
	}, [dispatch, info, onClose, title]);

	return (<Dialog open={open} onClose={handleClose}>
		<DialogTitle>更改台本資訊</DialogTitle>
		<DialogContent>
			<DialogContentText>台本標題必備，其它可選</DialogContentText>
			<DialogContentText>通常會有 index date 兩個項目，參考下方「加入」右方的「選擇常用Key」</DialogContentText>
			<Stack>
				<TextField
					label="台本標題"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					sx={{ m: 2 }}
				/>
				{info.map(([key, value], index) => (
					<Stack key={index} sx={{flexDirection: "row"}}>
						<TextField
							label="項目"
							helperText={commonKeys.has(key) ? commonKeys.get(key).helperText : ""}
							value={key}
							onChange={(e) => setInfo(info.set(index, [e.target.value, value]))}
							sx={{ m: 2, width: "10em" }}
						/>
						<TextField
							label="內容"
							value={value}
							onChange={(e) => setInfo(info.set(index, [key, e.target.value]))}
							sx={{ m: 2, width: "20em" }}
						/>
						<IconButton sx={{alignSelf: "center"}} onClick={() => setInfo(info.delete(index))}>
							<Delete />
						</IconButton>
					</Stack>
				)).toArray()}
				<Stack sx={{ alignSelf: "center", flexDirection: "row", alignItems: "center" }}>
					<Button variant="outlined" onClick={() => setInfo(info.push(["", ""]))} sx={{ mx: 3 }}>
						新增
					</Button>
					<Stack sx={{ mx: 3, flexDirection: "row", alignItems: "center" }}>
						<Button variant="outlined" sx={{mx: 1}} onClick={() => {
							if(chooseKey !== null){
								setInfo(info.push([chooseKey, ""]));
								setChooseKey(null);
							}
						}}>
							加入
						</Button>
						<FormControl sx={{width: "10em"}}>
							<InputLabel id="insert-common-key">選擇常用項目</InputLabel>
							<Select
								labelId="insert-common-key"
								label="選擇常用項目"
								value={chooseKey}
								onChange={(e) => setChooseKey(e.target.value)}
								size="small"
							>
								{commonKeys.filter((attr) => !attr.deprecated).entrySeq().map(([key, attr]) => (
									<MenuItem key={key} value={key}>{key}</MenuItem>
								))}
							</Select>
							<FormHelperText>{commonKeys.get(chooseKey)?.helperText}</FormHelperText>
						</FormControl>
					</Stack>
				</Stack>
			</Stack>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose} color="warning">取消</Button>
			<Button onClick={handleClose}>確定</Button>
		</DialogActions>
	</Dialog>);
}
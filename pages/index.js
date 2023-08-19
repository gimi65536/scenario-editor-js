import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Tab,
	Box,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Stack
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useCallback, useEffect, useState } from 'react';
import DialogueEditor from "@/components/dialogue-editor";
import CharacterEditor from '@/components/character-editor';
import InfoEditor from '@/components/info-editor';
import json from '@/test/NTUCCC 109SS VAD07-gimi65536 0.1.0.json';
import { processObject2Scenario, hydrateImmutable, dehydrateImmutable, normalizeImmutable, validate } from '@/lib/scenario';
import useUndoReducer from '@/lib/undo';
import reducer from "@/lib/reducer";
import { enableMapSet } from "immer";
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import Head from 'next/head';
import { ExpandMore } from '@mui/icons-material';
import VideoPreview from '@/components/video-preview';
import { getTexEnv, getGeneralEnv } from '@/lib/extract';
import "videojs-hotkeys";
import styles from '@/styles/Home.module.css'
enableMapSet();

const TEST = process.env.NODE_ENV === 'development';

export default function TestScenario() {
	const [scenario, isModified, undo, redo, update, setScenario, irreversibleSetScenario, setUnmodified, reset] = useUndoReducer(reducer, null);
	const [willLoadFile, setWillLoadFile] = useState('');
	const [tabPage, setTabPage] = useState('1');
	useHotkeys('ctrl+z', (e) => undo(), { scopes: "scenario-record" }, [undo]);
	useHotkeys('ctrl+y', (e) => redo(), { scopes: "scenario-record" }, [redo]);

	const loadFile = useCallback((file) => {
		console.log(file);
		const reader = new FileReader();
		reader.onload = async (e) => {
			const json = JSON.parse(e.target.result);
			const result = await processObject2Scenario(json);
			reset(hydrateImmutable(normalizeImmutable(validate(result), 1)));
		};
		reader.readAsText(file);
	}, [reset]);

	const handleFileChange = useCallback((e) => {
		const file = e.target.files[0];
		e.target.value = '';
		if (file === undefined) {
			return;
		}
		if (!isModified) {
			loadFile(file);
		} else {
			// Alert
			setWillLoadFile(file);
		}
	}, [loadFile, isModified, setWillLoadFile]);

	return (
		<Box>
			<Head>
				<title>{(scenario !== null ? ((isModified ? "*" : "") + (scenario.title || "(無標題)") + " - ") : "") + "台本編輯器"}</title>
			</Head>
			<Accordion sx={{ my: 2 }}>
				<AccordionSummary
					expandIcon={<ExpandMore />}
				>
					動畫影像
				</AccordionSummary>
				<AccordionDetails>
					<VideoPreview
						enableOCR
						moreOptions={{
							plugins: {
								hotkeys: {
									enableVolumeScroll: false,
									enableHoverScroll: true,
								},
							},
						}}
					/>
				</AccordionDetails>
			</Accordion>
			<TabContext value={tabPage}>
				<Box>
					<TabList onChange={(e, v) => setTabPage(v)}>
						<Tab label="基本資訊" value="1" />
						<Tab label="角色" value="2" />
						<Tab label="台詞" value="3" />
					</TabList>
				</Box>
				<TabPanel value="1">
					{scenario ?
						<InfoEditor
							scenario={scenario}
							dispatch={update}
							sx={{ height: "80vh" }}
						/>
						: ""
					}</TabPanel>
				<TabPanel value="2">
					{scenario ?
						<CharacterEditor
							scenario={scenario}
							dispatch={update}
							sx={{ height: "80vh" }}
						/>
						: ""
					}
				</TabPanel>
				<TabPanel value="3">
					{scenario ?
						<DialogueEditor
							scenario={scenario}
							dispatch={update}
							sx={{ height: "80vh" }}
						/>
						: ""
					}
				</TabPanel>
			</TabContext>
			<Stack direction="row" justifyContent="center" sx={{ my: 2 }}>
				<Button variant="contained" component="label" sx={{ mx: 2 }}>
					上傳台本
					<input
						hidden
						accept="application/json"
						type="file"
						onChange={handleFileChange}
					/>
				</Button>
				{scenario ?
					<Button
						variant="contained"
						component="a"
						href={`data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(scenario))}`}
						download={`${scenario.title}.json`}
						onClick={() => setUnmodified()}
						sx={{ mx: 2 }}
					>
						下載台本
					</Button>
					: ""
				}
				{scenario ?
					<Button
						variant="contained"
						sx={{ mx: 2 }}
						onClick={() => {
							const anchor = document.createElement('a');
							anchor.href = `data:text/json;chatset=utf-8,${encodeURIComponent(getTexEnv().render('template.tex.njk', { scenario }))}`;
							anchor.download = `${scenario.title}.tex`;
							anchor.click();
						}}
					>
						匯出成TeX
					</Button>
					: ""
				}
				{scenario ?
					<Button
						variant="contained"
						sx={{ mx: 2 }}
						onClick={() => {
							const anchor = document.createElement('a');
							anchor.href = `data:text/json;chatset=utf-8,${encodeURIComponent(getGeneralEnv().render('template.txt.njk', { scenario }))}`;
							anchor.download = `${scenario.title}.txt`;
							anchor.click();
						}}
					>
						匯出成純文字
					</Button>
					: ""
				}
				{scenario ?
					<Button
						variant="contained"
						sx={{ mx: 2 }}
						onClick={() => {
							const anchor = document.createElement('a');
							anchor.href = `data:text/json;chatset=utf-8,${encodeURIComponent(getGeneralEnv().render('template.html.njk', { scenario }))}`;
							anchor.download = `${scenario.title}.html`;
							anchor.click();
						}}
					>
						匯出成網頁
					</Button>
					: ""
				}
				{TEST ? <Button variant="outlined" component="label" sx={{ mx: 2 }} onClick={() => {
					reset(hydrateImmutable(normalizeImmutable(validate(json), 1)));
				}}>
					讀取測試台本
				</Button> : ""}
			</Stack>
			{TEST ? <textarea style={{ width: "100%", height: "50vh" }} defaultValue={scenario && JSON.stringify(dehydrateImmutable(scenario))} /> : ""}
			<LoadDialog
				file={willLoadFile}
				onConfirm={() => {
					loadFile(willLoadFile);
					setWillLoadFile('');
				}}
				onClose={() => {
					setWillLoadFile('');
				}}
			/>
		</Box>
	);
}

function LoadDialog({ file, onConfirm, onClose }) {
	const [open, setOpen] = useState(false);

	const { enableScope, disableScope } = useHotkeysContext();

	if(!open && file !== ''){
		setOpen(true);
	}else if(open && file === ''){
		setOpen(false);
	}

	useEffect(() => {
		if (open) {
			disableScope("scenario-record");
		} else {
			enableScope("scenario-record");
		}
	}, [disableScope, enableScope, open])

	return (<Dialog open={open} onClose={onClose}>
		<DialogTitle>確認是否讀取台本</DialogTitle>
		<DialogContent>
			<DialogContentText>還有變更尚未儲存！是否直接讀取？</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose}>取消</Button>
			<Button onClick={onConfirm} color="warning">確定</Button>
		</DialogActions>
	</Dialog>);
}
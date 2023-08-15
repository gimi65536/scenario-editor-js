import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Stack,
	TextField,
	Tooltip,
	Typography
} from "@mui/material";
import { Circle, Edit, Delete } from "@mui/icons-material";
import { useCallback, useState } from "react";
import {
	DragDropContext,
	Draggable
} from "react-beautiful-dnd";
import Droppable from '@/components/dnd/StrictModeDroppable';
import { MuiColorInput } from "mui-color-input";

/**
 * @typedef {import('@/lib/scenario').Scenario} Scenario
 */

/**
 * The scenario should be in AM1 normalization.
 * @param {Object} param
 * @param {Scenario} param.scenario
 */
export default function CharacterEditor({scenario, dispatch, sx}){
	const [editingCharacter, setEditingCharacter] = useState(null);

	const onDragEnd = useCallback(({destination, source}) => {
		if(!destination){
			return;
		}
		dispatch({
			type: "move_character",
			from: source.index,
			to: destination.index
		})
	}, [dispatch]);

	const onInfoDialogClose = useCallback(() => {
		setEditingCharacter(null);
	}, []);

	return (
		<>
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="character-list-droppable">
				{(provided, snapshot) => (
				<List
					ref={provided.innerRef}
					sx={{
						height: "70%",
						overflow: "auto",
						m: 5,
						...sx
					}}
					{...provided.droppableProps}
				>
					{scenario.characters.order.map((uuid, index) => (
					<Draggable key={uuid} draggableId={uuid} index={index}>
						{(provided, snapshot) => (
						<>
						{index === 0 ? <Divider component="li" /> : ""}
						<ListItem
							ref={provided.innerRef}
							sx={snapshot.isDragging && { background: "rgb(235, 235, 235)" }}
							secondaryAction={
								<>
									<Tooltip title={scenario.characters.reference[uuid].name ? `編輯 ${scenario.characters.reference[uuid].name} 的資訊` : "編輯"}>
										<IconButton onClick={() => setEditingCharacter(uuid)}>
											<Edit />
										</IconButton>
									</Tooltip>
									<Tooltip title="刪除">
										<IconButton onClick={() => dispatch({
											type: 'delete_character',
											index: index
										})}>
											<Delete />
										</IconButton>
									</Tooltip>
								</>
							}
							{...provided.draggableProps}
							{...provided.dragHandleProps}
						>
							<ListItemText
								primary={scenario.characters.reference[uuid].name || "(無名氏)"}
								secondary={<div>
									{scenario.characters.reference[uuid].abbreviated ? <div>{scenario.characters.reference[uuid].abbreviated}</div> : ""}
									{scenario.characters.reference[uuid].color ?
										<Typography sx={{ color: scenario.characters.reference[uuid].color }} variant="inherit"><Circle /></Typography> : ""}
									{scenario.characters.reference[uuid].gender ? <div>性別：{scenario.characters.reference[uuid].gender}</div> : ""}
									{scenario.characters.reference[uuid].cast ? <div>聲優：{scenario.characters.reference[uuid].cast}</div> : ""}
									<div>
										共有
										<Typography sx={{ fontWeight: "bold" }} variant="inherit" display="inline">
											{scenario.__hydration.characterToDialogue.get(uuid).size}
										</Typography>
										句台詞
									</div>
								</div>}
							/>
						</ListItem>
						<Divider component="li" />
						</>
						)}
					</Draggable>
					))}
					{provided.placeholder}
				</List>
				)}
			</Droppable>
		</DragDropContext>
		<Stack alignItems="center">
			<Button variant="contained" onClick={() => dispatch({ type: 'add_character'})}>點擊新增角色</Button>
		</Stack>
		<CharacterInfoDialog
			scenario={scenario}
			dispatch={dispatch}
			uuid={editingCharacter}
			onClose={onInfoDialogClose}
		/>
		</>
	);
}


/**
 * @param {Object} param
 * @param {Scenario} param.scenario
 * @param {String} param.uuid
 */
function CharacterInfoDialog({scenario, dispatch, uuid, onClose}){
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [originName, setOriginName] = useState("");
	const [abbreviated, setAbbreviated] = useState("");
	const [color, setColor] = useState("");
	const [gender, setGender] = useState("");
	const [cast, setCast] = useState("");

	if(!open && uuid){
		// Initialize
		setOpen(true);
		setName(scenario.characters.reference[uuid].name);
		setOriginName(scenario.characters.reference[uuid].name || "(無名氏)");
		setAbbreviated(scenario.characters.reference[uuid].abbreviated ?? "");
		setColor(scenario.characters.reference[uuid].color ?? "#000000");
		setGender(scenario.characters.reference[uuid].gender ?? "");
		setCast(scenario.characters.reference[uuid].cast ?? "");
	}else if(open && !uuid){
		setOpen(false);
	}

	const handleClose = useCallback(() => {
		dispatch({
			type: "edit_character_info",
			uuid: uuid,
			info: {name, abbreviated, color, gender, cast}
		});
		onClose();
	}, [abbreviated, cast, color, dispatch, gender, name, onClose, uuid]);

	return (<Dialog open={open} onClose={handleClose}>
		<DialogTitle>更改角色資訊</DialogTitle>
		<DialogContent>
			<DialogContentText>更改{originName}的角色資訊</DialogContentText>
			<Stack>
				<TextField
					label="角色名稱"
					value={name}
					onChange={(e) => setName(e.target.value)}
					sx={{ m: 2 }}
				/>
				<TextField
					label="略稱"
					helperText="顯示在台詞引號前面的那個"
					value={abbreviated}
					onChange={(e) => setAbbreviated(e.target.value)}
					sx={{ m: 2 }}
				/>
				<MuiColorInput
					label="代表色"
					value={color}
					onChange={setColor}
					isAlphaHidden
					sx={{ m: 2 }}
				/>
				<TextField
					label="性別"
					value={gender}
					onChange={(e) => setGender(e.target.value)}
					sx={{ m: 2 }}
				/>
				<TextField
					label="聲優"
					value={cast}
					onChange={(e) => setCast(e.target.value)}
					sx={{ m: 2 }}
				/>
			</Stack>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose} color="warning">取消</Button>
			<Button onClick={handleClose}>確定</Button>
		</DialogActions>
	</Dialog>);
}
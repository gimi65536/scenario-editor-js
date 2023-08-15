import { Button, Divider, IconButton, List, ListItem, ListItemText, Stack, Tooltip, Typography } from "@mui/material";
import { Circle, Edit, Delete } from "@mui/icons-material";
import { useCallback } from "react";
import {
	DragDropContext,
	Draggable
} from "react-beautiful-dnd";
import Droppable from '@/components/dnd/StrictModeDroppable';

/**
 * @typedef {import('@/lib/scenario').Scenario} Scenario
 */

/**
 * The scenario should be in AM1 normalization.
 * @param {Object} param
 * @param {Scenario} param.scenario
 */
export default function CharacterEditor({scenario, dispatch}){
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
						m: 5
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
										<IconButton>
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
		</>
	)
}

function CharacterInfoDialog({scenario, dispatch, uuid}){}
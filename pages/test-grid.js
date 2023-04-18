import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";

const columns = [
	{
		field: "id",
		headerName: "ID",
		width: 100,
	},
	{
		field: "name",
		headerName: "Name",
		width: 200,
		editable: true,
	},
	{
		field: "gender",
		headerName: "Gender",
		width: 200,
		editable: true,
	},
];

const rows = [
	{ id: 1, name: "John Doe", gender: "Helicopter" },
	{ id: 2, name: "Jane Smith", gender: "Male" },
	{ id: 3, name: "Bob Johnson", gender: "Female" },
];

const EditDialog = ({open, onClose, onSave, onChange, value}) => {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Edit Name</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Name"
					type="text"
					fullWidth
					value={value}
					onChange={onChange}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={onSave}>Save</Button>
			</DialogActions>
		</Dialog>
	);
};

const MyDataGrid = () => {
	const [selectedRow, setSelectedRow] = useState(null);
	const [selectedRowValue, setSelectedRowValue] = useState("");
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const handleEditStart = (params, e) => {
		// Only call dialog when editing the name field
		if(params.field == 'name'){
			// To override the default behavior and let the dialog control the edit
			e.defaultMuiPrevented = true;
			setSelectedRow(params.row);
			setSelectedRowValue(params.value);
			setEditDialogOpen(true);
		}
	};

	const handleEditDialogClose = () => {
		setEditDialogOpen(false);
		setSelectedRow(null);
	};

	const handleSave = () => {
		selectedRow.name = selectedRowValue;
		setSelectedRow(selectedRow);
		handleEditDialogClose();
	};

	const handleChange = (event) => {
		setSelectedRowValue(event.target.value);
	};

	return (
		<div style={{ height: 400, width: "100%" }}>
			<DataGrid
				rows={rows}
				columns={columns}
				onCellEditStart={handleEditStart}
			/>
			<EditDialog
				open={editDialogOpen}
				onClose={handleEditDialogClose}
				onSave={handleSave}
				onChange={handleChange}
				value={selectedRowValue}
			/>
		</div>
	);
};

export default MyDataGrid;

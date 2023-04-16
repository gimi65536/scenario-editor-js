import useUndoReducer from '@/lib/undo';
import { Button } from '@mui/material';

function reducer(draft, action){
	if(action.type === 'add'){
		draft.value += action.value;
	}else if(action.type === 'minus'){
		draft.value -= action.value;
	}
}

export default function TestUndo(){
	const [counter, isModified, undo, redo, update, set, irreversibleSet, setUnmodified, reset] = useUndoReducer(reducer, {value: 0}, 10, 5);
	return (
		<>
			<div>
				<Button onClick={() => update({ type: 'add', value: 1 })}>+1</Button>
				<Button onClick={() => update({ type: 'add', value: 10 })}>+10</Button>
				<Button onClick={() => update({ type: 'add', value: 100 })}>+100</Button>
			</div>
			<div>
				<Button onClick={() => update({ type: 'minus', value: 1 })}>-1</Button>
				<Button onClick={() => update({ type: 'minus', value: 10 })}>-10</Button>
				<Button onClick={() => update({ type: 'minus', value: 100 })}>-100</Button>
			</div>
			<div>
				<Button onClick={() => undo()}>Undo</Button>
				<Button onClick={() => redo()}>Redo</Button>
				<Button onClick={() => setUnmodified()}>Save</Button>
			</div>
			<div>
				<Button onClick={() => set({ value: 3.14 })}>Set to 3.14</Button>
				<Button onClick={() => irreversibleSet({ value: 1.414 })}>Irreversibly set to 1.414</Button>
				<Button onClick={() => reset()}>Reset stack</Button>
				<Button onClick={() => reset({ value: 0 })}>Reset to 0</Button>
			</div>
			<p>Counter: {counter.value}</p>{isModified ? <p>Modified</p> : ""}
		</>
	);
}
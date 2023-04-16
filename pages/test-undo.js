import useUndoRedo from '@/lib/undo';
import { Button } from '@mui/material';

function reducer(draft, action){
	if(action.type === 'add'){
		draft.value += action.value;
	}else if(action.type === 'minus'){
		draft.value -= action.value;
	}
}

export default function TestUndo(){
	const [counter, isModified, undo, redo, update, unrestorableUpdate, setUnmodified, reset] = useUndoRedo({value: 0}, reducer, 10, 5);
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
			<p>Counter: {counter.value}</p>{isModified ? <p>Modified</p> : ""}
		</>
	);
}
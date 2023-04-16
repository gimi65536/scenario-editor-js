import { useCallback, useState } from 'react';
import { applyPatches, enablePatches, produceWithPatches } from 'immer';
enablePatches();

const initialStack = [
	[[], []] // Bottom of the stack
];
const defaultStackCapacity = 1000; // Include bottom
const defaultShrinkTo = 500; // <= stackCapacity

export default function useUndoReducer(initialState, immerReducer, stackCapacity = defaultStackCapacity, shrinkTo = defaultShrinkTo) {
	const [state, setState] = useState(initialState);
	const [patchesStack, setPatchesStack] = useState(initialStack);
	const [stackPointer, setStackPointer] = useState(0);

	// If save the process, then it will be set to 0
	const [ahead, setAhead] = useState(0);
	const isModified = (ahead !== 0);

	if(shrinkTo > stackCapacity){
		shrinkTo = stackCapacity;
	}

	const undo = useCallback(() => {
		if (stackPointer === 0) {
			return;
		}
		const [, undoPatches] = patchesStack[stackPointer];
		const newState = applyPatches(state, undoPatches);
		setState(newState);
		setStackPointer(stackPointer - 1);
		setAhead(ahead - 1);
	}, [state, patchesStack, stackPointer, ahead]);

	const redo = useCallback(() => {
		if (stackPointer === patchesStack.length - 1) {
			return;
		}
		const [redoPatches, ] = patchesStack[stackPointer + 1];
		const newState = applyPatches(state, redoPatches);
		setState(newState);
		setStackPointer(stackPointer + 1);
		setAhead(ahead + 1);
	}, [state, patchesStack, stackPointer, ahead]);

	const _setter = useCallback((action, toState) => {
		const [newState, redoPatches, undoPatches] = (
			action !== undefined ?
			produceWithPatches(state, (draft) => immerReducer(draft, action)) :
			produceWithPatches(state, (draft) => toState)
		);
		const newPatches = [redoPatches, undoPatches];
		setState(newState);

		let newStack;
		// Stack shrink
		if (stackPointer >= stackCapacity - 1) {
			// If we push the action, the stack size exceeds the capacity.
			// We will shrink the size to shinkTo (include the bottom and the new action).

			// [0, 1, ..., stackPointer, ...], we need to get (shrinkTo - 2) elements
			// so the range is [(stackPointer - shinkTo + 3), (stackPointer + 1))
			newStack = [...initialStack, ...patchesStack.slice(stackPointer - shrinkTo + 3, stackPointer + 1), newPatches];

			// To think whether it is right, we set both capacity and shinkTo to 100, so the pointer should be 99.
			// We pick the [2, 100)th elements, i.e., [2, 99], which means we just drop the 1st element to
			// enlarge the space to put our latest action.
			// And we check the length of the new stack: 1 + (stackPointer+1-stackPointer+shrinkTo-3) + 1 = shrinkTo, right!

			setPatchesStack(newStack);
			setStackPointer(shrinkTo - 1);
		} else {
			newStack = [...patchesStack.slice(0, stackPointer + 1), newPatches];
			setPatchesStack(newStack);
			setStackPointer(stackPointer + 1);
		}
		if (ahead < 0) {
			// Override the saved data ahead
			// We don't need the precise number
			setAhead(newStack.length + 100);
		} else {
			setAhead(ahead + 1);
		}
	}, [immerReducer, stackCapacity, shrinkTo, state, patchesStack, stackPointer, ahead]);

	const update = useCallback((action) => _setter(action), [_setter]);

	const set = useCallback((newState) => _setter(undefined, newState), [_setter]);

	const irreversibleSet = useCallback((newState) => {
		setState(newState);
		setPatchesStack(initialStack);
		setStackPointer(0);
		setAhead(ahead + 1);
	}, [ahead]);

	const setUnmodified = useCallback(() => {
		setAhead(0);
	}, []);

	const reset = useCallback((newState) => {
		// If state is given, reset to the state
		if (newState !== undefined) {
			setState(newState);
		}
		// Reset the history stack
		setPatchesStack(initialStack);
		setStackPointer(0);
		setAhead(0);
	}, []);

	return [state, isModified, undo, redo, update, set, irreversibleSet, setUnmodified, reset];
}

export function useUndo(initialState, stackCapacity = defaultStackCapacity, shrinkTo = defaultShrinkTo){
	const [
		state,
		isModified,
		undo,
		redo,
		update,
		set,
		irreversibleSet,
		setUnmodified,
		reset
	] = useUndoReducer(initialState, (draft, action) => {}, stackCapacity, shrinkTo);

	return [state, isModified, undo, redo, set, irreversibleSet, setUnmodified, reset];
}
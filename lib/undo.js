import { useCallback, useState } from 'react';
import { applyPatches, enablePatches, produceWithPatches } from 'immer';
enablePatches();

const initialStack = [
	[[], []] // Bottom of the stack
];
const stackCapacity = 1000; // Include bottom
const shrinkTo = 500; // <= stackCapacity

export default function useUndoRedo(initialState, immerReducer) {
	const [state, setState] = useState(initialState);
	const [patchesStack, setPatchesStack] = useState(initialStack);
	const [stackPointer, setStackPointer] = useState(0);

	const undo = useCallback(() => {
		console.log(patchesStack);
		if (stackPointer === 0) {
			return;
		}
		const [_, undoPatches] = patchesStack[stackPointer];
		const newState = applyPatches(state, undoPatches);
		setState(newState);
		setStackPointer(stackPointer - 1);
	}, [state, patchesStack, stackPointer]);

	const redo = useCallback(() => {
		if (stackPointer === patchesStack.length - 1) {
			return;
		}
		const [redoPatches, _] = patchesStack[stackPointer + 1];
		const newState = applyPatches(state, redoPatches);
		setState(newState);
		setStackPointer(stackPointer + 1);
	}, [state, patchesStack, stackPointer]);

	const update = useCallback((action) => {
		const [newState, redoPatches, undoPatches] = produceWithPatches(state, (draft) => immerReducer(draft, action));
		const newPatches = [redoPatches, undoPatches];
		setState(newState);

		// Stack shrink
		if (stackPointer >= stackCapacity - 1) {
			// If we push the action, the stack size exceeds the capacity.
			// We will shrink the size to shinkTo (include the bottom and the new action).

			// [0, 1, ..., stackPointer, ...], we need to get (shrinkTo - 2) elements
			// so the range is [(stackPointer - shinkTo + 3), (stackPointer + 1))
			const newStack = [...initialStack, ...patchesStack.slice(stackPointer - shrinkTo + 3, stackPointer + 1), newPatches];

			// To think whether it is right, we set both capacity and shinkTo to 100, so the pointer should be 99.
			// We pick the [2, 100)th elements, i.e., [2, 99], which means we just drop the 1st element to
			// enlarge the space to put our latest action.
			// And we check the length of the new stack: 1 + (stackPointer+1-stackPointer+shrinkTo-3) + 1 = shrinkTo, right!

			setPatchesStack(newStack);
			setStackPointer(shrinkTo - 1);
		} else {
			const newStack = [...patchesStack.slice(0, stackPointer + 1), newPatches];
			setPatchesStack(newStack);
			setStackPointer(stackPointer + 1);
		}
	}, [immerReducer, state, patchesStack, stackPointer]);

	const reset = useCallback((newState) => {
		// If state is given, reset to the state
		if (newState !== undefined) {
			setState(newState);
		}
		// Reset the history stack
		setPatchesStack(initialStack);
		setStackPointer(0);
	}, []);

	return [state, undo, redo, update, reset];
}
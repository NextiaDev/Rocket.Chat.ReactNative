import { appInit, setMasterDetail } from '../actions/app';
import { initialState } from './connect';
import { mockedStore } from './mockedStore';
// import { RootEnum } from '../definitions';
import { APP_STATE } from '../actions/actionsTypes';

describe('test reducer', () => {
	it('should return initial state', () => {
		const { meteor } = mockedStore.getState();
		expect(meteor).toEqual(initialState);
	});

	// it('should return root state after dispatch appStart action', () => {
	// 	mockedStore.dispatch(appStart({ root: RootEnum.ROOT_INSIDE }));
	// 	const { root } = mockedStore.getState().app;
	// 	expect(root).toEqual(RootEnum.ROOT_INSIDE);
	// });

	it('should return ready state after dispatch appInit action', () => {
		mockedStore.dispatch(appInit());
		const { ready } = mockedStore.getState().app;
		expect(ready).toEqual(false);
	});

	it('should return ready state after dispatch setMasterDetail action', () => {
		mockedStore.dispatch(setMasterDetail(false));
		const { isMasterDetail } = mockedStore.getState().app;
		expect(isMasterDetail).toEqual(false);
	});

	it('should return correct state after app go to foreground', () => {
		mockedStore.dispatch({ type: APP_STATE.FOREGROUND });
		const { foreground, background } = mockedStore.getState().app;
		expect(foreground).toEqual(true);
		expect(background).toEqual(false);
	});

	it('should return correct state after app go to background', () => {
		mockedStore.dispatch({ type: APP_STATE.BACKGROUND });
		const { foreground, background } = mockedStore.getState().app;
		expect(foreground).toEqual(false);
		expect(background).toEqual(true);
	});
});

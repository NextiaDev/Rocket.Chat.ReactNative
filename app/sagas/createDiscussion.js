import {
	select, put, call, take, takeLatest
} from 'redux-saga/effects';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';

import { CREATE_DISCUSSION, LOGIN } from '../actions/actionsTypes';
import { createDiscussionSuccess, createDiscussionFailure } from '../actions/createDiscussion';
import RocketChat from '../lib/rocketchat';
import database from '../lib/database';

const create = function* create(data) {
	return yield RocketChat.createDiscussion(data);
};

const handleRequest = function* handleRequest({ data }) {
	try {
		const auth = yield select(state => state.login.isAuthenticated);
		if (!auth) {
			yield take(LOGIN.SUCCESS);
		}
		const result = yield call(create, data);

		if (result.success) {
			const { discussion: sub } = result;

			try {
				const db = database.active;
				const subCollection = db.collections.get('subscriptions');
				yield db.action(async() => {
					await subCollection.create((s) => {
						s._raw = sanitizedRaw({ id: sub.rid }, subCollection.schema);
						Object.assign(s, sub);
					});
				});
			} catch {
				// do nothing
			}

			yield put(createDiscussionSuccess(sub));
		} else {
			yield put(createDiscussionFailure(result));
		}
	} catch (err) {
		yield put(createDiscussionFailure(err));
	}
};

const root = function* root() {
	yield takeLatest(CREATE_DISCUSSION.REQUEST, handleRequest);
};

export default root;

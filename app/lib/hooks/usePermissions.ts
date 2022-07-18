import { useState, useEffect } from 'react';
import { dequal } from 'dequal';
import { Subscription } from 'rxjs';
import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';

import { TSupportedPermissions } from '../../reducers/permissions';
import { IApplicationState, TSubscriptionModel } from '../../definitions';
import { getUserSelector } from '../../selectors/login';
import { useAppSelector } from './useAppSelector';
import { getSubscriptionByRoomId } from '../database/services/Subscription';

const getPermissionsSelector = createSelector(
	[(state: IApplicationState) => state.permissions, (_state: any, permissionsArray: TSupportedPermissions[]) => permissionsArray],
	(permissions, permissionsArray) => permissionsArray.map(p => permissions[p])
);

const useSubscriptionRoles = (rid?: string): TSubscriptionModel['roles'] => {
	const [subscriptionRoles, setSubscriptionRoles] = useState<TSubscriptionModel['roles']>([]);

	useEffect(() => {
		if (!rid) {
			return;
		}
		let subSubscription: Subscription;
		getSubscriptionByRoomId(rid).then(sub => {
			if (!sub) {
				return;
			}
			const observable = sub.observe();
			subSubscription = observable.subscribe(s => {
				if (!dequal(subscriptionRoles, s.roles)) {
					setSubscriptionRoles(s.roles);
				}
			});
		});

		return () => {
			if (subSubscription && subSubscription?.unsubscribe) subSubscription.unsubscribe();
		};
	}, [subscriptionRoles]);

	return subscriptionRoles;
};

export function usePermissions(permissions: TSupportedPermissions[], rid?: string): boolean[] {
	const userRoles = useAppSelector(state => getUserSelector(state).roles || [], shallowEqual);
	const permissionsRedux = useAppSelector(state => getPermissionsSelector(state, permissions), shallowEqual);
	const subscriptionRoles = useSubscriptionRoles(rid);

	const mergedRoles = [...new Set([...(subscriptionRoles || []), ...userRoles])];
	return permissionsRedux.map(permission => (permission ?? []).some(r => mergedRoles.includes(r)));
}

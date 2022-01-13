import { TActionActiveUsers } from '../../actions/activeUsers';
import { TActionEncryption } from '../../actions/encryption';
import { TActionSelectedUsers } from '../../actions/selectedUsers';
// REDUCERS
import { IActiveUsers } from '../../reducers/activeUsers';
import { IEncryption } from '../../reducers/encryption';
import { ISelectedUsers } from '../../reducers/selectedUsers';

export interface IApplicationState {
	settings: any;
	login: any;
	meteor: any;
	server: any;
	selectedUsers: ISelectedUsers;
	createChannel: any;
	app: any;
	room: any;
	rooms: any;
	sortPreferences: any;
	share: any;
	customEmojis: any;
	activeUsers: IActiveUsers;
	usersTyping: any;
	inviteLinks: any;
	createDiscussion: any;
	inquiry: any;
	enterpriseModules: any;
	encryption: IEncryption;
	permissions: any;
	roles: any;
}

export type TApplicationActions = TActionActiveUsers & TActionSelectedUsers & TActionEncryption;

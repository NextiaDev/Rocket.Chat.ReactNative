import axios from 'axios';

import data, { TDataChannels, TDataGroups, TDataTeams, TDataUsers, TUserRegularChannels } from '../data';
import random from './random';

const TEAM_TYPE = {
	PUBLIC: 0,
	PRIVATE: 1
};

const { server } = data;

const rocketchat = axios.create({
	baseURL: `${server}/api/v1/`,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
});

const login = async (username: string, password: string) => {
	console.log(`Logging in as user ${username}`);
	const response = await rocketchat.post('login', {
		user: username,
		password
	});
	const { authToken, userId } = response.data.data;
	rocketchat.defaults.headers.common['X-User-Id'] = userId;
	rocketchat.defaults.headers.common['X-Auth-Token'] = authToken;
	return { authToken, userId };
};

export interface ICreateUser {
	username: string;
	password: string;
	name: string;
	email: string;
}

export const createRandomUser = async (): Promise<ICreateUser> => {
	try {
		await login(data.adminUser, data.adminPassword);
		const user = data.randomUser();
		console.log(`Creating user ${user.username}`);
		await rocketchat.post('users.create', {
			username: user.username,
			name: user.name,
			password: user.password,
			email: user.email
		});
		return user;
	} catch (error) {
		console.log(JSON.stringify(error));
		throw new Error('Failed to create user');
	}
};

const createUser = async (username: string, password: string, name: string, email: string) => {
	console.log(`Creating user ${username}`);
	try {
		await rocketchat.post('users.create', {
			username,
			password,
			name,
			email
		});
	} catch (error) {
		console.log(JSON.stringify(error));
		throw new Error('Failed to create user');
	}
};

const createChannelIfNotExists = async (channelname: string) => {
	console.log(`Creating public channel ${channelname}`);
	try {
		const room = await rocketchat.post('channels.create', {
			name: channelname
		});
		return room;
	} catch (createError) {
		try {
			// Maybe it exists already?
			const room = rocketchat.get(`channels.info?roomName=${channelname}`);
			return room;
		} catch (infoError) {
			console.log(JSON.stringify(createError));
			console.log(JSON.stringify(infoError));
			throw new Error('Failed to find or create public channel');
		}
	}
};

export const createRandomRoom = async (user: { username: string; password: string }, type: 'p' | 'c' = 'c'): Promise<string> => {
	try {
		await login(user.username, user.password);
		const room = `room${random()}`;
		console.log(`Creating room ${room}`);
		await rocketchat.post(type === 'c' ? 'channels.create' : 'groups.create', {
			name: room
		});
		return room;
	} catch (e) {
		console.log(JSON.stringify(e));
		throw new Error('Failed to create room');
	}
};

export const createRandomTeam = async (user: { username: string; password: string }) => {
	try {
		await login(user.username, user.password);
		const team = `team${random()}`;
		console.log(`Creating team ${team}`);
		await rocketchat.post('teams.create', {
			name: team,
			type: TEAM_TYPE.PRIVATE
		});
		return team;
	} catch (e) {
		console.log(JSON.stringify(e));
		throw new Error('Failed create team');
	}
};

const createTeamIfNotExists = async (teamname: string) => {
	console.log(`Creating private team ${teamname}`);
	try {
		await rocketchat.post('teams.create', {
			name: teamname,
			type: TEAM_TYPE.PRIVATE
		});
	} catch (createError) {
		try {
			// Maybe it exists already?
			await rocketchat.get(`teams.info?teamName=${teamname}`);
		} catch (infoError) {
			console.log(JSON.stringify(createError));
			console.log(JSON.stringify(infoError));
			throw new Error('Failed to find or create private team');
		}
	}
};

const createGroupIfNotExists = async (groupname: string) => {
	console.log(`Creating private group ${groupname}`);
	try {
		await rocketchat.post('groups.create', {
			name: groupname
		});
	} catch (createError) {
		try {
			// Maybe it exists already?
			await rocketchat.get(`groups.info?roomName=${groupname}`);
		} catch (infoError) {
			console.log(JSON.stringify(createError));
			console.log(JSON.stringify(infoError));
			throw new Error('Failed to find or create private group');
		}
	}
};

const changeChannelJoinCode = async (roomId: string, joinCode: string) => {
	console.log(`Changing channel Join Code ${roomId}`);
	try {
		await rocketchat.post('method.call/saveRoomSettings', {
			message: JSON.stringify({
				msg: 'method',
				id: process.env.TEST_SESSION,
				method: 'saveRoomSettings',
				params: [roomId, { joinCode }]
			})
		});
	} catch (createError) {
		console.log(JSON.stringify(createError));
		throw new Error('Failed to create protected channel');
	}
};

export const sendRandomMessage = async ({
	user,
	room,
	messageEnd,
	tmid
}: {
	user: { username: string; password: string };
	room: string;
	messageEnd: string;
	tmid?: string;
}) => {
	try {
		const msg = `${random()}${messageEnd}`;
		console.log(`Sending message ${msg} to ${room}`);
		await login(user.username, user.password);
		const response = await rocketchat.post('chat.postMessage', { channel: room, msg, tmid });
		return response.data;
	} catch (infoError) {
		console.log(JSON.stringify(infoError));
		throw new Error('Failed to find or create private group');
	}
};

const sendMessage = async (user: { username: string; password: string }, channel: string, msg: string, tmid?: string) => {
	console.log(`Sending message to ${channel}`);
	try {
		await login(user.username, user.password);
		const response = await rocketchat.post('chat.postMessage', { channel, msg, tmid });
		return response.data;
	} catch (infoError) {
		console.log(JSON.stringify(infoError));
		throw new Error('Failed to find or create private group');
	}
};

const setup = async () => {
	await login(data.adminUser, data.adminPassword);

	for (const userKey in data.users) {
		if (Object.prototype.hasOwnProperty.call(data.users, userKey)) {
			const user = data.users[userKey as TDataUsers];
			await createUser(user.username, user.password, user.username, user.email);
		}
	}

	for (const channelKey in data.channels) {
		if (Object.prototype.hasOwnProperty.call(data.channels, channelKey)) {
			const channel = data.channels[channelKey as TDataChannels];
			const {
				data: {
					channel: { _id }
				}
			} = await createChannelIfNotExists(channel.name);

			if ('joinCode' in channel) {
				await changeChannelJoinCode(_id, channel.joinCode);
			}
		}
	}

	await login(data.users.regular.username, data.users.regular.password);

	for (const channelKey in data.userRegularChannels) {
		if (Object.prototype.hasOwnProperty.call(data.userRegularChannels, channelKey)) {
			const channel = data.userRegularChannels[channelKey as TUserRegularChannels];
			await createChannelIfNotExists(channel.name);
		}
	}

	for (const groupKey in data.groups) {
		if (Object.prototype.hasOwnProperty.call(data.groups, groupKey)) {
			const group = data.groups[groupKey as TDataGroups];
			await createGroupIfNotExists(group.name);
		}
	}

	for (const teamKey in data.teams) {
		if (Object.prototype.hasOwnProperty.call(data.teams, teamKey)) {
			const team = data.teams[teamKey as TDataTeams];
			await createTeamIfNotExists(team.name);
		}
	}
};

const get = (endpoint: string) => {
	console.log(`GET /${endpoint}`);
	return rocketchat.get(endpoint);
};

const post = async (endpoint: string, body: any, user = data.users.regular) => {
	await login(user.username, user.password);
	console.log(`POST /${endpoint} ${JSON.stringify(body)}`);
	return rocketchat.post(endpoint, body);
};

export { setup, sendMessage, get, post, login };

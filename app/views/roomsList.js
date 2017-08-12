import ActionButton from 'react-native-action-button';
import { Navigation } from 'react-native-navigation';
import { ListView } from 'realm/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Text, View, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import Meteor from 'react-native-meteor';
import realm from '../lib/realm';
import RocketChat from '../lib/rocketchat';
import RoomItem from '../components/RoomItem';
import debounce from '../utils/debounce';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center'
	},
	separator: {
		height: 1,
		backgroundColor: '#E7E7E7'
	},
	list: {
		width: '100%'
	},
	emptyView: {
		flexGrow: 1,
		alignItems: 'stretch',
		justifyContent: 'center'
	},
	emptyText: {
		textAlign: 'center',
		fontSize: 18,
		color: '#ccc'
	},
	bannerContainer: {
		backgroundColor: '#ddd'
	},
	bannerText: {
		textAlign: 'center',
		margin: 5
	},
	actionButtonIcon: {
		fontSize: 20,
		height: 22,
		color: 'white'
	},
	searchBoxView: {
		backgroundColor: '#eee'
	},
	searchBox: {
		backgroundColor: '#fff',
		margin: 5,
		borderRadius: 5,
		padding: 5,
		paddingLeft: 10,
		color: '#aaa'
	}
});

let setInitialData;

Meteor.getData().on('loggingIn', () => {
	setTimeout(() => {
		if (Meteor._isLoggingIn === false && Meteor.userId() == null) {
			console.log('loggingIn', Meteor.userId());
			Navigation.showModal({
				screen: 'Login',
				animationType: 'slide-up'
			});
		}
	}, 100);
});

Meteor.Accounts.onLogin(() => {
	console.log('onLogin');
});

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
class RoomsListItem extends React.PureComponent {
	static propTypes = {
		item: PropTypes.object.isRequired,
		onPress: PropTypes.func.isRequired
	}
	_onPress = (...args) => {
		this.props.onPress(...args);
	};

	render() {
		const { item } = this.props;
		return (
			<TouchableOpacity key={item._id} onPress={() => this.props.onPress(item._id, item)}>
				<RoomItem
					id={item._id}
					item={item}
				/>
			</TouchableOpacity>
		);
	}
}
export default class RoomsListView extends React.Component {
	static propTypes = {
		navigator: PropTypes.object.isRequired
	}

	static navigationOptions = (props) => {
		const server = RocketChat.currentServer ? RocketChat.currentServer.replace(/^https?:\/\//, '') : '';
		const textAlign = Platform.OS === 'ios' ? 'center' : 'left';
		const marginLeft = Platform.OS === 'ios' ? 0 : 20;
		const position = Platform.OS === 'ios' ? 'headerLeft' : 'headerRight';

		return {
			headerTitle: <View style={{ height: 10, width: 200, top: -10, marginLeft }}>
				<Text style={{ textAlign, fontSize: 16, fontWeight: '600' }}>Channels</Text>
				<Text style={{ textAlign, fontSize: 10 }}>{server}</Text>
			</View>,
			title: 'Channels',
			[position]: <Button title='Servers' onPress={() => props.navigation.navigate('ListServerModal')} />
		};
	}

	constructor(props) {
		super(props);
		this.data = realm.objects('subscriptions').filtered('_server.id = $0', RocketChat.currentServer).sorted('_updatedAt', true);
		this.state = {
			dataSource: ds.cloneWithRows(this.data.sorted('_updatedAt', true).slice(0, 10)),
			searching: false,
			searchDataSource: [],
			searchText: ''
		};
		this.data.addListener(this.updateState);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	componentWillMount() {
		setInitialData = this.setInitialData;

		if (RocketChat.currentServer) {
			this.props.navigator.setSubTitle({
				subtitle: RocketChat.currentServer
			});
		}

		this.props.navigator.setButtons({
			leftButtons: [{
				id: 'servers',
				title: 'Servers'
			}],
			// rightButtons: [], // see "Adding buttons to the navigator" below for format (optional)
			animated: true
		});

		// this.setInitialData();
		if (RocketChat.currentServer) {
			RocketChat.connect();
		} else {
			Navigation.showModal({
				screen: 'ListServer',
				passProps: {},
				navigatorStyle: {},
				navigatorButtons: {},
				animationType: 'none'
			});
		}
	}

	componentWillUnmount() {
		this.data.removeListener(this.updateState);
	}

	onNavigatorEvent = (event) => {
		if (event.type === 'NavBarButtonPress') {
			if (event.id === 'servers') {
				Navigation.showModal({
					screen: 'ListServer',
					passProps: {},
					navigatorStyle: {},
					navigatorButtons: {},
					animationType: 'slide-up'
					// animationType: 'none'
				});
			}
		}
	}

	onSearchChangeText = (text) => {
		const searchText = text.trim();
		this.setState({
			searchText: text,
			searching: searchText !== ''
		});

		if (searchText !== '') {
			const dataSource = [];
			const usernames = [];
			realm.objects('subscriptions').filtered('_server.id = $0 AND name CONTAINS[c] $1', RocketChat.currentServer, searchText).forEach((sub) => {
				dataSource.push(sub);

				if (sub.t === 'd') {
					usernames.push(sub.name);
				}
			});

			if (dataSource.length < 5) {
				RocketChat.spotlight(searchText, usernames)
					.then((results) => {
						results.users.forEach((user) => {
							dataSource.push({
								...user,
								name: user.username,
								t: 'd',
								search: true
							});
						});

						results.rooms.forEach((room) => {
							dataSource.push({
								...room,
								search: true
							});
						});

						this.setState({
							searchDataSource: dataSource
						});
					});
			}
		}
	}
	setInitialData = () => {
		if (this.data) {
			this.data.removeListener(this.updateState);
		}
		this.data = realm.objects('subscriptions').filtered('_server.id = $0', RocketChat.currentServer).sorted('_updatedAt', true);
		this.data.addListener(this.updateState);

		this.updateState();
	}

	getSubscriptions = () => this.data.sorted('_updatedAt', true)

	updateState = debounce(() => {
		this.setState({
			dataSource: ds.cloneWithRows(this.data.filtered('_server.id = $0', RocketChat.currentServer))
		});
	}, 500);

	_onPressItem = (id, item = {}) => {
		const navigateToRoom = (room) => {
			this.props.navigator.push({
				screen: 'Room',
				passProps: room
			});
		};

		const clearSearch = () => {
			this.setState({
				searchText: '',
				searching: false,
				searchDataSource: []
			});
		};

		// if user is using the search we need first to join/create room
		if (item.search) {
			if (item.t === 'd') {
				RocketChat.createDirectMessage(item.username)
					.then(room => realm.objects('subscriptions').filtered('_server.id = $0 AND rid = $1', RocketChat.currentServer, room.rid))
					.then(subs => navigateToRoom({ sid: subs[0]._id }))
					.then(() => clearSearch());
			} else {
				clearSearch();
				navigateToRoom({ rid: item._id, name: item.name });
			}
			return;
		}

		navigateToRoom({ sid: id });
		clearSearch();
	}

	_createChannel = () => {
		this.props.navigator.showModal({
			screen: 'CreateChannel'
		});
	}

	renderBanner = () => {
		const status = Meteor.getData() && Meteor.getData().ddp && Meteor.getData().ddp.status;

		if (status === 'disconnected') {
			return (
				<View style={[styles.bannerContainer, { backgroundColor: '#0d0' }]}>
					<Text style={[styles.bannerText, { color: '#fff' }]}>Connecting...</Text>
				</View>
			);
		}

		if (status === 'connected' && Meteor._isLoggingIn) {
			return (
				<View style={[styles.bannerContainer, { backgroundColor: 'orange' }]}>
					<Text style={[styles.bannerText, { color: '#a00' }]}>Authenticating...</Text>
				</View>
			);
		}
	}

	renderItem = ({ item }) => (
		<RoomsListItem item={item} onPress={() => this._onPressItem(item._id, item)} />
	);

	renderSeparator = () => (
		<View style={styles.separator} />
	);

	renderSearchBar = () => (
		<View style={styles.searchBoxView}>
			<TextInput
				style={styles.searchBox}
				value={this.state.searchText}
				onChangeText={this.onSearchChangeText}
				returnKeyType='search'
				placeholder='Search'
				clearButtonMode='while-editing'
				blurOnSubmit
			/>
		</View>
	);

	// if (!this.state.searching && !this.state.dataSource.length) {
	// 	return (
	// 		<View style={styles.emptyView}>
	// 			<Text style={styles.emptyText}>No rooms</Text>
	// 		</View>
	// 	);
	// }
	renderList = () => (
		// data={this.state.searching ? this.state.searchDataSource : this.state.dataSource}
		// keyExtractor={item => item._id}
		// ItemSeparatorComponent={this.renderSeparator}
		// renderItem={this.renderItem}
		<ListView
			dataSource={this.state.dataSource}
			style={styles.list}
			renderRow={item => this.renderItem({ item })}
			enableEmptySections
		/>
	)

	renderCreateButtons() {
		return (
			<ActionButton buttonColor='rgba(231,76,60,1)'>
				<ActionButton.Item buttonColor='#9b59b6' title='Create Channel' onPress={() => { this._createChannel(); }} >
					<Icon name='md-chatbubbles' style={styles.actionButtonIcon} />
				</ActionButton.Item>
			</ActionButton>);
	}
	render() {
		return (
			<View style={styles.container}>
				{this.renderBanner()}
				{this.renderSearchBar()}
				{this.renderList()}
				{this.renderCreateButtons()}
			</View>
		);
	}
}

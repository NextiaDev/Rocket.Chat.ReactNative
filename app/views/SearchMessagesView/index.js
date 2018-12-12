import React from 'react';
import PropTypes from 'prop-types';
import { View, FlatList, Text } from 'react-native';
import { connect } from 'react-redux';
import SafeAreaView from 'react-native-safe-area-view';

import LoggedView from '../View';
import RCTextInput from '../../containers/TextInput';
import RCActivityIndicator from '../../containers/ActivityIndicator';
import styles from './styles';
import Markdown from '../../containers/message/Markdown';
import debounce from '../../utils/debounce';
import RocketChat from '../../lib/rocketchat';
import Message from '../../containers/message/Message';
import scrollPersistTaps from '../../utils/scrollPersistTaps';
import I18n from '../../i18n';
import { DEFAULT_HEADER } from '../../constants/headerOptions';
import database from '../../lib/realm';

@connect(state => ({
	baseUrl: state.settings.Site_Url || state.server ? state.server.server : '',
	customEmojis: state.customEmojis,
	user: {
		id: state.login.user && state.login.user.id,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token
	}
}))
/** @extends React.Component */
export default class SearchMessagesView extends LoggedView {
	static options() {
		return {
			...DEFAULT_HEADER,
			topBar: {
				...DEFAULT_HEADER.topBar,
				title: {
					...DEFAULT_HEADER.topBar.title,
					text: I18n.t('Search')
				}
			}
		};
	}

	static propTypes = {
		rid: PropTypes.string,
		user: PropTypes.object,
		baseUrl: PropTypes.string,
		customEmojis: PropTypes.object
	}

	constructor(props) {
		super('SearchMessagesView', props);
		this.rooms = database.objects('subscriptions').filtered('rid = $0', props.rid);
		this.state = {
			loading: false,
			room: this.rooms[0],
			messages: [],
			searchText: ''
		};
	}

	componentDidMount() {
		this.name.focus();
	}

	componentWillUnmount() {
		this.search.stop();
	}

	// eslint-disable-next-line react/sort-comp
	search = debounce(async(searchText) => {
		const { room } = this.state;
		this.setState({ searchText, loading: true, messages: [] });

		try {
			const result = await RocketChat.searchMessages(room.rid, searchText);
			if (result.success) {
				this.setState({
					messages: result.messages || [],
					loading: false
				});
			}
		} catch (error) {
			this.setState({ loading: false });
			console.log('SearchMessagesView -> search -> catch -> error', error);
		}
	}, 1000)

	renderEmpty = () => (
		<View style={styles.listEmptyContainer}>
			<Text>{I18n.t('No_results_found')}</Text>
		</View>
	)

	renderItem = ({ item }) => {
		const { user, customEmojis, baseUrl } = this.props;
		return (
			<Message
				style={styles.message}
				customEmojis={customEmojis}
				baseUrl={baseUrl}
				user={user}
				author={item.u}
				ts={item.ts}
				msg={item.msg}
				attachments={item.attachments || []}
				timeFormat='MMM Do YYYY, h:mm:ss a'
				edited={!!item.editedAt}
				header
			/>
		);
	}

	renderList = () => {
		const { messages, loading, searchText } = this.state;

		if (!loading && messages.length === 0 && searchText.length) {
			return this.renderEmpty();
		}

		return (
			<FlatList
				data={messages}
				renderItem={this.renderItem}
				style={styles.list}
				keyExtractor={item => item._id}
				onEndReached={this.load}
				ListFooterComponent={loading ? <RCActivityIndicator /> : null}
				{...scrollPersistTaps}
			/>
		);
	}

	render() {
		return (
			<SafeAreaView style={styles.container} testID='search-messages-view' forceInset={{ bottom: 'never' }}>
				<View style={styles.searchContainer}>
					<RCTextInput
						inputRef={(e) => { this.name = e; }}
						label={I18n.t('Search')}
						onChangeText={this.search}
						placeholder={I18n.t('Search_Messages')}
						testID='search-message-view-input'
					/>
					<Markdown msg={I18n.t('You_can_search_using_RegExp_eg')} username='' baseUrl='' customEmojis={{}} />
					<View style={styles.divider} />
				</View>
				{this.renderList()}
			</SafeAreaView>
		);
	}
}

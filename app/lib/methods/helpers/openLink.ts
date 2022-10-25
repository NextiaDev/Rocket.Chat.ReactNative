import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import parse from 'url-parse';

import { themes } from '../../constants';
import { TSupportedThemes } from '../../../theme';
import UserPreferences from '../userPreferences';

export const DEFAULT_BROWSER_KEY = 'DEFAULT_BROWSER_KEY';

const scheme = {
	chrome: 'googlechrome:',
	chromeSecure: 'googlechromes:',
	firefox: 'firefox:',
	brave: 'brave:'
};

const appSchemeURL = (url: string, browser: string): string => {
	let schemeUrl = url;
	const parsedUrl = parse(url, true);
	const { protocol } = parsedUrl;
	const isSecure = ['https:'].includes(protocol);

	if (browser === 'googlechrome') {
		if (!isSecure) {
			schemeUrl = url.replace(protocol, scheme.chrome);
		} else {
			schemeUrl = url.replace(protocol, scheme.chromeSecure);
		}
	} else if (browser === 'firefox') {
		schemeUrl = `${scheme.firefox}//open-url?url=${url}`;
	} else if (browser === 'brave') {
		schemeUrl = `${scheme.brave}//open-url?url=${url}`;
	}

	return schemeUrl;
};

const addProtocol = (url: string): string => {
	if (!url.toLowerCase().startsWith('http')) {
		return `https://${url}`;
	}
	return url;
};

const openLink = async (url: string, theme: TSupportedThemes = 'light'): Promise<void> => {
	try {
		const browser = UserPreferences.getString(DEFAULT_BROWSER_KEY);
		url = addProtocol(url);
		if (browser === 'inApp') {
			await WebBrowser.openBrowserAsync(url, {
				toolbarColor: themes[theme].headerBackground,
				controlsColor: themes[theme].headerTintColor,
				// https://github.com/expo/expo/pull/4923
				enableBarCollapsing: true,
				showTitle: true
			});
		} else {
			const schemeUrl = appSchemeURL(url, browser!.replace(':', ''));
			await Linking.openURL(schemeUrl);
		}
	} catch {
		try {
			await Linking.openURL(url);
		} catch {
			// do nothing
		}
	}
};

export default openLink;

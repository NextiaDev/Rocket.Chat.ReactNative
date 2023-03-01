const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');

// Files paths
const ROCKET_CHAT_INFO_PLIST_PATH = './ios/RocketChatRN/Info.plist';
const SHARE_ROCKET_CHAT_INFO_PLIST_PATH = './ios/ShareRocketChatRN/Info.plist';
const NOTIFICATION_SERVICE_INFO_PLIST_PATH = './ios/NotificationService/Info.plist';

// Configure ios
const setupiOS = ({ config }) => {
	// Get current Info.plist
	const rocketChatInfo = plist.parse(fs.readFileSync(ROCKET_CHAT_INFO_PLIST_PATH, 'utf-8'));
	const shareRocketChatInfo = plist.parse(fs.readFileSync(SHARE_ROCKET_CHAT_INFO_PLIST_PATH, 'utf-8'));
	const notificationServiceInfo = plist.parse(fs.readSync(SHARE_ROCKET_CHAT_INFO_PLIST_PATH, 'utf-8'));

	// Update rocket chat info details
	rocketChatInfo.CFBundleDisplayName = config.display_name;
	rocketChatInfo.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}`;

	// Update share rocket chat info details
	shareRocketChatInfo.CFBundleDisplayName = `${config.display_name} Experimental`;
	shareRocketChatInfo.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}.ShareExtension`;

	// Update notification service info details
	notificationServiceInfo.CFBundleDisplayName = `${config.display_name} Notification Service`;
	notificationServiceInfo.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}.NotificationService`;

	// Update bugsnag api
	rocketChatInfo.bugsnag = {
		...rocketChatInfo.bugsnag,
		apiKey: config.bugsnag_api_key
	};

	shareRocketChatInfo.bugsnag = {
		...shareRocketChatInfo.bugsnag,
		apiKey: config.bugsnag_api_key
	};

	// Save file
	fs.writeFileSync(ROCKET_CHAT_INFO_PLIST_PATH, plist.build(rocketChatInfo));
	fs.writeFileSync(SHARE_ROCKET_CHAT_INFO_PLIST_PATH, plist.build(shareRocketChatInfo));
	fs.writeFileSync(NOTIFICATION_SERVICE_INFO_PLIST_PATH, plist.build(notificationServiceInfo));
};

// Setup both platforms
const config = yaml.load(fs.readFileSync('./.whitelabel.yml', 'utf8'));
setupiOS({ config });

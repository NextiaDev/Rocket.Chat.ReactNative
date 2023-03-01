// Import dependencies
const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');
const properties = require('properties-parser');

// Files paths
const ROCKET_CHAT_INFO_PLIST_PATH = './ios/RocketChatRN/Info.plist';
const SHARE_ROCKET_CHAT_INFO_PLIST_PATH = './ios/ShareRocketChatRN/Info.plist';
const NOTIFICATION_SERVICE_INFO_PLIST_PATH = './ios/NotificationService/Info.plist';

const GRADLE_PROPERTIES = './android/gradle.properties';

// Configure ios
const setupiOS = ({ config }) => {
	// Get current Info.plist
	const rocketChatInfo = plist.parse(fs.readFileSync(ROCKET_CHAT_INFO_PLIST_PATH, 'utf-8'));
	const shareRocketChatInfo = plist.parse(fs.readFileSync(SHARE_ROCKET_CHAT_INFO_PLIST_PATH, 'utf-8'));
	const notificationServiceInfo = plist.parse(fs.readFileSync(NOTIFICATION_SERVICE_INFO_PLIST_PATH, 'utf-8'));

	// Update rocket chat info details
	rocketChatInfo.CFBundleDisplayName = config.display_name;
	rocketChatInfo.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}`;
	rocketChatInfo.AppGroup = `group.ios.chat.${config.company_name}`;

	// Update share rocket chat info details
	shareRocketChatInfo.CFBundleDisplayName = `${config.display_name} Experimental`;
	shareRocketChatInfo.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}.ShareExtension`;
	shareRocketChatInfo.AppGroup = `group.ios.chat.${config.company_name}`;

	// Update notification service info details
	notificationServiceInfo.CFBundleDisplayName = `${config.display_name} Notification Service`;
	notificationServiceInfo.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}.NotificationService`;
	notificationServiceInfo.AppGroup = `group.ios.chat.${config.company_name}`;

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

// Configure android
const setupAndroid = ({ config }) => {
	// Read gradle properties
	const gradleProperties = properties.createEditor(GRADLE_PROPERTIES);

	// Replace properties
	gradleProperties.set('APPLICATION_ID', config.android.application_id);
	gradleProperties.set('BugsnagAPIKey', config.bugsnag_api_key);

	// Save files
	gradleProperties.save(GRADLE_PROPERTIES);
};

// Setup both platforms
const config = yaml.load(fs.readFileSync('./.whitelabel.yml', 'utf-8'));
setupiOS({ config });
setupAndroid({ config });

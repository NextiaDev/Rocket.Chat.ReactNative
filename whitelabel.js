// Import dependencies
const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');
const properties = require('properties-parser');
const xml2js = require('xml2js');

// File paths for iOS
const ROCKET_CHAT_INFO_PLIST_PATH = './ios/RocketChatRN/Info.plist';
const SHARE_ROCKET_CHAT_INFO_PLIST_PATH = './ios/ShareRocketChatRN/Info.plist';
const NOTIFICATION_SERVICE_INFO_PLIST_PATH = './ios/NotificationService/Info.plist';

// File paths for Android
const GRADLE_PROPERTIES = './android/gradle.properties';
const ANDROID_STRINGS = './android/app/src/experimental/res/values/strings.xml';

// Configure iOS
const setupiOS = ({ config }) => {
	// Read files
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
const setupAndroid = async ({ config }) => {
	// Read files
	const gradleProperties = properties.createEditor(GRADLE_PROPERTIES);
	const androidStrings = await xml2js.parseStringPromise(fs.readFileSync(ANDROID_STRINGS, 'utf-8'), { explicitArray: false });

	// Replace properties
	gradleProperties.set('APPLICATION_ID', config.android.application_id);
	gradleProperties.set('BugsnagAPIKey', config.bugsnag_api_key);

	// Replace strings
	androidStrings.resources.string.find(s => s.$.name === 'app_name')._ = config.display_name;
	androidStrings.resources.string.find(s => s.$.name === 'share_extension_name')._ = config.display_name;

	// Save files
	gradleProperties.save(GRADLE_PROPERTIES);

	const xmlBuilder = new xml2js.Builder();
	const newStringsXml = xmlBuilder.buildObject(androidStrings);
	fs.writeFileSync(ANDROID_STRINGS, newStringsXml);
};

// Setup both platforms
const config = yaml.load(fs.readFileSync('./.whitelabel.yml', 'utf-8'));
setupiOS({ config });
setupAndroid({ config });

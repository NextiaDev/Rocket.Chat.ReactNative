const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');

// Files paths
const INFO_PLIST_PATH = './ios/RocketChatRN/Info.plist';

// Configure ios
const setupiOS = ({ config }) => {
	// Get current Info.plist
	const info = plist.parse(fs.readFileSync(INFO_PLIST_PATH, 'utf-8'));

	// Update xcode details
	info.CFBundleDisplayName = config.display_name;
	info.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}`;

	// Update bugsnag api
	info.bugsnag = {
		...info.bugsnag,
		apiKey: config.bugsnag_api_key
	};

	// Save file
	fs.writeFileSync(INFO_PLIST_PATH, plist.build(info));
};

// Setup both platforms
const config = yaml.load(fs.readFileSync('./.whitelabel.yml', 'utf8'));
setupiOS({ config });

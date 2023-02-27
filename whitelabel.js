const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');

// Configure ios
const setupiOS = ({ config }) => {
	// Get current Info.plist
	const info = plist.parse(fs.readFileSync('./ios/RocketChatRN/Info.plist', 'utf-8'));

	// Update xcode details
	info.CFBundleDisplayName = config.display_name;
	info.CFBundleIdentifier = `${config.ios.bundle_identifier_prefix}.${config.company_name}`;

	// Update bugsnag api
	info.bugsnag = {
		...info.bugsnag,
		apiKey: config.bugsnag_api_key
	};

	// Save file
	console.log(plist.build(info));
};

// Setup both platforms
const config = yaml.load(fs.readFileSync('./.whitelabel.yml', 'utf8'));
setupiOS({ config });

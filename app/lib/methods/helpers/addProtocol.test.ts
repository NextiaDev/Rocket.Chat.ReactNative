import addProtocol from './addProtocol';

describe('Add the protocol https at the begin of the URL', () => {
	it('return the link as original when sent with https at the begin', () => {
		const linkHttps = 'https://www.google.com';
		expect(addProtocol(linkHttps)).toBe(linkHttps);
	});
	it('return the link as original when sent with http at the begin', () => {
		const linkHttp = 'http://www.google.com';
		expect(addProtocol(linkHttp)).toBe(linkHttp);
	});
	it("return a new link with protocol at the begin when there isn't the protocol at the begin", () => {
		const linkWithoutProtocol = 'www.google.com';
		expect(addProtocol(linkWithoutProtocol)).toBe('https://www.google.com');
	});
	it('return the link correctly when the original starts with double slash, because the server is returning that', () => {
		const linkWithDoubleSlashAtBegin = '//www.google.com';
		expect(addProtocol(linkWithDoubleSlashAtBegin)).toBe('https://www.google.com');
	});
});

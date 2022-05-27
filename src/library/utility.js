const { container } = require('@sapphire/pieces');
const Sentry = require('@sentry/node');

class Utility {
	constructor() {}

	/**
	 * 
	 * @param { Sentry.Exception } exception 
	 * @param { String } type 
	 */
	async exception(exception, type) {
		const sentryID = Sentry.captureException(exception);
		container.logger.error(
            `${type} exception with ID ${sentryID} sent to Sentry`
        );
		return sentryID;
	}
}

module.exports = { Utility };
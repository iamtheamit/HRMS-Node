// api/index.js
// Vercel serverless entrypoint for the backend Express app.

let app;

module.exports = async (req, res) => {
	try {
		if (!app) {
			app = require('../src/app');
		}

		return app(req, res);
	} catch (error) {
		console.error('Serverless bootstrap failure:', error);

		return res.status(500).json({
			success: false,
			message: 'Backend startup failed',
			error: process.env.NODE_ENV === 'production' ? undefined : String(error?.message || error),
		});
	}
};

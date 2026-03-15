// api/index.js
// Vercel serverless entrypoint for the backend Express app.

let app;

module.exports = async (req, res) => {
	try {
		const forwardedPath = req.query && req.query.__path;
		if (forwardedPath) {
			const queryEntries = Object.entries(req.query || {}).filter(([key]) => key !== '__path');
			const search = new URLSearchParams();
			queryEntries.forEach(([key, value]) => {
				if (Array.isArray(value)) {
					value.forEach((item) => search.append(key, String(item)));
				} else if (value !== undefined) {
					search.append(key, String(value));
				}
			});

			req.url = `/${String(forwardedPath).replace(/^\/+/, '')}${search.toString() ? `?${search.toString()}` : ''}`;
		}

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

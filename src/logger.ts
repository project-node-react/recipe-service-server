import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
	level: isDev ? "debug" : "info",
	...(isDev && {
		transport: {
			target: "pino-pretty",
		},
	}),
});

export default logger;

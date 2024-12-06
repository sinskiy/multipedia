export default ({ env }) => ({
  url: env("RENDER_EXTERNAL_URL", "http://localhost:1337"),
  app: {
    keys: env.array("APP_KEYS"),
  },
});

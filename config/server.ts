export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url:env('URL_API', undefined),
  admin:{
    url: env('URL_ADMIN', undefined),
    auth:{
      secret: env('ADMIN_JWT_SECRET', 'P0lterajaya')
    }
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
});

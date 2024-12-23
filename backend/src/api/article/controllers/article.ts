/**
 * article controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::article.article",
  ({ strapi }) => ({
    async find(ctx) {
      let { data, meta } = await super.find(ctx);

      // user reads article
      if (data.length === 1 && "body" in data[0] && "views" in data[0]) {
        data = [
          await strapi.query("api::article.article").update({
            where: { id: data[0].id },
            data: { views: data[0].views + 1 },
            select: ["documentId", "id", ...(ctx.query.fields as string[])],
            populate: {
              user: {
                fields: ["username"],
                populate: {
                  pfp: {
                    fields: ["url"],
                  },
                },
              },
              topic: {
                fields: ["title"],
              },
            },
          }),
        ];
      }

      return { data, meta };
    },
    async random(ctx) {
      const articles = await strapi.documents("api::article.article").findMany({
        fields: ["views"],
        populate: {
          user: {
            fields: ["username"],
            populate: { pfp: { fields: ["url"] } },
          },
          topic: {
            fields: ["title"],
          },
        },
        filters: {
          draft: {
            $eq: false,
          },
        },
      });
      const random =
        articles.length > 0
          ? articles[Math.floor(Math.random() * articles.length)]
          : {};
      return random;
    },
  })
);

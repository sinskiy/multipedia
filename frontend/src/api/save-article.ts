import { fetchStrapi, jsonStrapi } from "../lib/fetch-data";
import { z } from "zod";
import { validateData } from "../lib/validate-data";
import { UserWithFriends } from "../types/user";
import qs from "qs";

const schemaRegister = z.object({
  topic: z.string().min(3).max(255, {
    message: "Topic must be between 3 and 20 characters",
  }),
  body: z.string().max(10000, {
    message: "Body must be less than 10000 characters",
  }),
});

export async function saveArticleAction(
  formData: FormData,
  topicId: number,
  user: UserWithFriends | null
) {
  if (!user) return { error: "No user" };

  const validation = validateData(formData, schemaRegister);
  if (!validation.success) {
    return { zodErrors: validation.error };
  }

  try {
    const query = qs.stringify({
      filters: {
        user: {
          id: {
            $eq: user.id,
          },
        },
        topic: {
          id: {
            $eq: topicId,
          },
        },
      },
    });
    const userArticle = await fetchStrapi(`/articles?${query}`);
    //TODO: check  for errors
    const isCreated =
      userArticle && "data" in userArticle && userArticle.data.length > 0;
    const responseData = await jsonStrapi(
      isCreated ? "PUT" : "POST",
      `/articles${isCreated ? "/" + userArticle.data[0].documentId : ""}`,
      isCreated
        ? { data: { body: validation.data.body } }
        : {
            data: {
              ...validation.data,
              topic: { id: topicId },
              user: { id: user.id },
            },
          },
      { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
    );

    return responseData;
  } catch (e) {
    return { error: e };
  }
}
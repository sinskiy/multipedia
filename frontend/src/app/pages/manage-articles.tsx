import { ChangeEvent, useState } from "react";
import Toggle from "../../ui/toggle";
import classes from "./manage-articles.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMutation, fetchQuery } from "../../lib/fetch-data";
import { useCurrentUser } from "../../lib/context-as-hooks";
import qs from "qs";
import { getArticles } from "../../lib/get-articles";
import { Article } from "../../types/article";
import { Link } from "wouter";
import atomics from "../../atomics.module.css";

export default function ManageArticles() {
  const { currentUser } = useCurrentUser();

  const query = qs.stringify({
    fields: ["draft"],
    populate: {
      topic: {
        fields: ["title"],
      },
    },
    filters: {
      user: {
        username: {
          $eq: currentUser?.username,
        },
      },
    },
  });

  const [type, setType] = useState<"articles" | "drafts">("articles");
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setType(e.currentTarget.value as typeof type);
  }

  const { data, status, error } = useQuery({
    queryKey: ["manage-articles"],
    queryFn: () => fetchQuery(`/articles?${query}`),
    enabled: typeof currentUser === "object",
  });

  const { articles, drafts } = getArticles(data && "data" in data && data.data);

  return (
    <div className={classes.wrapper}>
      <nav className={classes.nav}>
        <Toggle
          id="articles"
          type="radio"
          name="articles"
          checked={type === "articles"}
          onChange={handleChange}
        >
          articles
        </Toggle>
        <Toggle
          id="drafts"
          type="radio"
          name="articles"
          checked={type === "drafts"}
          onChange={handleChange}
        >
          drafts
        </Toggle>
      </nav>
      {status === "error" && <p>{error.message}</p>}
      {status === "pending" && <p>loading...</p>}
      {status === "success" && (
        <>
          <List hidden={type !== "articles"} articles={articles} />
          <List hidden={type !== "drafts"} articles={drafts} />
        </>
      )}
    </div>
  );
}

interface ListProps {
  hidden: boolean;
  articles: Article[];
}

function List({ hidden, articles }: ListProps) {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const { status, error, mutate } = useMutation({
    mutationKey: ["delete-article"],
    mutationFn: (documentId: string) =>
      fetchMutation(
        "DELETE",
        `/articles/${documentId}`,
        {},
        { headers: { "user-id": String(currentUser?.id) } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-articles"] });
    },
  });
  function handleDelete(documentId: string) {
    mutate(documentId);
  }

  return (
    <ul hidden={hidden} className={classes.list}>
      {articles.length > 0 ? (
        articles.map((article) => (
          <li key={article.id} className={classes.article}>
            {article.topic.title}
            {status === "error" && <p>{error.message}</p>}
            <div className={classes.nav}>
              <button
                onClick={() => handleDelete(article.documentId)}
                disabled={status === "pending"}
              >
                delete
              </button>
              <Link
                href={`/users/${currentUser?.username}/articles/${article.topic.title}/edit`}
                className={atomics["link-button"]}
              >
                edit
              </Link>
            </div>
          </li>
        ))
      ) : (
        <p>
          <i>nothing</i>
        </p>
      )}
    </ul>
  );
}

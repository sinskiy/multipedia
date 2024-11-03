import UserProfile from "../../components/user-profile";
import { useCurrentUser } from "../../lib/context-as-hooks";
import { jsonStrapi } from "../../lib/fetch-data";
import { getFriends } from "../../lib/get-friends";
import ErrorPage from "../../ui/error-page";
import atomics from "../../atomics.module.css";
import classes from "./manage-friends.module.css";
import { MinimalUser } from "../../types/user";

export default function ManageFriends() {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return (
      <ErrorPage error={500}>
        Unexpected error. User couldn't be loaded
      </ErrorPage>
    );
  }

  const { friends, outcoming, incoming } = getFriends(
    true,
    currentUser.outcoming,
    currentUser.incoming
  );

  function handleDeleteClick(type: "incoming" | "outcoming") {
    return async function withType(documentId: string) {
      const data = await jsonStrapi(
        "PUT",
        `/users/${currentUser?.documentId}`,
        {
          data: { [type]: { disconnect: [documentId] } },
        }
      );
      console.log(data);
    };
  }

  return (
    <section className={classes.section}>
      <FriendsToManageList
        list={friends}
        label="friends"
        handleDeleteClick={handleDeleteClick("outcoming")}
      />
      <FriendsToManageList
        list={outcoming}
        label="outcoming"
        handleDeleteClick={handleDeleteClick("outcoming")}
      />
      <FriendsToManageList
        list={incoming}
        label="incoming"
        handleDeleteClick={handleDeleteClick("incoming")}
      />
    </section>
  );
}

interface FriendsToManageListProps {
  list: MinimalUser[];
  label: string;
  handleDeleteClick: (documentId: string) => void;
}

function FriendsToManageList({
  list,
  label,
  handleDeleteClick,
}: FriendsToManageListProps) {
  return (
    <figure>
      <h3 className={atomics.h3}>{label}</h3>
      <figcaption>
        {list.length > 0 ? (
          <ul>
            {list.map((user) => (
              <div className={classes.delete} key={user.id}>
                <UserProfile user={user} size={64} showEditButton={false} />
                <button onClick={() => handleDeleteClick(user.documentId)}>
                  delete
                </button>
              </div>
            ))}
          </ul>
        ) : (
          <p>no {label}</p>
        )}
      </figcaption>
    </figure>
  );
}
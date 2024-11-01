import { fetchStrapi, jsonStrapi } from "../utils/fetch-data";
export async function uploadPfp(pfpId: string | undefined, pfp: File) {
  const jwt = localStorage.getItem("jwt");

  if (pfpId) {
    try {
      await fetchStrapi(`/upload/files/${pfpId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        method: "DELETE",
      });
    } catch {
      return { error: { message: "Failed to delete previous image" } };
    }
  }

  const formData = new FormData();
  formData.append("files", pfp, pfp.name);

  const fileUploadResponse = await fetchStrapi("/upload", {
    headers: { Authorization: `Bearer ${jwt}` },
    method: "POST",
    body: formData,
  });
  if (fileUploadResponse.error) {
    return fileUploadResponse;
  }

  const updatedPfpId = { pfp: fileUploadResponse[0].id as string };
  const updateImageResponse = await jsonStrapi(
    "PUT",
    "/user/me",
    updatedPfpId,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  if (updateImageResponse.error) {
    return updateImageResponse;
  }
}
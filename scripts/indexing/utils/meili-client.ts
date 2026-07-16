function getConfig() {
  const host = process.env.MEILI_HOST || "http://localhost:7700";
  const key = process.env.MEILI_KEY;

  if (!key) {
    throw new Error("Set MEILI_KEY (Meilisearch master or API key)");
  }

  return { host, key };
}

function headers(key: string) {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function waitForTask(host: string, key: string, taskUid: number) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const response = await fetch(`${host}/tasks/${taskUid}`, {
      headers: headers(key),
    });
    const task = await response.json();

    if (task.status === "succeeded") return task;
    if (task.status === "failed") {
      throw new Error(`Indexing task failed: ${JSON.stringify(task.error)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Task ${taskUid} did not complete in time`);
}

/**
 * Ensures the index accepts `filter: "tags = ..."` queries (used by the
 * backend's tag-filtered search). Idempotent: PATCHing the same value is a
 * cheap no-op task, so it's safe to run before every indexing call.
 */
export async function ensureFilterableTags(indexUid: string) {
  const { host, key } = getConfig();

  const response = await fetch(`${host}/indexes/${indexUid}/settings`, {
    method: "PATCH",
    headers: headers(key),
    body: JSON.stringify({ filterableAttributes: ["tags"] }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update index settings: ${response.status} ${await response.text()}`
    );
  }

  const { taskUid } = await response.json();
  return waitForTask(host, key, taskUid);
}

export async function indexDocument(
  indexUid: string,
  document: Record<string, unknown>
) {
  const { host, key } = getConfig();

  const response = await fetch(
    `${host}/indexes/${indexUid}/documents?primaryKey=id`,
    {
      method: "POST",
      headers: headers(key),
      body: JSON.stringify([document]),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to index document: ${response.status} ${await response.text()}`
    );
  }

  const { taskUid } = await response.json();
  return waitForTask(host, key, taskUid);
}

export async function search(indexUid: string, query: string) {
  const { host, key } = getConfig();

  const response = await fetch(`${host}/indexes/${indexUid}/search`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify({
      q: query,
      // Exclude the full body text from the response; return only a cropped
      // excerpt around the matched terms instead (see attributesToCrop below).
      attributesToRetrieve: ["id", "lang", "path", "title", "description", "tags"],
      attributesToCrop: ["content"],
      cropLength: 20,
      attributesToHighlight: ["content"],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Search failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

export type RepoMeta = { created: string; modified: string; size: string };
export type Push = { repo: string; message: string; at: string; url: string };

type RepoResponse = {
  name: string;
  description: string | null;
  html_url: string;
  url: string;
  created_at: string;
  pushed_at: string;
  size: number;
};

type EventResponse = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: { head?: string };
};

type CommitResponse = { commit: { message: string } };

const headers = { Accept: "application/vnd.github+json" };
const cache = new Map<string, Promise<unknown>>();

const getJson = <T>(url: string): Promise<T | null> => {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    );
  }
  return cache.get(url) as Promise<T | null>;
};

export const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const relative = (iso: string) => {
  const minutes = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.round(minutes)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return dateFormat.format(new Date(iso));
};

const formatSize = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

export const fetchRepoMeta = async (repo: string): Promise<RepoMeta | null> => {
  const data = await getJson<RepoResponse>(`https://api.github.com/repos/${repo}`);
  if (!data) return null;
  return {
    created: dateFormat.format(new Date(data.created_at)),
    modified: relative(data.pushed_at),
    size: formatSize(data.size),
  };
};

const pushKey = (user: string) => `gh-push:${user}`;

export const fetchLatestPush = async (user: string): Promise<Push | null> => {
  try {
    const cached = sessionStorage.getItem(pushKey(user));
    if (cached) {
      const { at, push } = JSON.parse(cached) as { at: number; push: Push };
      if (Date.now() - at < 600_000) return push;
    }
  } catch {}

  const firstLine = (message: string) => message.split("\n")[0].slice(0, 90);

  let push: Push | null = null;
  const events = await getJson<EventResponse[]>(
    `https://api.github.com/users/${user}/events/public?per_page=30`,
  );
  const event = events?.find((item) => item.type === "PushEvent");

  if (event) {
    const head = event.payload?.head;
    const commit = head
      ? await getJson<CommitResponse>(`https://api.github.com/repos/${event.repo.name}/commits/${head}`)
      : null;
    push = {
      repo: event.repo.name.split("/")[1],
      message: commit ? firstLine(commit.commit.message) : "",
      at: event.created_at,
      url: `https://github.com/${event.repo.name}`,
    };
  } else {
    const repos = await getJson<RepoResponse[]>(
      `https://api.github.com/users/${user}/repos?sort=pushed&per_page=1`,
    );
    const repo = repos?.[0];
    if (repo) {
      const commits = await getJson<CommitResponse[]>(`${repo.url}/commits?per_page=1`);
      push = {
        repo: repo.name,
        message: commits?.[0] ? firstLine(commits[0].commit.message) : "",
        at: repo.pushed_at,
        url: repo.html_url,
      };
    }
  }

  if (push) {
    try {
      sessionStorage.setItem(pushKey(user), JSON.stringify({ at: Date.now(), push }));
    } catch {}
  }
  return push;
};

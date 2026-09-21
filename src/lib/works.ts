export interface GitHubItem {
  title: string;
  url: string;
  createdAt: string;
  state?: "OPEN" | "CLOSED" | "MERGED";
  isDraft?: boolean;
  repository: {
    name: string;
  };
}

export type PrStatusKey = "draft" | "open" | "merged" | "closed";

export function filterByRepo(items: GitHubItem[], repo: string): GitHubItem[] {
  return items.filter((item) =>
    item.repository.name.toLowerCase().includes(repo.toLowerCase()),
  );
}

export function getPrStatusKey(item: GitHubItem): PrStatusKey | null {
  if (!item.state) return null;
  if (item.isDraft) return "draft";
  if (item.state === "MERGED") return "merged";
  if (item.state === "CLOSED") return "closed";
  return "open";
}

export function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

import Home from "../page";

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  return <Home searchParams={searchParams} browseMode />;
}

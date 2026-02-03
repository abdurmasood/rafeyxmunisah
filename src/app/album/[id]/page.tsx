import { AlbumGrid } from "@/components/AlbumGrid";

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  return <AlbumGrid albumId={id} />;
}

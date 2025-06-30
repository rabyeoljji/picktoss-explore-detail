export interface GetPublicSingleDocumentQuizDto {
  id: number;
  answer: string;
  question: string;
  explanation: string;
  options: string[];
  quizType: "MIX_UP" | "MULTIPLE_CHOICE";
}

export interface GetPublicSingleDocumentResponse {
  id: number;
  creator: string;
  name: string;
  emoji: string;
  category: string;
  tryCount: number;
  bookmarkCount: number;
  totalQuizCount: number;
  isBookmarked: boolean;
  createdAt: string;
  quizzes: GetPublicSingleDocumentQuizDto[];
  isOwner: boolean;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(
    `${process.env.API_URL!}/documents/${id}/public`
  );
  const data: GetPublicSingleDocumentResponse = await response.json();

  return {
    title: "픽토스: 나를 성장시키는 AI 퀴즈",
    description: "나를 성장시키는 똑똑한 퀴즈",
    openGraph: {
      title: data.name,
      type: "article",
      url: `https://picktoss.com/explore/detail/${id}`,
      siteName: "PickToss",
      locale: "ko_KR",
      images: [
        {
          url: "/opengraph-quiz.png",
          width: 1200,
          height: 630,
          alt: data.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description: "나를 성장시키는 똑똑한 퀴즈",
      images: ["/opengraph-quiz.png"],
    },
  };
}

export default async function ExploreDetailPage() {
  return null;
}

import { redirect } from "next/navigation";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const response = await fetch(
      `${process.env.API_URL!}/documents/${id}/public`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetPublicSingleDocumentResponse = await response.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    return {
      title: `${data.emoji} ${data.name} - 픽토스`,
      description: `${data.creator}가 만든 ${data.category} 퀴즈 문서 - 총 ${data.totalQuizCount}개의 퀴즈`,
      openGraph: {
        title: `${data.emoji} ${data.name}`,
        description: `${data.creator}가 만든 ${data.category} 퀴즈 문서 - 총 ${data.totalQuizCount}개의 퀴즈`,
        type: "article",
        url: `https://picktoss.com/explore/detail/${id}`,
        siteName: "PickToss",
        locale: "ko_KR",
        images: [
          {
            url: `${baseUrl}/opengraph-quiz.png`,
            width: 1200,
            height: 630,
            alt: data.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${data.emoji} ${data.name}`,
        description: `${data.creator}가 만든 ${data.category} 퀴즈 문서 - 총 ${data.totalQuizCount}개의 퀴즈`,
        images: [`${baseUrl}/opengraph-quiz.png`],
      },
    };
  } catch (error) {
    console.error("Failed to fetch document data:", error);

    // 폴백 메타데이터
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return {
      title: "픽토스: 나를 성장시키는 AI 퀴즈",
      description: "나를 성장시키는 똑똑한 퀴즈",
      openGraph: {
        title: "픽토스: 나를 성장시키는 AI 퀴즈",
        description: "나를 성장시키는 똑똑한 퀴즈",
        type: "article",
        url: `${baseUrl}/explore/detail/${id}`,
        siteName: "PickToss",
        locale: "ko_KR",
        images: [
          {
            url: `${baseUrl}/opengraph-quiz.png`,
            width: 1200,
            height: 630,
            alt: "PickToss Quiz",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "픽토스: 나를 성장시키는 AI 퀴즈",
        description: "나를 성장시키는 똑똑한 퀴즈",
        images: [`${baseUrl}/opengraph-quiz.png`],
      },
    };
  }
}

export default async function ExploreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`https://picktoss.com/explore/detail/${id}`);
}

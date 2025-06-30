import { isbot } from "isbot";
import { headers } from "next/headers";
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
        url: `${baseUrl}/explore/detail/${id}`,
        siteName: "picktoss",
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
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

/** ❶ 미리보기 전용 UA(국내·메신저) — 필요 시 추가 */
const PREVIEW_UA = [
  /kakaotalk-scrap/i,
  /Slackbot-LinkExpanding/i,
  /Slack-ImgProxy/i,
  /Discordbot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /SkypeUriPreview/i,
  /Pinterest/i,
  /Line\//i, // LINE (iOS/Android 모두)
  /Viber/i,
  /facebookexternalhit/i, // FB App → 이미 isbot 에 포함돼 있지만 명시
];

/** ❷ UA 검사 함수 */
export function isCrawler(ua = ""): boolean {
  if (!ua) return false;
  // isbot → 글로벌 봇 대부분 탐지, PREVIEW_UA → 국내/메신저 보강
  return isbot(ua) || PREVIEW_UA.some((re) => re.test(ua));
}

export default async function ExploreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ua = (await headers()).get("user-agent") ?? "";

  if (!isCrawler(ua)) {
    // 브라우저만 루트 도메인으로 이동
    redirect(`https://picktoss.com/explore/detail/${id}`);
  }

  // 크롤러에게는 OG 메타태그가 포함된 정적 HTML을 반환
  return null;
}

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
      openGraph: {
        title: `${data.emoji} ${data.name}`,
        description: `${data.category} - ${data.totalQuizCount}개의 문제`,
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
        description: `${data.category} - ${data.totalQuizCount}개의 문제`,
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

/** 1)  ❗‘스크랩 전용’ UA 목록 (필요 시 추가) */
const SCRAP_BOTS = [
  /kakaotalk-scrap/i, // Kakao 미리보기
  /facebookexternalhit/i, // Facebook / Instagram 카드
  /Slackbot-LinkExpanding/i,
  /Slack-ImgProxy/i,
  /Discordbot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /SkypeUriPreview/i,
  /Pinterest/i,
  /Line\//i,
  /Viber/i,
];

/** 2)  ❗‘사람인데 isbot 에서 오탐되는’ in-app UA 예외 목록 */
const FALSE_POSITIVE = [
  /KAKAOTALK\/\d/i, // Kakao 인‑앱 브라우저
  // 필요하면 /DaumApp/i 등 추가
];

/** 3)  UA 판정 함수 */
function isCrawler(ua: string): boolean {
  if (!ua) return false;

  // (A) in‑app 예외 → 무조건 ‘사람’으로 취급
  if (FALSE_POSITIVE.some((re) => re.test(ua))) return false;

  // (B) 스크랩 봇 → 무조건 ‘봇’
  if (SCRAP_BOTS.some((re) => re.test(ua))) return true;

  // (C) 나머지는 isbot 결과에 따름
  return isbot(ua);
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

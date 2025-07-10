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

    // SEO 최적화된 설명 생성
    const description = `${data.category} - ${data.totalQuizCount}개의 문제`;

    // 키워드 생성
    const keywords = [
      data.category,
      "퀴즈",
      "AI 퀴즈",
      "학습",
      "교육",
      "픽토스",
      "picktoss",
      "온라인 퀴즈",
      data.creator,
    ].join(", ");

    return {
      title: `${data.emoji} ${data.name} - 픽토스`,
      description: description,
      keywords: keywords,
      authors: [{ name: data.creator }],
      creator: data.creator,
      publisher: "픽토스(PickToss)",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: `${data.emoji} ${data.name}`,
        description: description,
        type: "article",
        url: `${baseUrl}/explore/detail/${id}`,
        siteName: "PickToss",
        locale: "ko_KR",
        publishedTime: data.createdAt,
        authors: [data.creator],
        tags: [data.category, "퀴즈", "AI 퀴즈", "학습"],
        images: [
          {
            url: `${baseUrl}/opengraph-quiz.png`,
            width: 1200,
            height: 630,
            alt: `${data.name} - ${data.category} 퀴즈`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@picktoss",
        creator: `@${data.creator}`,
        title: `${data.emoji} ${data.name}`,
        description: description,
        images: [
          {
            url: `${baseUrl}/opengraph-quiz.png`,
            alt: `${data.name} - ${data.category} 퀴즈`,
          },
        ],
      },
      alternates: {
        canonical: `${baseUrl}/explore/detail/${id}`,
      },
      other: {
        "theme-color": "#6366f1",
        "color-scheme": "light dark",
        "format-detection": "telephone=no",
      },
    };
  } catch (error) {
    console.error("Failed to fetch document data:", error);

    // 폴백 메타데이터
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const fallbackDescription =
      "나를 성장시키는 똑똑한 AI 퀴즈 플랫폼. 다양한 카테고리의 퀴즈로 재미있게 학습하세요.";

    return {
      title: "픽토스: 나를 성장시키는 AI 퀴즈",
      description: fallbackDescription,
      keywords: "퀴즈, AI 퀴즈, 학습, 교육, 픽토스, picktoss, 온라인 퀴즈",
      authors: [{ name: "PickToss" }],
      creator: "PickToss",
      publisher: "픽토스(PickToss)",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: "픽토스: 나를 성장시키는 AI 퀴즈",
        description: fallbackDescription,
        type: "article",
        url: `${baseUrl}/explore/detail/${id}`,
        siteName: "PickToss",
        locale: "ko_KR",
        images: [
          {
            url: `${baseUrl}/opengraph-quiz.png`,
            width: 1200,
            height: 630,
            alt: "PickToss - AI 퀴즈 플랫폼",
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@picktoss",
        title: "픽토스: 나를 성장시키는 AI 퀴즈",
        description: "나를 성장시키는 똑똑한 퀴즈",
        images: [
          {
            url: `${baseUrl}/opengraph-quiz.png`,
            alt: "PickToss - AI 퀴즈 플랫폼",
          },
        ],
      },
      alternates: {
        canonical: `${baseUrl}/explore/detail/${id}`,
      },
      other: {
        "theme-color": "#6366f1",
        "color-scheme": "light dark",
        "format-detection": "telephone=no",
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

  if (!isCrawler(ua) && process.env.NODE_ENV === "production") {
    // 브라우저만 루트 도메인으로 이동
    redirect(`https://picktoss.com/explore/detail/${id}`);
  }

  // 크롤러를 위한 JSON-LD 구조화 데이터 생성
  let jsonLd = null;
  try {
    const response = await fetch(
      `${process.env.API_URL!}/documents/${id}/public`
    );

    if (response.ok) {
      const data: GetPublicSingleDocumentResponse = await response.json();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${baseUrl}/explore/detail/${id}`,
        name: data.name,
        description: `${data.category} - ${data.totalQuizCount}개의 문제`,
        creator: {
          "@type": "Person",
          name: data.creator,
        },
        publisher: {
          "@type": "Organization",
          name: "픽토스",
          url: "https://picktoss.com",
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`,
          },
        },
        dateCreated: data.createdAt,
        datePublished: data.createdAt,
        dateModified: data.createdAt,
        url: `${baseUrl}/explore/detail/${id}`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/explore/detail/${id}`,
        },
        image: {
          "@type": "ImageObject",
          url: `${baseUrl}/opengraph-quiz.png`,
          width: 1200,
          height: 630,
        },
        keywords: [data.category, "퀴즈", "AI 퀴즈", "학습"].join(", "),
        about: {
          "@type": "Thing",
          name: data.category,
        },
        educationalLevel: "beginner",
        learningResourceType: "Quiz",
        interactionStatistic: [
          {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/BookmarkAction",
            userInteractionCount: data.bookmarkCount,
          },
          {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ViewAction",
            userInteractionCount: data.tryCount,
          },
        ],
        aggregateRating:
          data.tryCount > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: "4.5",
                ratingCount: data.tryCount,
                bestRating: "5",
                worstRating: "1",
              }
            : undefined,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
          availability: "https://schema.org/InStock",
        },
        inLanguage: "ko-KR",
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch data for JSON-LD:", error);
  }

  // 크롤러에게는 JSON-LD와 기본 SEO 태그가 포함된 정적 HTML을 반환
  return (
    <html lang="ko">
      <head>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <meta name="robots" content="index, follow" />
        <meta
          name="googlebot"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_BASE_URL}/explore/detail/${id}`}
        />
      </head>
      <body>
        <main>
          <h1>픽토스 퀴즈</h1>
          <p>AI가 만든 똑똑한 퀴즈로 재미있게 학습하세요.</p>
        </main>
      </body>
    </html>
  );
}

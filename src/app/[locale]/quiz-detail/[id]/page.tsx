import { isbot } from "isbot";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";

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

function normalizeLocale(locale: string) {
  return locale === "en" ? "en" : "ko";
}

function ogImagePath(locale: string) {
  return locale === "en" ? "/opengraph-quiz-eng.png" : "/opengraph-quiz.png";
}

function ogLocale(locale: string) {
  return locale === "en" ? "en_US" : "ko_KR";
}

function localizedMetadata(locale: string, data?: GetPublicSingleDocumentResponse) {
  if (locale === "en") {
    return {
      description: data
        ? `${data.category} - ${data.totalQuizCount} questions`
        : "A smart AI quiz platform to help you grow. Learn with fun quizzes across various categories.",
      keywords: data
        ? [
            data.category,
            "quiz",
            "AI quiz",
            "learning",
            "education",
            "Picktoss",
            "online quiz",
            data.creator,
          ].join(", ")
        : "quiz, AI quiz, learning, education, Picktoss, online quiz",
      title: data ? `${data.emoji} ${data.name} - Picktoss` : "Picktoss: AI Quiz for Growth",
    };
  }

  return {
    description: data
      ? `${data.category} - ${data.totalQuizCount}개의 문제`
      : "나를 성장시키는 똑똑한 AI 퀴즈 플랫폼. 다양한 카테고리의 퀴즈로 재미있게 학습하세요.",
    keywords: data
      ? [
          data.category,
          "퀴즈",
          "AI 퀴즈",
          "학습",
          "교육",
          "픽토스",
          "picktoss",
          "온라인 퀴즈",
          data.creator,
        ].join(", ")
      : "퀴즈, AI 퀴즈, 학습, 교육, 픽토스, picktoss, 온라인 퀴즈",
    title: data ? `${data.emoji} ${data.name} - 픽토스` : "픽토스: 나를 성장시키는 AI 퀴즈",
  };
}

function localizedBodyText(locale: string) {
  if (locale === "en") {
    return {
      siteTitle: "Picktoss",
      siteTagline: "AI quizzes that help you grow",
      quizInfoTitle: "Quiz Info",
      quizListTitle: "Quiz Questions",
      quizListSummary: (count: number, category: string) =>
        `This quiz includes ${count} questions. Learn key concepts in ${category}.`,
      questionLabel: (index: number) => `Question ${index}`,
      quizTypeLabel: "Type:",
      typeMultiple: "Multiple choice",
      typeMixUp: "Ordering",
      questionTitle: "Question",
      optionsTitle: "Choices",
      learningPointTitle: "Learning Point",
      learningPointBody: (category: string) =>
        `This question covers core concepts in ${category}. Find answers and full explanations on Picktoss.`,
      analysisTitle: "Question Type Breakdown",
      analysisBody: (mcCount: number, mixCount: number) =>
        `This quiz has ${mcCount} multiple-choice questions and ${mixCount} ordering questions.`,
      keywordsLabel: "Category keywords:",
      learnMoreTitle: "Learn on Picktoss",
      learnMoreBody:
        "You can solve this quiz on the Picktoss platform. Enjoy AI-generated questions and learn with fun.",
      learnMoreBody2:
        "After solving, deepen your understanding with detailed explanations.",
      fallbackTitle: "Picktoss Quiz",
      fallbackBody1: "Enjoy smart AI-made quizzes and learn with fun.",
      fallbackBody2: "A variety of categories are ready for you.",
      footerLine1: "© 2024 Picktoss. All rights reserved.",
      footerLine2: "AI quiz platform for growth",
      createdAtLabel: "Created:",
      tryCountLabel: "Attempts:",
      bookmarkLabel: "Bookmarks:",
      authorLabel: "Creator:",
      categoryLabel: "Category:",
      totalCountLabel: (count: number) => `Total ${count} questions`,
    };
  }

  return {
    siteTitle: "픽토스",
    siteTagline: "나를 성장시키는 AI 퀴즈",
    quizInfoTitle: "퀴즈 정보",
    quizListTitle: "퀴즈 문제 목록",
    quizListSummary: (count: number, category: string) =>
      `총 ${count}개의 문제가 포함되어 있습니다. 각 문제를 통해 ${category} 분야의 지식을 학습할 수 있습니다.`,
    questionLabel: (index: number) => `문제 ${index}`,
    quizTypeLabel: "유형:",
    typeMultiple: "객관식 문제",
    typeMixUp: "순서맞추기 문제",
    questionTitle: "문제",
    optionsTitle: "선택지",
    learningPointTitle: "학습 포인트",
    learningPointBody: (category: string) =>
      `이 문제는 ${category} 분야의 핵심 개념을 다루고 있습니다. 정답과 상세한 해설은 픽토스 플랫폼에서 확인하실 수 있습니다.`,
    analysisTitle: "문제 유형 분석",
    analysisBody: (mcCount: number, mixCount: number) =>
      `이 퀴즈는 ${mcCount}개의 객관식 문제와 ${mixCount}개의 순서맞추기 문제로 구성되어 있습니다.`,
    keywordsLabel: "관련 키워드:",
    learnMoreTitle: "픽토스에서 학습하기",
    learnMoreBody:
      "이 퀴즈는 픽토스 플랫폼에서 직접 풀어볼 수 있습니다. AI가 생성한 똑똑한 문제들로 재미있게 학습해보세요.",
    learnMoreBody2:
      "퀴즈를 풀고 나서는 상세한 해설을 통해 더 깊이 있는 학습이 가능합니다.",
    fallbackTitle: "픽토스 퀴즈",
    fallbackBody1: "AI가 만든 똑똑한 퀴즈로 재미있게 학습하세요.",
    fallbackBody2: "다양한 카테고리의 퀴즈가 준비되어 있습니다.",
    footerLine1: "© 2024 픽토스(Picktoss). 모든 권리 보유.",
    footerLine2: "나를 성장시키는 AI 퀴즈 플랫폼",
    createdAtLabel: "생성일:",
    tryCountLabel: "도전한 사람:",
    bookmarkLabel: "북마크:",
    authorLabel: "작성자:",
    categoryLabel: "카테고리:",
    totalCountLabel: (count: number) => `총 ${count}개의 문제`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const normalizedLocale = normalizeLocale(locale);

  try {
    const response = await apiFetch(`/documents/${id}`, {
      locale: normalizedLocale,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetPublicSingleDocumentResponse = await response.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const ogImage = `${baseUrl}${ogImagePath(normalizedLocale)}`;
    const canonicalUrl = `${baseUrl}/${normalizedLocale}/quiz-detail/${id}`;
    const localized = localizedMetadata(normalizedLocale, data);

    return {
      title: localized.title,
      description: localized.description,
      keywords: localized.keywords,
      authors: [{ name: data.creator }],
      creator: data.creator,
      publisher: "픽토스(Picktoss)",
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
        title: localized.title.replace(" - 픽토스", "").replace(" - Picktoss", ""),
        description: localized.description,
        type: "article",
        url: canonicalUrl,
        siteName: "Picktoss",
        locale: ogLocale(normalizedLocale),
        publishedTime: data.createdAt,
        authors: [data.creator],
        tags: [data.category, "퀴즈", "AI 퀴즈", "학습"],
        images: [
          {
            url: ogImage,
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
        title: localized.title.replace(" - 픽토스", "").replace(" - Picktoss", ""),
        description: localized.description,
        images: [
          {
            url: ogImage,
            alt: `${data.name} - ${data.category} 퀴즈`,
          },
        ],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      other: {
        "theme-color": "#6366f1",
        "color-scheme": "light dark",
        "format-detection": "telephone=no",
      },
    };
  } catch (error) {
    console.error("Failed to fetch document data:", error);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const ogImage = `${baseUrl}${ogImagePath(normalizedLocale)}`;
    const canonicalUrl = `${baseUrl}/${normalizedLocale}/quiz-detail/${id}`;
    const localized = localizedMetadata(normalizedLocale);

    return {
      title: localized.title,
      description: localized.description,
      keywords: localized.keywords,
      authors: [{ name: "Picktoss" }],
      creator: "Picktoss",
      publisher: "픽토스(Picktoss)",
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
        title: localized.title,
        description: localized.description,
        type: "article",
        url: canonicalUrl,
        siteName: "Picktoss",
        locale: ogLocale(normalizedLocale),
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: "Picktoss - AI 퀴즈 플랫폼",
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@picktoss",
        title: localized.title,
        description:
          normalizedLocale === "en"
            ? "A smart quiz experience that helps you grow"
            : "나를 성장시키는 똑똑한 퀴즈",
        images: [
          {
            url: ogImage,
            alt: "Picktoss - AI 퀴즈 플랫폼",
          },
        ],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      other: {
        "theme-color": "#6366f1",
        "color-scheme": "light dark",
        "format-detection": "telephone=no",
      },
    };
  }
}

const SCRAP_BOTS = [
  /kakaotalk-scrap/i,
  /facebookexternalhit/i,
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

const FALSE_POSITIVE = [
  /KAKAOTALK\/\d/i,
];

function isCrawler(ua: string): boolean {
  if (!ua) return false;

  if (FALSE_POSITIVE.some((re) => re.test(ua))) return false;
  if (SCRAP_BOTS.some((re) => re.test(ua))) return true;

  return isbot(ua);
}

export default async function ExploreDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const text = localizedBodyText(normalizedLocale);
  const ua = (await headers()).get("user-agent") ?? "";

  if (!isCrawler(ua) && process.env.NODE_ENV === "production") {
    redirect(`https://picktoss.com/${normalizedLocale}/quiz-detail/${id}`);
  }

  let jsonLd = null;
  let quizData = null;

  try {
    const response = await apiFetch(`/documents/${id}/public`, {
      locale: normalizedLocale,
    });

    if (response.ok) {
      const data: GetPublicSingleDocumentResponse = await response.json();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
      quizData = data;
      const localized = localizedMetadata(normalizedLocale, data);
      const jsonLdDescription =
        normalizedLocale === "en"
          ? `${data.category} - ${data.totalQuizCount} questions`
          : `${data.category} - ${data.totalQuizCount}개의 문제`;

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${baseUrl}/${normalizedLocale}/quiz-detail/${id}`,
        name: data.name,
        description: jsonLdDescription,
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
        url: `${baseUrl}/${normalizedLocale}/quiz-detail/${id}`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/${normalizedLocale}/quiz-detail/${id}`,
        },
        image: {
          "@type": "ImageObject",
          url: `${baseUrl}${ogImagePath(normalizedLocale)}`,
          width: 1200,
          height: 630,
        },
        keywords: localized.keywords,
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
        inLanguage: normalizedLocale === "en" ? "en-US" : "ko-KR",
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch data for JSON-LD:", error);
  }

  return (
    <html lang={normalizedLocale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {(() => {
          const localized = localizedMetadata(normalizedLocale, quizData ?? undefined);

          return (
            <>
              <title>{localized.title}</title>
              <meta name="description" content={localized.description} />
            </>
          );
        })()}
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
          href={`${process.env.NEXT_PUBLIC_BASE_URL}/${normalizedLocale}/quiz-detail/${id}`}
        />
      </head>
      <body>
        <header>
          <nav>
            <h1>{text.siteTitle}</h1>
            <p>{text.siteTagline}</p>
          </nav>
        </header>

        <main>
          {quizData ? (
            <article>
              <header>
                <h1>
                  {quizData.emoji} {quizData.name}
                </h1>
                <div>
                  <span>
                    {text.categoryLabel} {quizData.category}
                  </span>
                  <span>
                    {text.authorLabel} {quizData.creator}
                  </span>
                  <span>{text.totalCountLabel(quizData.totalQuizCount)}</span>
                </div>
              </header>

              <section>
                <h2>{text.quizInfoTitle}</h2>
                <ul>
                  <li>
                    {text.tryCountLabel} {quizData.tryCount}
                  </li>
                  <li>
                    {text.bookmarkLabel} {quizData.bookmarkCount}
                  </li>
                  <li>
                    {text.createdAtLabel}{" "}
                    {new Date(quizData.createdAt).toLocaleDateString(
                      normalizedLocale === "en" ? "en-US" : "ko-KR"
                    )}
                  </li>
                </ul>
              </section>

              {quizData.quizzes && quizData.quizzes.length > 0 && (
                <section>
                  <h2>{text.quizListTitle}</h2>
                  <p>
                    {text.quizListSummary(
                      quizData.quizzes.length,
                      quizData.category
                    )}
                  </p>
                  <div>
                    {quizData.quizzes.map((quiz, index) => (
                      <article key={quiz.id}>
                        <header>
                          <h3>{text.questionLabel(index + 1)}</h3>
                          <span>
                            {text.quizTypeLabel}{" "}
                            {quiz.quizType === "MULTIPLE_CHOICE"
                              ? text.typeMultiple
                              : text.typeMixUp}
                          </span>
                        </header>
                        <div>
                          <h4>{text.questionTitle}</h4>
                          <p>{quiz.question}</p>

                          {quiz.options && quiz.options.length > 0 && (
                            <div>
                              <h5>{text.optionsTitle}</h5>
                              <ul>
                                {quiz.options.map((option, optionIndex) => (
                                  <li key={optionIndex}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <h5>{text.learningPointTitle}</h5>
                            <p>
                              {text.learningPointBody(quizData.category)}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div>
                    <h3>{text.analysisTitle}</h3>
                    <p>
                      {text.analysisBody(
                        quizData.quizzes.filter(
                          (q) => q.quizType === "MULTIPLE_CHOICE"
                        ).length,
                        quizData.quizzes.filter((q) => q.quizType === "MIX_UP")
                          .length
                      )}
                    </p>
                    <p>
                      {text.keywordsLabel}{" "}
                      {Array.from(
                        new Set(
                          quizData.quizzes.flatMap((q) =>
                            q.question
                              .split(" ")
                              .filter((word) => word.length > 2)
                          )
                        )
                      )
                        .slice(0, 10)
                        .join(", ")}
                    </p>
                  </div>
                </section>
              )}

              <section>
                <h2>{text.learnMoreTitle}</h2>
                <p>{text.learnMoreBody}</p>
                <p>{text.learnMoreBody2}</p>
              </section>
            </article>
          ) : (
            <article>
              <h1>{text.fallbackTitle}</h1>
              <p>{text.fallbackBody1}</p>
              <p>{text.fallbackBody2}</p>
            </article>
          )}
        </main>

        <footer>
          <p>{text.footerLine1}</p>
          <p>{text.footerLine2}</p>
        </footer>
      </body>
    </html>
  );
}

import { getTossShareLink, share } from '@apps-in-toss/framework';

const OG_IMAGE_URL = 'https://i.imgur.com/IuK1vAi.jpg'; // TODO: 실제 서비스 이미지로 교체 필요

/**
 * 타로 결과를 토스 공유 API를 통해 공유합니다.
 * @param contentTitle - 컨텐츠 제목 (예: "연애 타로", "재물운 분석")
 * @param resultSummary - 결과 요약 (카드명 또는 짧은 설명)
 */
export async function shareTarotResult(contentTitle: string, resultSummary: string): Promise<void> {
  try {
    const tossLink = await getTossShareLink('intoss://ai-today-one-card/home', OG_IMAGE_URL);
    await share({
      message: `[아우라 타로] 솜이가 읽어준 ${contentTitle} 결과 🔮\n\n${resultSummary}\n\n아우라 타로 앱에서 내 운세 결과 전체를 확인해 보세요 ✨\n${tossLink}`,
    });
  } catch (error) {
    console.error('Share error:', error);
  }
}

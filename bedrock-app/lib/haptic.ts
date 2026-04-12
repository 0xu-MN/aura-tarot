import { generateHapticFeedback, HapticFeedbackType } from '@apps-in-toss/framework';

export const Haptic = {
  /** 가벼운 터치/선택 피드백 */
  selection: () => generateHapticFeedback({ type: 'tickWeak' }),
  
  /** 중간 정도의 타격감 (카드 뽑기 등) */
  impact: () => generateHapticFeedback({ type: 'basicMedium' }),
  
  /** 성공 피드백 (등록 완료, 대화 시작 등) */
  success: () => generateHapticFeedback({ type: 'success' }),
  
  /** 오류 피드백 */
  error: () => generateHapticFeedback({ type: 'error' }),
  
  /** 축하 효과 (결과 공개 등) */
  celebrate: () => generateHapticFeedback({ type: 'confetti' }),
  
  /** 경고성 좌우 흔들기 */
  warn: () => generateHapticFeedback({ type: 'wiggle' }),
};

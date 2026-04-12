import { createRoute, useBackEvent } from '@granite-js/react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { IAP } from '@apps-in-toss/framework';
import { useAuthContext } from '../context/AuthContext';
import { getUserTokens, grantDailyTokensIfNeeded, DAILY_FREE_TOKENS } from '../lib/storage';
import { PaymentInductionModal } from '../components/PaymentInductionModal';
import { ContentDropdown, CONTENT_CARDS } from '../components/home/ContentDropdown';
import { CarouselDots } from '../components/home/CarouselDots';
import { ChatView } from '../components/home/ChatView';
import { HistoryView } from '../components/home/HistoryView';
import { BannerAd } from '../components/BannerAd';

// ── 카드 컴포넌트 (Phase 2에서 순차 구현)
import { DailyCard }         from '../components/home/cards/DailyCard';
import { ChatCard }          from '../components/home/cards/ChatCard';
import { LoveCard }          from '../components/home/cards/LoveCard';
import { MoneyCard }         from '../components/home/cards/MoneyCard';
import { WorkCard }          from '../components/home/cards/WorkCard';
import { StudentCard }       from '../components/home/cards/StudentCard';
import { WeeklyCard }        from '../components/home/cards/WeeklyCard';
import { MonthlyCard }       from '../components/home/cards/MonthlyCard';
import { HoroscopeCard }     from '../components/home/cards/HoroscopeCard';
import { CompatibilityCard } from '../components/home/cards/CompatibilityCard';
import { ReunionCard }       from '../components/home/cards/ReunionCard';
import { NewYearCard }       from '../components/home/cards/NewYearCard';
import { YearlyCard }        from '../components/home/cards/YearlyCard';

export const Route = createRoute('/home', { component: HomePage });

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85; 
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

const BG = '#0a0a0b';
const GOLD = '#DAA520';
const HEADER_HEIGHT = Platform.OS === 'ios' ? 104 : 98; // 2열 구조 복구
const DOTS_HEIGHT = 44; // 인디케이터 여백 확보
const BANNER_HEIGHT = 0; 

/** 각 인덱스에 해당하는 카드 컴포넌트를 렌더링 */
const CARD_COMPONENTS: React.FC<any>[] = [
  DailyCard,
  LoveCard,
  MoneyCard,
  WorkCard,
  StudentCard,
  WeeklyCard,
  MonthlyCard,
  HoroscopeCard,
  CompatibilityCard,
  ReunionCard,
  YearlyCard,
  ChatCard,
];

import { LoungeView } from '../components/lounge/LoungeView';
import { ProfileManageModal } from '../components/lounge/ProfileManageModal';

type AppMode = 'tarot' | 'chat' | 'history' | 'lounge';

export function HomePage() {
  const navigation = Route.useNavigation();
  const backEvent = useBackEvent();
  const { user, isLoggedIn } = useAuthContext();

  const [mode, setMode] = useState<AppMode>('tarot');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [showTokenGrantPopup, setShowTokenGrantPopup] = useState(false);
  const [grantedTokens, setGrantedTokens] = useState(0);
  const [showDiamondModal, setShowDiamondModal] = useState(false);
  const [chatConsultation, setChatConsultation] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showProfileManage, setShowProfileManage] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const [cardHeight, setCardHeight] = useState(
    SCREEN_HEIGHT - HEADER_HEIGHT - DOTS_HEIGHT - 60 // 하단 하단바 및 여백 60px 추가 확보
  );
  const onCarouselAreaLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height - DOTS_HEIGHT - BANNER_HEIGHT;
    if (h > 100) setCardHeight(h);
  }, []);

  // ── 뒤로가기 제어
  useEffect(() => {
    const handleBack = () => {
      if (mode === 'chat' || mode === 'history') {
        setMode('tarot');
        setChatConsultation(null);
      } else {
        navigation.goBack();
      }
    };
    backEvent.addEventListener(handleBack);
    return () => backEvent.removeEventListener(handleBack);
  }, [backEvent, mode, navigation]);

  // ── 초기화 (IAP 복구 + 일일 토큰)
  useEffect(() => {
    const restorePendingOrders = async () => {
      if (!IAP || typeof IAP.getPendingOrders !== 'function') return;
      try {
        const response = await IAP.getPendingOrders();
        if (response?.orders && response.orders.length > 0) {
          for (const order of response.orders) {
            if (order?.orderId) {
              await IAP.completeProductGrant({ params: { orderId: order.orderId } });
            }
          }
        }
      } catch (e) { console.warn('IAP Restore Failed:', e); }
    };
    restorePendingOrders();

    (async () => {
      const { granted, newTotal } = await grantDailyTokensIfNeeded();
      setTokenBalance(newTotal);
      if (granted) {
        setGrantedTokens(DAILY_FREE_TOKENS);
        setShowTokenGrantPopup(true);
      }
    })();
  }, []);

  // ── 포커스 시마다 토큰 잔액 갱신
  useEffect(() => {
    const unsubscribe = (navigation as any).addListener('focus', () => {
      getUserTokens().then(setTokenBalance);
    });
    return unsubscribe;
  }, [navigation]);

  // ── 드롭다운에서 카드 선택 시 해당 인덱스로 점프
  const handleDropdownSelect = useCallback((index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  // ── 날짜 표시용 텍스트 생성
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayStr = DAYS[now.getDay()] ?? '';

  // ── 카드 렌더러
  const renderCard = useCallback(({ index }: { item: typeof CONTENT_CARDS[number]; index: number }) => {
    const CardComponent = CARD_COMPONENTS[index];
    if (!CardComponent) return null;
    return (
      <View style={[s.cardWrapper, { height: cardHeight }]}>
        <CardComponent
          onOpenChat={(consultation: any) => {
            setChatConsultation(consultation);
            setMode('chat');
          }}
          onTokenChange={() => getUserTokens().then(setTokenBalance)}
          tokenBalance={tokenBalance}
        />
      </View>
    );
  }, [cardHeight]);

  return (
    <View style={s.container}>
      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}
      <View style={s.header}>
        {/* 상단 1열: 날짜 & 다이아몬드 (가로 1열 슬림 구성) */}
        <View style={s.headerTopRow}>
          <View style={s.dateContainerSlim}>
            <Txt style={s.dateMain}>{month}.{String(day).padStart(2, '0')}</Txt>
            <Txt style={s.dateDay}>{dayStr}</Txt>
            <Txt style={s.yearText}>{year}</Txt>
          </View>
          <View style={{ flex: 1 }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {mode === 'tarot' && (
              <ContentDropdown onSelect={handleDropdownSelect} currentIndex={currentIndex} />
            )}
            {mode === 'lounge' && (
              <>
                <TouchableOpacity style={s.manageBtn} onPress={() => setShowProfileManage(true)} activeOpacity={0.7}>
                  <Txt style={s.manageEmoji}>👤</Txt>
                </TouchableOpacity>
                <TouchableOpacity style={[s.manageBtn, { backgroundColor: 'rgba(218,165,32,0.12)', borderColor: 'rgba(218,165,32,0.25)' }]} onPress={() => setShowCompose(true)} activeOpacity={0.7}>
                  <Txt style={s.manageEmoji}>✨</Txt>
                </TouchableOpacity>
              </>
            )}
            <PressableEffect
              onPress={() => setShowDiamondModal(true)}
              style={s.diamondBadge}
            >
              <Txt style={s.diamondText}>💎 {tokenBalance}</Txt>
            </PressableEffect>
          </View>
        </View>

        {/* 상단 2열: 네비게이션 탭 (원위치 복구) */}
        <View style={s.navTabsContainer}>
          <PressableEffect 
            onPress={() => setMode('tarot')} 
            style={[s.navTab, mode === 'tarot' && s.navTabActive]}
          >
            <Txt style={[s.navTabText, mode === 'tarot' && s.navTabTextActive]}>TAROT</Txt>
          </PressableEffect>

          <PressableEffect 
            onPress={() => setMode('lounge')} 
            style={[s.navTab, mode === 'lounge' && s.navTabActive]}
          >
            <Txt style={[s.navTabText, mode === 'lounge' && s.navTabActive]}>LOUNGE</Txt>
          </PressableEffect>
          
          <PressableEffect 
            onPress={() => setMode('history')} 
            style={[s.navTab, mode === 'history' && s.navTabActive]}
          >
            <Txt style={[s.navTabText, mode === 'history' && s.navTabTextActive]}>HISTORY</Txt>
          </PressableEffect>
        </View>
      </View>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT (타로 | 챗봇 | 기록)
      ═══════════════════════════════════════════ */}
      {mode === 'history' ? (
        <HistoryView />
      ) : mode === 'chat' ? (
        <ChatView consultation={chatConsultation} />
      ) : mode === 'lounge' ? (
        <LoungeView 
          onNavigateChat={(consultation) => {
            setChatConsultation(consultation);
            setMode('chat');
          }} 
          showCompose={showCompose}
          onCloseCompose={() => setShowCompose(false)}
        />
      ) : (
        <View style={s.carouselArea} onLayout={onCarouselAreaLayout}>
          <FlatList
            ref={flatListRef}
            data={CONTENT_CARDS as unknown as any[]}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              s.flatListContent,
              { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN }
            ]}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
              setCurrentIndex(Math.max(0, Math.min(newIndex, CONTENT_CARDS.length - 1)));
            }}
            getItemLayout={(_, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index,
            })}
          />
          <CarouselDots total={CONTENT_CARDS.length} current={currentIndex} />
          <View style={s.bannerBox}>
            {/* 타로 홈에서는 배너 숨김 (공간 확보) */}
            {mode === 'lounge' && <BannerAd />}
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════ */}
      {/* 일일 토큰 팝업 */}
      <ProfileManageModal
        visible={showProfileManage}
        onClose={() => setShowProfileManage(false)}
      />

      {showTokenGrantPopup && (
        <View style={s.tokenPopupOverlay}>
          <View style={s.tokenPopup}>
            <Txt style={s.tokenPopupEmoji}>🎁</Txt>
            <Txt style={s.tokenPopupTitle}>오늘의 다이아 {grantedTokens}개가{`\n`}지급되었습니다!</Txt>
            <Txt style={s.tokenPopupDesc}>
              매일 접속하면 다이아 {DAILY_FREE_TOKENS}개를 무료로 드려요.{`\n`}남은 다이아는 다음 날로 이월됩니다. 💎
            </Txt>
            <PressableEffect style={s.tokenPopupBtn} onPress={() => setShowTokenGrantPopup(false)}>
              <Txt style={s.tokenPopupBtnText}>확인</Txt>
            </PressableEffect>
          </View>
        </View>
      )}

      {/* 다이아 충전 모달 */}
      <PaymentInductionModal
        visible={showDiamondModal}
        onClose={() => { setShowDiamondModal(false); getUserTokens().then(setTokenBalance); }}
        contentName="다이아 충전"
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // ── 헤더 (다중 행 컨테이너로 변경)
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#0a0a0b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    zIndex: 1000,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  dateContainerSlim: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  dateMain: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: GOLD,
    marginLeft: 2,
  },
  yearText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.2)',
    marginLeft: 4,
  },
  diamondBadge: {
    backgroundColor: 'rgba(218,165,32,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(218,165,32,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  diamondText: { fontSize: 13, fontWeight: '800', color: GOLD },
  navTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#16161a',
    borderRadius: 12,
    padding: 3,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  navTabActive: {
    backgroundColor: '#26262d',
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  manageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageEmoji: { fontSize: 14 },

  // ── 메인 영역
  carouselArea: {
    flex: 1,
    alignItems: 'center',
  },
  flatListContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 24,
    backgroundColor: '#14141a',
    overflow: 'hidden',
    // 그림자 제거 또는 매우 은은하게
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bannerBox: {
    height: BANNER_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  // ── 일일 토큰 팝업
  tokenPopupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 30,
  },
  tokenPopup: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(218,165,32,0.3)',
  },
  tokenPopupEmoji: { fontSize: 52, lineHeight: 64 },
  tokenPopupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: GOLD,
    textAlign: 'center',
    lineHeight: 30,
  },
  tokenPopupDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 19,
  },
  tokenPopupBtn: {
    backgroundColor: GOLD,
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 8,
  },
  tokenPopupBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
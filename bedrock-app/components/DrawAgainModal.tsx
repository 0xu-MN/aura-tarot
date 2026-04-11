import { GlobalAlert } from "../components/AlertProvider";
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';
import { IAP, loadFullScreenAd, showFullScreenAd, contactsViral } from '@apps-in-toss/framework';
import { getUserTokens, addUserTokens, consumeMultipleTokens, addAndConsumeTokens } from '../lib/storage';

const REWARD_AD_ID = 'ait.v2.live.958d0988987d436a';
const REWARD_TOKEN_AMOUNT = 2;

// ── 실제 인앱결제 상품 ID & 정보 ──────────────────────────────
const TOKEN_PRODUCTS: {
    sku: string;
    amount: number;
    price: string;
    emoji: string;
    desc: string;
    popular?: boolean;
}[] = [
    {
        sku: 'ait.0000017559.2d210f74.e2c713be03.5139891258',
        amount: 9,
        price: '1,980',
        emoji: '✨',
        desc: '약 9회 사용 가능',
    },
    {
        sku: 'ait.0000017559.74a6817e.8ac1c4770b.5139963985',
        amount: 25,
        price: '3,850',
        emoji: '🔮',
        desc: '🎁 25% 보너스 인기',
        popular: true,
    },
];

interface DrawAgainModalProps {
    visible: boolean;
    onClose: () => void;
    onDrawAgain: () => void;
    onGoBack?: () => void;
    accentColor?: string;
    tokenCost?: number;       // 이 콘텐츠의 토큰 차감 비용 (기본 1)
    contentName?: string;     // 콘텐츠 이름 표시용
    chargeOnly?: boolean;     // true면 충전만 (차감 없음, 홈에서 사용)
}

export const DrawAgainModal: React.FC<DrawAgainModalProps> = ({
    visible,
    onClose,
    onDrawAgain,
    onGoBack,
    accentColor = '#DAA520',
    tokenCost = 1,
    contentName = '타로',
    chargeOnly = false,
}) => {
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [isAdDisplaying, setIsAdDisplaying] = useState(false);
    const [tokens, setTokens] = useState<number>(0);
    const [isPurchasing, setIsPurchasing] = useState(false);

    React.useEffect(() => {
        if (visible) {
            getUserTokens().then(setTokens);
        }
    }, [visible]);

    const handleShareReward = () => {
        try {
            const cleanup = contactsViral({
                options: { moduleId: 'cb96c26a-9857-4907-8328-24e1918278e7' },
                onEvent: async (event) => {
                    if (event.type === 'sendViral') {
                        const amount = event.data.rewardAmount;
                        const newTokens = await addUserTokens(amount);
                        setTokens(newTokens);
                        GlobalAlert.alert?.('🎁 다이아 지급!', `친구 초대 완료! 다이아 ${amount}개가 지급되었습니다.\n현재 보유: ${newTokens}개`);
                    } else if (event.type === 'close') {
                        getUserTokens().then(setTokens);
                        cleanup();
                    }
                },
                onError: (error) => {
                    console.error('Share reward error:', error);
                    cleanup?.();
                    GlobalAlert.alert?.('알림', '공유 중 오류가 발생했습니다.');
                },
            });
        } catch (error) {
            console.error('contactsViral fail:', error);
        }
    };

    const handleRewardedAd = () => {
        if (isAdLoading) return;
        setIsAdLoading(true);

        loadFullScreenAd({
            options: { adGroupId: REWARD_AD_ID },
            onEvent: (event) => {
                if (event.type === 'loaded') {
                    setIsAdLoading(false);
                    setIsAdDisplaying(true);
                    setTimeout(() => {
                        showFullScreenAd({
                            options: { adGroupId: REWARD_AD_ID },
                            onEvent: async (showEvent) => {
                                if (showEvent.type === 'userEarnedReward') {
                                    setIsAdDisplaying(false);
                                    if (chargeOnly) {
                                        // 충전 전용: 추가만
                                        const newTokens = await addUserTokens(REWARD_TOKEN_AMOUNT);
                                        setTokens(newTokens);
                                        GlobalAlert.alert?.('🎁 다이아 지급!', `광고 시청 완료! 다이아 ${REWARD_TOKEN_AMOUNT}개가 지급되었습니다.\n현재 보유: ${newTokens}개`);
                                    } else {
                                        // 콘텐츠 잠금 해제: 원자적으로 추가+차감
                                        const { success, remaining } = await addAndConsumeTokens(REWARD_TOKEN_AMOUNT, tokenCost);
                                        setTokens(remaining);
                                        if (success) {
                                            GlobalAlert.alert?.('🎁 다이아 지급!', `광고 시청 완료! 다이아가 지급되고 자동 차감되었습니다.\n남은 다이아: ${remaining}개`);
                                            onDrawAgain();
                                        } else {
                                            GlobalAlert.alert?.('🎁 다이아 지급!', `광고 시청 완료! 다이아 ${REWARD_TOKEN_AMOUNT}개가 지급되었습니다.\n현재 보유: ${remaining}개\n추가 다이아가 필요합니다.`);
                                        }
                                    }
                                } else if (showEvent.type === 'dismissed') {
                                    setIsAdDisplaying(false);
                                } else if (showEvent.type === 'failedToShow') {
                                    setIsAdDisplaying(false);
                                    Alert.alert('알림', '광고 표시를 실패했습니다. 다시 시도해 주세요.');
                                }
                            },
                            onError: () => {
                                setIsAdDisplaying(false);
                                Alert.alert('알림', '광고 표시 중 오류가 발생했습니다.');
                            },
                        });
                    }, 100);
                }
            },
            onError: () => {
                setIsAdLoading(false);
                Alert.alert('알림', '광고를 불러올 수 없습니다. 다시 시도해 주세요.');
            }
        });
    };

    const handleUseToken = async () => {
        const success = await consumeMultipleTokens(tokenCost);
        if (success) {
            onDrawAgain();
        } else {
            GlobalAlert.alert?.('다이아 부족', `이 콘텐츠는 다이아 ${tokenCost}개가 필요해요.\n현재 보유: ${tokens}개`);
        }
    };

    const handleIAPPurchase = async (sku: string, amount: number) => {
        if (!IAP || typeof IAP.createOneTimePurchaseOrder !== 'function') {
            // IAP 미지원 환경 (개발 빌드 등) — 가상 지급
            GlobalAlert.alert?.('테스트 모드', `가상 결제: 다이아 ${amount}개 지급`);
            const newTokens = await addUserTokens(amount);
            setTokens(newTokens);
            return;
        }

        setIsPurchasing(true);
        try {
            await IAP.createOneTimePurchaseOrder({
                options: {
                    sku,
                    processProductGrant: async () => {
                        // 결제 승인 후 토큰 지급
                        const newTokens = await addUserTokens(amount);
                        setTokens(newTokens);
                        return true;
                    },
                },
                onEvent: async (event) => {
                    if (event.type === 'success') {
                        setIsPurchasing(false);
                        const current = await getUserTokens();
                        GlobalAlert.alert?.('충전 완료 🎉', `다이아 ${amount}개가 충전되었습니다!\n현재 보유: ${current}개`);
                    }
                },
                onError: (error: any) => {
                    setIsPurchasing(false);
                    if (error?.code !== 'USER_CANCELED') {
                        GlobalAlert.alert?.('결제 실패', '결제 중 오류가 발생했습니다. 다시 시도해 주세요.');
                    }
                },
            });
        } catch (e: any) {
            setIsPurchasing(false);
            GlobalAlert.alert?.('오류', e.message || '결제 진행 중 오류가 발생했습니다.');
        }
    };

    if (!visible || isAdDisplaying) return null;

    const hasEnoughTokens = tokens >= tokenCost;

    return (
        <View style={s.overlay}>
            <View style={s.backdrop} />
            <View style={s.sheetWrapper}>
                <View style={s.sheet}>
                    <ScrollView bounces={false} style={{ width: '100%', maxHeight: 600 }} contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
                        {/* 헤더 */}
                        <View style={s.header}>
                            <Txt style={s.title}>🔮 {contentName}</Txt>
                            {!chargeOnly && (
                                <View style={s.costRow}>
                                    <Txt style={s.costLabel}>필요 다이아</Txt>
                                    <View style={[s.costBadge, { borderColor: accentColor }]}>
                                        <Txt style={[s.costText, { color: accentColor }]}>💎 {tokenCost}개</Txt>
                                    </View>
                                </View>
                            )}
                            <Txt style={s.balanceText}>현재 보유 다이아: {tokens}개</Txt>
                        </View>

                        <View style={s.divider} />

                        {/* 토큰으로 결과 확인 (chargeOnly일 때는 숨김) */}
                        {!chargeOnly && (
                            <PressableEffect
                                style={[
                                    s.primaryBtn,
                                    hasEnoughTokens
                                        ? { backgroundColor: accentColor }
                                        : { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }
                                ]}
                                onPress={hasEnoughTokens ? handleUseToken : undefined}
                                disabled={!hasEnoughTokens}
                            >
                                <Txt style={[s.primaryBtnText, !hasEnoughTokens && { color: '#555' }]}>
                                    {hasEnoughTokens
                                        ? `✨ 다이아 ${tokenCost}개로 결과 확인`
                                        : `💎 다이아가 부족해요 (${tokens}/${tokenCost}개)`}
                                </Txt>
                            </PressableEffect>
                        )}

                        {/* 구분선 */}
                        <View style={s.orRow}>
                            <View style={s.orLine} />
                            <Txt style={s.orText}>다이아 충전하기</Txt>
                            <View style={s.orLine} />
                        </View>

                        {/* 다이아 번들 — 9개(1,980원) → 25개(3,850원) */}
                        {TOKEN_PRODUCTS.map((product) => (
                            <PressableEffect
                                key={product.sku}
                                style={[s.bundleBtn, product.popular && { borderColor: accentColor }]}
                                onPress={() => handleIAPPurchase(product.sku, product.amount)}
                                disabled={isPurchasing}
                            >
                                <View style={s.bundleBtnLeft}>
                                    <Txt style={s.bundleEmoji}>{product.emoji}</Txt>
                                    <View>
                                        <Txt style={s.bundleName}>다이아 {product.amount}개</Txt>
                                        <Txt style={[s.bundleDesc, product.popular && { color: accentColor }]}>{product.desc}</Txt>
                                    </View>
                                </View>
                                <Txt style={[s.bundlePrice, product.popular && { color: accentColor }]}>{product.price}원</Txt>
                            </PressableEffect>
                        ))}

                        {/* 광고로 무료 다이아 받기 */}
                        <PressableEffect
                            style={[s.adBtn, { marginTop: 4 }]}
                            onPress={handleRewardedAd}
                            disabled={isAdLoading || isPurchasing}
                        >
                            <Txt style={s.adBtnIcon}>📺</Txt>
                            <View style={{ flex: 1 }}>
                                <Txt style={[s.adBtnTitle, { color: '#fff' }]}>무료 다이아 {REWARD_TOKEN_AMOUNT}개 받기</Txt>
                                <Txt style={s.adBtnDesc}>광고 30초 시청하고 무료로 받기</Txt>
                            </View>
                            {isAdLoading && <ActivityIndicator size="small" color={accentColor} />}
                        </PressableEffect>

                        {/* 공유로 무료 다이아 받기 */}
                        <PressableEffect
                            style={[s.adBtn, { marginTop: 8 }]}
                            onPress={handleShareReward}
                            disabled={isPurchasing}
                        >
                            <Txt style={s.adBtnIcon}>💌</Txt>
                            <View style={{ flex: 1 }}>
                                <Txt style={[s.adBtnTitle, { color: '#fff' }]}>친구 초대하고 다이아 받기</Txt>
                                <Txt style={s.adBtnDesc}>공유 완료마다 다이아 2개 받기</Txt>
                            </View>
                        </PressableEffect>

                        {/* 하단 버튼 */}
                        <PressableEffect style={s.cancelBtn} onPress={onClose}>
                            <Txt style={s.cancelText}>나중에 할게요</Txt>
                        </PressableEffect>

                        {onGoBack && (
                            <PressableEffect style={s.goBackBtn} onPress={() => { onClose(); onGoBack?.(); }}>
                                <Txt style={s.goBackText}>그냥 나갈게요</Txt>
                            </PressableEffect>
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 20, zIndex: 9999,
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
    sheetWrapper: { width: '100%', alignItems: 'center' },
    sheet: {
        width: '100%', backgroundColor: '#16161a',
        borderRadius: 24, padding: 20, alignItems: 'stretch',
        borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)',
    },

    // 헤더
    header: { alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 10 },
    costRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    costLabel: { fontSize: 13, color: '#9ca3af' },
    costBadge: {
        borderWidth: 1, borderRadius: 14,
        paddingHorizontal: 10, paddingVertical: 3,
    },
    costText: { fontSize: 13, fontWeight: '700' },
    balanceText: { fontSize: 12, color: '#6b7280' },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },

    // 주 버튼 (토큰 사용)
    primaryBtn: {
        borderRadius: 16, paddingVertical: 16,
        alignItems: 'center', marginBottom: 20,
    },
    primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },

    // or 구분선
    orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    orText: { fontSize: 12, color: '#6b7280' },

    // 번들 버튼
    bundleBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        padding: 14, marginBottom: 10, justifyContent: 'space-between',
    },
    bundleBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bundleEmoji: { fontSize: 26 },
    bundleName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
    bundleDesc: { fontSize: 12, color: '#9ca3af' },
    bundlePrice: { fontSize: 15, fontWeight: '800', color: '#fff' },

    // 광고 버튼
    adBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        padding: 14, marginTop: 4, marginBottom: 4, gap: 12,
    },
    adBtnIcon: { fontSize: 22 },
    adBtnTitle: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 2 },
    adBtnDesc: { fontSize: 11, color: '#6b7280' },

    // 하단 텍스트 버튼
    cancelBtn: { paddingVertical: 14, alignItems: 'center' },
    cancelText: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
    goBackBtn: { paddingVertical: 6, alignItems: 'center' },
    goBackText: { fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecorationLine: 'underline' },
});

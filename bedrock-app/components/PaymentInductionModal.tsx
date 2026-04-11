import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Platform, ActivityIndicator, Alert } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { IAP, loadFullScreenAd, showFullScreenAd, contactsViral } from '@apps-in-toss/framework';
import { getUserTokens, addUserTokens } from '../lib/storage';

const GOLD = '#DAA520';
const REWARD_AD_ID = 'ait.v2.live.958d0988987d436a';
const REWARD_TOKEN_AMOUNT = 2;

// ── 인앱결제 상품 정보 ──
const TOKEN_PRODUCTS = [
    {
        sku: 'ait.0000017559.2d210f74.e2c713be03.5139891258',
        amount: 9,
        price: '1,980원',
        emoji: '✨',
    },
    {
        sku: 'ait.0000017559.74a6817e.8ac1c4770b.5139963985',
        amount: 25,
        price: '3,850원',
        emoji: '🔮',
        popular: true,
    },
];

interface PaymentInductionModalProps {
    visible: boolean;
    onClose: () => void;
    contentName?: string;
}

export const PaymentInductionModal: React.FC<PaymentInductionModalProps> = ({
    visible,
    onClose,
    contentName = '콘텐츠'
}) => {
    const [tokens, setTokens] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'main' | 'charge'>('main');
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setViewMode('main');
            getUserTokens().then(setTokens);
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const handleIAPPurchase = async (sku: string, amount: number) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            if (!IAP || typeof IAP.createOneTimePurchaseOrder !== 'function') {
                // 테스트용
                const next = await addUserTokens(amount);
                setTokens(next);
                Alert.alert('테스트 모드', `다이아 ${amount}개가 충전되었습니다.`);
                setIsLoading(false);
                return;
            }

            await IAP.createOneTimePurchaseOrder({
                options: {
                    sku,
                    processProductGrant: async () => {
                        await addUserTokens(amount);
                        return true;
                    },
                },
                onEvent: async (event) => {
                    if (event.type === 'success') {
                        const next = await getUserTokens();
                        setTokens(next);
                        setIsLoading(false);
                        Alert.alert('충전 완료', `반가워요! 다이아가 충전되었습니다.`);
                    }
                },
                onError: () => setIsLoading(false),
            });
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const handleAd = () => {
        if (isLoading) return;
        setIsLoading(true);
        loadFullScreenAd({
            options: { adGroupId: REWARD_AD_ID },
            onEvent: (e) => {
                if (e.type === 'loaded') {
                    showFullScreenAd({
                        options: { adGroupId: REWARD_AD_ID },
                        onEvent: async (se) => {
                            if (se.type === 'userEarnedReward') {
                                const next = await addUserTokens(REWARD_TOKEN_AMOUNT);
                                setTokens(next);
                                setIsLoading(false);
                                Alert.alert('보상 지급', `광고 시청 완료! 다이아 ${REWARD_TOKEN_AMOUNT}개가 지급되었습니다.`);
                            } else if (se.type === 'dismissed') {
                                setIsLoading(false);
                            }
                        }
                    });
                }
            },
            onError: () => {
                setIsLoading(false);
                Alert.alert('알림', '광고를 불러올 수 없습니다.');
            }
        });
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
                
                <View style={s.box}>
                    {viewMode === 'main' ? (
                        <View style={s.mainContent}>
                            <View style={s.iconBox}><Txt style={{ fontSize: 40 }}>💎</Txt></View>
                            <Txt style={s.title}>다이아가 부족해요</Txt>
                            <Txt style={s.sub}>
                                {contentName}을(를) 확인하거나 비밀 대화를{'\n'}나누려면 다이아가 필요합니다.
                            </Txt>
                            <Txt style={s.balanceText}>보유 중인 다이아: {tokens}개</Txt>

                            <View style={s.btnRow}>
                                <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                                    <Txt style={s.cancelText}>다음에요</Txt>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.confirmBtn} onPress={() => setViewMode('charge')}>
                                    <Txt style={s.confirmText}>충전하러 가기</Txt>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={s.chargeContent}>
                            <View style={s.chargeHeader}>
                                <Txt style={s.chargeTitle}>다이아 충전소</Txt>
                                <TouchableOpacity onPress={() => setViewMode('main')}>
                                    <Txt style={s.backText}>뒤로</Txt>
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
                                <View style={s.bundleList}>
                                    {TOKEN_PRODUCTS.map(p => (
                                        <TouchableOpacity 
                                            key={p.sku} 
                                            style={[s.bundleItem, p.popular && s.bundleItemActive]} 
                                            onPress={() => handleIAPPurchase(p.sku, p.amount)}
                                        >
                                            <Txt style={s.bundleEmoji}>{p.emoji}</Txt>
                                            <View style={{ flex: 1 }}>
                                                <Txt style={s.bundleName}>다이아 {p.amount}개</Txt>
                                                {p.popular && <Txt style={s.popularTag}>BEST 인기 상품</Txt>}
                                            </View>
                                            <Txt style={s.bundlePrice}>{p.price}</Txt>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={s.freeList}>
                                    <TouchableOpacity style={s.freeItem} onPress={handleAd}>
                                        <Txt style={s.freeEmoji}>📺</Txt>
                                        <View style={{ flex: 1 }}>
                                            <Txt style={s.freeName}>동영상 광고 시청</Txt>
                                            <Txt style={s.freeSub}>다이아 {REWARD_TOKEN_AMOUNT}개 지급</Txt>
                                        </View>
                                        <Txt style={s.freeAction}>받기</Txt>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={s.freeItem} onPress={() => contactsViral({ options: { moduleId: 'cb96c26a-9857-4907-8328-24e1918278e7' } })}>
                                        <Txt style={s.freeEmoji}>💌</Txt>
                                        <View style={{ flex: 1 }}>
                                            <Txt style={s.freeName}>친구 초대하기</Txt>
                                            <Txt style={s.freeSub}>공유 완료 시 다이아 지급</Txt>
                                        </View>
                                        <Txt style={s.freeAction}>초대</Txt>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>

                            {isLoading && (
                                <View style={s.loadingOverlay}>
                                    <ActivityIndicator color={GOLD} size="large" />
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </Animated.View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    box: { width: '100%', backgroundColor: '#1e1e24', borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    
    // Main View
    mainContent: { padding: 28, alignItems: 'center' },
    iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(218,165,32,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    title: { fontSize: 22, color: '#fff', fontWeight: '800', marginBottom: 10 },
    sub: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24, marginBottom: 16 },
    balanceText: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 },
    btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
    cancelText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '700' },
    confirmBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
    confirmText: { color: '#000', fontSize: 16, fontWeight: '800' },

    // Charge View
    chargeContent: { padding: 24 },
    chargeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    chargeTitle: { fontSize: 18, color: '#fff', fontWeight: '800' },
    backText: { fontSize: 14, color: GOLD, fontWeight: '700' },
    bundleList: { gap: 12, marginBottom: 20 },
    bundleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    bundleItemActive: { borderColor: GOLD, backgroundColor: 'rgba(218,165,32,0.05)' },
    bundleEmoji: { fontSize: 28 },
    bundleName: { fontSize: 16, color: '#fff', fontWeight: '700', marginBottom: 2 },
    popularTag: { fontSize: 10, color: GOLD, fontWeight: '800' },
    bundlePrice: { fontSize: 16, color: '#fff', fontWeight: '800' },
    freeList: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 20, gap: 16 },
    freeItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    freeEmoji: { fontSize: 22 },
    freeName: { fontSize: 15, color: '#fff', fontWeight: '600', marginBottom: 2 },
    freeSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
    freeAction: { fontSize: 13, color: GOLD, fontWeight: '800', backgroundColor: 'rgba(218,165,32,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderRadius: 28 },
});

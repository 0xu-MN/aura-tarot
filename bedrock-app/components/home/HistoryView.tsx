import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Txt, PressableEffect, BottomInfo } from '@toss/tds-react-native';
import { getReadingHistory, ReadingRecord, getChatRecords, ChatRecord, getLoungePosts, LoungePostRecord, deleteLoungePost, deleteChatRecord } from '../../lib/storage';
import { ASSETS } from '../../lib/assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BG = '#0a0a0b';
const CARD_BG = '#14141a';
const GOLD = '#D4AF37';

type TabType = 'tarot' | 'chat' | 'lounge';

export const HistoryView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tarot');
    
    // Data States
    const [tarotHistory, setTarotHistory] = useState<ReadingRecord[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
    const [loungeHistory, setLoungeHistory] = useState<LoungePostRecord[]>([]);
    
    // Detail States
    const [selectedTarot, setSelectedTarot] = useState<ReadingRecord | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === 'tarot') {
            const data = await getReadingHistory();
            setTarotHistory(data);
        } else if (activeTab === 'chat') {
            const data = await getChatRecords();
            setChatHistory(data);
        } else if (activeTab === 'lounge') {
            const data = await getLoungePosts();
            setLoungeHistory(data);
        }
    };

    const handleDeleteLoungePost = async (id: string) => {
        await deleteLoungePost(id);
        loadData();
    };

    const handleDeleteChatRecord = async (id: string) => {
        await deleteChatRecord(id);
        loadData();
    };

    // --- Detail Views ---
    if (selectedTarot) {
        return (
            <View style={s.container}>
                <View style={s.headerDetail}>
                    <PressableEffect onPress={() => setSelectedTarot(null)} style={s.backBtn}>
                        <Txt style={s.backBtnText}>← 뒤로</Txt>
                    </PressableEffect>
                    <Txt style={s.headerTitleDetail}>별의 기록</Txt>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={s.scroll} contentContainerStyle={s.detailContent}>
                    <View style={s.detailCardContainer}>
                        {selectedTarot.cards?.map((c, i) => (
                            <View key={i} style={s.miniCardFrame}>
                                <Image source={c.card?.image || c.image || ASSETS.tarotBack} style={[s.detailCardImg, c.isReversed && { transform: [{ rotate: '180deg' }] }]} />
                                <Txt style={s.detailCardName}>{c.card?.koreanName || c.name || '카드'}</Txt>
                            </View>
                        ))}
                    </View>

                    <View style={s.readingBox}>
                        <Txt style={s.detailQuestion}>Q. {selectedTarot.question}</Txt>
                        <View style={s.divider} />
                        <Txt style={s.detailInterpretation}>{selectedTarot.interpretation}</Txt>
                    </View>

                    <Txt style={s.detailDate}>
                        {new Date(selectedTarot.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Txt>
                </ScrollView>
                <BottomInfo style={{ backgroundColor: BG }} />
            </View>
        );
    }

    // --- Sub-Tab Renderers ---
    const renderTarotTab = () => {
        if (tarotHistory.length === 0) {
            return (
                <View style={s.emptyState}>
                    <Txt style={s.emptyText}>아직 기록된 메시지가 없어요.</Txt>
                    <Txt style={s.emptySub}>오늘의 운세를 먼저 확인해보세요!</Txt>
                </View>
            );
        }
        return tarotHistory.map((item) => (
            <PressableEffect key={item.id} style={s.historyItem} onPress={() => setSelectedTarot(item)}>
                <View style={s.itemImageWrap}>
                    <Image source={item.cards?.[0]?.card?.image || item.cards?.[0]?.image || ASSETS.tarotBack} style={s.itemThumb} />
                </View>
                <View style={s.itemInfo}>
                    <Txt style={s.itemDate}>{new Date(item.date).toLocaleDateString('ko-KR')}</Txt>
                    <Txt style={s.itemQuestion} numberOfLines={1}>{item.question}</Txt>
                    <Txt style={s.itemPreview} numberOfLines={1}>{item.interpretation}</Txt>
                </View>
                <Txt style={s.itemArrow}>›</Txt>
            </PressableEffect>
        ));
    };

    const renderChatTab = () => {
        if (chatHistory.length === 0) {
            return (
                <View style={s.emptyState}>
                    <Txt style={s.emptyText}>아직 이웃과의 대화가 없어요.</Txt>
                    <Txt style={s.emptySub}>라운지에서 다른 분께 말을 걸어보세요!</Txt>
                </View>
            );
        }
        return chatHistory.map((item) => (
            <View key={item.id} style={s.historyItem}>
                <View style={s.itemInfo}>
                    <Txt style={s.itemDate}>{new Date(item.date).toLocaleDateString('ko-KR')}</Txt>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Txt style={s.itemQuestion} numberOfLines={1}>{item.partnerName}님과의 대화</Txt>
                        <TouchableOpacity onPress={() => handleDeleteChatRecord(item.id)}>
                             <Txt style={s.loungeDelete}>삭제</Txt>
                        </TouchableOpacity>
                    </View>
                    <Txt style={s.itemPreview} numberOfLines={2}>{item.summary}</Txt>
                </View>
            </View>
        ));
    };

    const renderLoungeTab = () => {
        if (loungeHistory.length === 0) {
            return (
                <View style={s.emptyState}>
                    <Txt style={s.emptyText}>아직 남긴 이야기가 없어요.</Txt>
                    <Txt style={s.emptySub}>라운지에 첫 이야기를 남겨보세요!</Txt>
                </View>
            );
        }
        return loungeHistory.map((item) => (
            <View key={item.id} style={s.loungeItem}>
                <View style={s.loungeItemHeader}>
                    <Txt style={s.loungeItemDate}>{new Date(item.date).toLocaleDateString('ko-KR')}</Txt>
                    <TouchableOpacity onPress={() => handleDeleteLoungePost(item.id)}>
                        <Txt style={s.loungeDelete}>삭제</Txt>
                    </TouchableOpacity>
                </View>
                <Txt style={s.loungeItemContent}>{item.content}</Txt>
            </View>
        ));
    };

    return (
        <View style={s.container}>
            {/* Header & Sub-Tabs */}
            <View style={s.header}>
                <View style={s.tabContainer}>
                    <TouchableOpacity style={[s.tab, activeTab === 'tarot' && s.tabActive]} onPress={() => setActiveTab('tarot')}>
                        <Txt style={[s.tabText, activeTab === 'tarot' && s.tabTextActive]}>타로 기록</Txt>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.tab, activeTab === 'chat' && s.tabActive]} onPress={() => setActiveTab('chat')}>
                        <Txt style={[s.tabText, activeTab === 'chat' && s.tabTextActive]}>채팅 내역</Txt>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.tab, activeTab === 'lounge' && s.tabActive]} onPress={() => setActiveTab('lounge')}>
                        <Txt style={[s.tabText, activeTab === 'lounge' && s.tabTextActive]}>라운지 활동</Txt>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.listContent}>
                {activeTab === 'tarot' && renderTarotTab()}
                {activeTab === 'chat' && renderChatTab()}
                {activeTab === 'lounge' && renderLoungeTab()}
            </ScrollView>
            <BottomInfo style={{ backgroundColor: BG }} />
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
    tabTextActive: { color: '#fff' },

    headerDetail: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
    headerTitleDetail: { fontSize: 18, fontWeight: '800', color: GOLD },
    backBtn: { position: 'absolute', left: 20, top: 20, zIndex: 10 },
    backBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },

    scroll: { flex: 1 },
    listContent: { padding: 20, gap: 12 },
    
    historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    itemImageWrap: { width: 50, height: 75, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
    itemThumb: { width: '100%', height: '100%' },
    itemInfo: { flex: 1, marginLeft: 16, gap: 4 },
    itemDate: { fontSize: 11, color: GOLD, fontWeight: '700' },
    itemQuestion: { fontSize: 14, color: '#fff', fontWeight: '800' },
    itemPreview: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
    itemArrow: { fontSize: 24, color: 'rgba(255,255,255,0.2)', marginLeft: 8 },

    loungeItem: { backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 12 },
    loungeItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    loungeItemDate: { fontSize: 12, color: GOLD, fontWeight: '700' },
    loungeDelete: { fontSize: 13, color: '#f43f5e', fontWeight: '600' },
    loungeItemContent: { fontSize: 15, color: '#fff', lineHeight: 22 },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
    emptyEmoji: { fontSize: 48 },
    emptyText: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
    emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

    detailContent: { padding: 24, alignItems: 'center', paddingBottom: 60 },
    detailCardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 24 },
    miniCardFrame: { alignItems: 'center', gap: 8 },
    detailCardImg: { width: 120, height: 180, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(218,165,32,0.3)' },
    detailCardName: { fontSize: 13, fontWeight: '700', color: GOLD },
    readingBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    detailQuestion: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 12 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 12 },
    detailInterpretation: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
    detailDate: { marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' },
});

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { Haptic } from '../../lib/haptic';
import { useGeolocation, startUpdateLocation, Accuracy } from '@apps-in-toss/framework';
import { ThreadItem } from './ThreadItem';
import { ProfilePopup } from './ProfilePopup';
import { PaymentInductionModal } from '../PaymentInductionModal';
import { CommentsModal } from './CommentsModal';
import { getLoungeComments, deleteLoungePost } from '../../lib/storage';

const GOLD = '#DAA520';

// 초기 더미 데이터
const INITIAL_THREADS = [
  {
    id: '1',
    author: '반포동 은둔자',
    lat: 37.502, 
    lng: 127.004,
    content: '오늘 연애운을 봤는데 정체기라고 하네요... 비슷한 상황이신 분들 있나요? 위로가 필요해요 🥲',
    timestamp: '12분 전',
    cardName: 'THE HERMIT (은둔자)',
    cardImage: 'the-hermit.png',
    isMine: false,
    gender: 'M',
    likes: 12,
    comments: 3,
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    authorId: 'user_A',
  },
  {
    id: '2',
    author: '신비로운 전차',
    lat: 37.498,
    lng: 127.012,
    content: '드디어 이직 성공! 타로에서 말한 대로 추진력 있게 밀어붙였더니 좋은 결과가 있었어요. 다들 기운 받아가세요! ✨',
    timestamp: '34분 전',
    cardName: 'THE CHARIOT (전차)',
    cardImage: 'the-chariot.png',
    isMine: false,
    gender: 'F',
    likes: 45,
    comments: 8,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    authorId: 'user_B',
  },
  {
    id: '3',
    author: '행복한 태양',
    lat: 37.512,
    lng: 127.025,
    content: '주말 데이트 장소 추천해주세요! 타로에서는 밝고 활기찬 곳이 좋다고 하네요. ☀️',
    timestamp: '1시간 전',
    cardName: 'THE SUN (태양)',
    cardImage: 'the-sun.png',
    isMine: false,
    gender: 'F',
    likes: 89,
    comments: 12,
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    authorId: 'user_C',
  },
];

// 익명 닉네임 pool
const ANON_NAMES = ['별빛 방랑자', '새벽 달빛', '고요한 강', '흘러가는 구름', '바람의 속삭임', '밤하늘 나그네'];

export interface LoungeViewProps {
  onNavigateChat: (consultation: any) => void;
  showCompose: boolean;
  onCloseCompose: () => void;
}

export const LoungeView: React.FC<LoungeViewProps> = ({ 
  onNavigateChat, 
  showCompose, 
  onCloseCompose
}) => {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [draftText, setDraftText] = useState('');
  const [unlockedPosts, setUnlockedPosts] = useState<string[]>([]);
  const [unlockedChats, setUnlockedChats] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const composeAnim = useRef(new Animated.Value(600)).current;

  // GPS 연동
  const userLocation = useGeolocation({
    accuracy: Accuracy.Balanced,
    distanceInterval: 10,
    timeInterval: 5000,
  });

  React.useEffect(() => {
    // 매뉴얼 방식대로 진입 시 권한 확인 및 요청
    const checkPermission = async () => {
      try {
        const status = await startUpdateLocation.getPermission();
        if (status !== 'allowed') {
          await startUpdateLocation.openPermissionDialog();
        }
      } catch (e) {
        console.error('Location Permission Error:', e);
      }
    };
    checkPermission();
  }, []);

  React.useEffect(() => {
    const { getUnlockedPosts, getUnlockedChats, getLoungePosts } = require('../../lib/storage');
    getUnlockedPosts().then(setUnlockedPosts);
    getUnlockedChats().then(setUnlockedChats);
    
    // 저장된 게시글 불러와서 병합
    const loadAll = async () => {
      const saved = await getLoungePosts();
      const mapped = await Promise.all(saved.map(async p => {
        const comments = await getLoungeComments(p.id);
        return {
          ...p,
          timestamp: '예전 기록',
          isMine: true,
          likes: 0,
          comments: comments.length,
        };
      }));

      // 초기 데이터의 댓글 수도 불러오기
      const initialWithComments = await Promise.all(INITIAL_THREADS.map(async t => {
        const comments = await getLoungeComments(t.id);
        return { ...t, comments: comments.length };
      }));

      setThreads([...mapped, ...initialWithComments]);
    };
    
    loadAll();
  }, []);

  React.useEffect(() => {
    if (showCompose) {
      setDraftText('');
      Animated.spring(composeAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      composeAnim.setValue(600);
    }
  }, [showCompose]);

  // 내 글 목록
  const myPosts = threads.filter(t => t.isMine);

  // 게시글 제출
  const submitPost = useCallback(async () => {
    if (!draftText.trim()) return;

    const { saveLoungePost, getMyProfile } = require('../../lib/storage');
    const myProfile = await getMyProfile();

    const newPost = {
      id: `my_${Date.now()}`,
      authorId: 'my_unique_id',
      author: ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)] || '익명',
      lat: userLocation?.coords.latitude,
      lng: userLocation?.coords.longitude,
      content: draftText.trim(),
      timestamp: '방금',
      cardName: '',
      cardImage: '',
      isMine: true,
      gender: (myProfile.gender as 'M' | 'F') || 'F',
      likes: 0,
      comments: 0,
      profileImage: myProfile.profileImage,
    };

    await saveLoungePost({
      id: newPost.id,
      content: newPost.content,
      date: new Date().toISOString(),
      author: newPost.author,
      authorId: newPost.authorId,
      gender: newPost.gender as any,
      profileImage: newPost.profileImage,
    });

    Haptic.success();
    setThreads([newPost, ...threads]);
    setDraftText('');
    onCloseCompose();
  }, [draftText, threads, onCloseCompose]);

  // 내 게시글 삭제
  const deletePost = useCallback((id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshCommentCount = async (postId: string) => {
    const comments = await getLoungeComments(postId);
    setThreads(prev => prev.map(t => t.id === postId ? { ...t, comments: comments.length } : t));
  };

  const handleDeletePost = async (id: string) => {
    await deleteLoungePost(id);
    setThreads(prev => prev.filter(t => t.id !== id));
  };

  const renderItem = ({ item }: { item: any }) => (
    <ThreadItem
      {...item}
      userLat={userLocation?.coords.latitude}
      userLng={userLocation?.coords.longitude}
      onProfilePress={() => !item.isMine && setSelectedUser(item)}
      onChatPress={() => !item.isMine && setSelectedUser(item)}
      onCommentPress={() => setSelectedPostForComments(item.id)}
      onDeletePress={() => handleDeletePost(item.id)}
    />
  );

  return (
    <View style={s.container}>
      <FlatList
        data={threads}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Txt style={s.emptyEmoji}>🏛️</Txt>
            <Txt style={s.emptyText}>아직 주변에 게시글이 없어요</Txt>
            <Txt style={s.emptySub}>첫 번째로 이야기를 꺼내보세요!</Txt>
          </View>
        }
      />

      {/* 댓글 모달 */}
      <CommentsModal 
        visible={!!selectedPostForComments}
        postId={selectedPostForComments || ''}
        onClose={() => setSelectedPostForComments(null)}
        onCommentAdded={() => selectedPostForComments && refreshCommentCount(selectedPostForComments)}
      />

      {/* 프로필 팝업 */}
      <ProfilePopup
        visible={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        nickname={selectedUser?.author || ''}
        distance={selectedUser?.distance || ''}
        gender={selectedUser?.gender as any}
        profileImage={selectedUser?.profileImage}
        isAlreadyRevealed={unlockedPosts.includes(selectedUser?.id)}
        isChatUnlocked={unlockedChats.includes(selectedUser?.authorId)}
        onReveal={async () => {
          if (unlockedPosts.includes(selectedUser.id)) return true;
          
          const { getUserTokens, consumeMultipleTokens, unlockPost } = require('../../lib/storage');
          const currentTokens = await getUserTokens();
          if (currentTokens < 1) {
            setSelectedUser(null);
            setShowPaymentModal(true);
            return false;
          }
          await consumeMultipleTokens(1);
          await unlockPost(selectedUser.id);
          Haptic.success();
          setUnlockedPosts(prev => [...prev, selectedUser.id]);
          return true;
        }}
        onChatStart={async () => {
          const { getUserTokens, consumeMultipleTokens, unlockChat } = require('../../lib/storage');
          
          if (!unlockedChats.includes(selectedUser.authorId)) {
            const cost = 2;
            const currentTokens = await getUserTokens();
            if (currentTokens < cost) {
              setSelectedUser(null);
              setShowPaymentModal(true);
              return false;
            }
            await consumeMultipleTokens(cost);
            await unlockChat(selectedUser.authorId);
            Haptic.success();
            setUnlockedChats(prev => [...prev, selectedUser.authorId]);
          }
          
          const user = selectedUser;
          setSelectedUser(null);
          
          onNavigateChat({
            contentTitle: `이웃 ${user.author}님과의 대화`,
            question: user.content,
            reading: `${user.author}님과 대화를 시작했습니다. 상호 존중하는 대화를 나누세요.`,
          });
          return true;
        }}
      />

      {/* ── 게시글 작성 모달 */}
      <Modal visible={showCompose} animationType="none" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          style={s.composeOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={s.composeBackdrop}
            activeOpacity={1}
            onPress={onCloseCompose}
          />
          <Animated.View style={[s.composeSheet, { transform: [{ translateY: composeAnim }] }]}>
            <View style={s.composeHeader}>
              <TouchableOpacity onPress={onCloseCompose}>
                <Txt style={s.composeCancel}>취소</Txt>
              </TouchableOpacity>
              <Txt style={s.composeTitle}>라운지에 남기기</Txt>
              <TouchableOpacity
                style={[s.postBtn, !draftText.trim() && s.postBtnDisabled]}
                onPress={submitPost}
                disabled={!draftText.trim()}
              >
                <Txt style={s.postBtnText}>게시</Txt>
              </TouchableOpacity>
            </View>

            <View style={s.composeBody}>
              <View style={s.composeAvatar}>
                <Txt style={{ fontSize: 22 }}>👤</Txt>
              </View>
              <TextInput
                style={s.composeInput}
                placeholder="오늘 타로가 어떻게 나왔나요? 주변 이웃들과 나눠보세요..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                autoFocus
                value={draftText}
                onChangeText={setDraftText}
                maxLength={280}
              />
            </View>
            <Txt style={s.charCount}>{draftText.length} / 280</Txt>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 결제 유도(다이아 부족) 모달 ── */}
      <PaymentInductionModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contentName="라운지 프로필"
      />

    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  listContent: { paddingBottom: Platform.OS === 'ios' ? 100 : 80 },

  // Empty state
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.25)' },

  // Compose modal
  composeOverlay: { flex: 1, justifyContent: 'flex-end' },
  composeBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  composeSheet: {
    backgroundColor: '#16161a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 260,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  composeTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  composeCancel: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  postBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  postBtnDisabled: { opacity: 0.3 },
  postBtnText: { fontSize: 13, fontWeight: '800', color: '#000' },
  composeBody: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    minHeight: 140,
  },
  composeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 2,
  },
  composeInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  charCount: { textAlign: 'right', paddingRight: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)' },

  // My activity modal
  activityOverlay: { flex: 1, justifyContent: 'flex-end' },
  activitySheet: {
    backgroundColor: '#111113',
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  activityTopbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  activityTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  activityEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  myPostCard: {
    backgroundColor: '#16161a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 8,
  },
  myPostContent: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  myPostTime: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  deleteBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.3)',
    backgroundColor: 'rgba(255,80,80,0.06)',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,100,100,0.9)' },

  // Payment Modal
  paymentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  paymentBox: { width: '100%', backgroundColor: '#1e1e24', borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  paymentIconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(218, 165, 32, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  paymentTitle: { fontSize: 20, color: '#fff', fontWeight: '800', marginBottom: 8 },
  paymentSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  paymentBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  paymentCancelBtn: { flex: 1, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  paymentCancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700' },
  paymentChargeBtn: { flex: 1, height: 52, borderRadius: 14, backgroundColor: '#DAA520', alignItems: 'center', justifyContent: 'center' },
  paymentChargeText: { color: '#000', fontSize: 16, fontWeight: '800' }
});



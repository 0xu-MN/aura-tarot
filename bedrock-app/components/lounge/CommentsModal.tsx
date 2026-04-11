import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
} from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { getLoungeComments, saveLoungeComment, deleteLoungeComment, LoungeComment } from '../../lib/storage';

const GOLD = '#DAA520';
const ANON_NAMES = ['별빛 방랑자', '새벽 달빛', '고요한 강', '흘러가는 구름', '바람의 속삭임', '밤하늘 나그네'];

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  onCommentAdded?: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<LoungeComment[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    const data = await getLoungeComments(postId);
    setComments(data);
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const { getMyProfile } = require('../../lib/storage');
    const myProfile = await getMyProfile();

    const newComment: LoungeComment = {
      id: `comm_${Date.now()}`,
      postId,
      content: inputText.trim(),
      author: ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)],
      authorId: 'my_unique_id',
      date: '방금',
      gender: myProfile.gender || 'F',
    };

    await saveLoungeComment(postId, newComment);
    setInputText('');
    await loadComments();
    setIsSubmitting(false);
    onCommentAdded?.();
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteLoungeComment(postId, commentId);
    await loadComments();
    onCommentAdded?.();
  };

  const renderComment = ({ item }: { item: LoungeComment }) => (
    <View style={s.commentItem}>
      <View style={[s.avatar, item.gender === 'M' ? s.avatarM : s.avatarF]}>
        <Txt style={{ fontSize: 12 }}>👤</Txt>
      </View>
      <View style={s.commentContent}>
        <View style={s.commentHeader}>
          <Txt style={s.author}>{item.author}</Txt>
          <Txt style={s.date}>{item.date}</Txt>
          <View style={{ flex: 1 }} />
          {item.authorId === 'my_unique_id' && (
            <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
              <Txt style={{ fontSize: 12, opacity: 0.3 }}>🗑️</Txt>
            </TouchableOpacity>
          )}
        </View>
        <Txt style={s.text}>{item.content}</Txt>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <View style={s.handle} />
            <Txt style={s.title}>댓글 {comments.length}</Txt>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Txt style={s.closeText}>닫기</Txt>
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            ListEmptyComponent={
              <View style={s.empty}>
                <Txt style={s.emptyText}>첫 번째 댓글을 남겨보세요.</Txt>
              </View>
            }
          />

          <View style={s.inputArea}>
            <TextInput
              style={s.input}
              placeholder="따뜻한 댓글을 남겨주세요"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[s.sendBtn, !inputText.trim() && s.sendBtnDisabled]}
              onPress={handleSubmit}
              disabled={!inputText.trim() || isSubmitting}
            >
              <Txt style={s.sendBtnText}>전송</Txt>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: '#16161a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#fff' },
  closeBtn: { position: 'absolute', right: 20, top: 16 },
  closeText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  list: { padding: 20 },
  commentItem: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarF: { borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)' },
  avatarM: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  commentContent: { flex: 1, gap: 4 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  author: { fontSize: 13, fontWeight: '700', color: '#fff' },
  date: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  text: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 15 },
  inputArea: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  sendBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});

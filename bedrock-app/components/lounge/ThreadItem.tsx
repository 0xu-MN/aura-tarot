import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { getDistanceKm, formatDistance } from '../../lib/locationUtils';
import { EmbeddedTarotCard } from './EmbeddedTarotCard';

interface ThreadItemProps {
  id: string;
  author: string;
  lat?: number;
  lng?: number;
  userLat?: number;
  userLng?: number;
  content: string;
  timestamp: string;
  cardName?: string;
  cardImage?: string;
  gender?: 'M' | 'F';
  likes?: number;
  comments?: number;
  onProfilePress?: () => void;
  onChatPress?: () => void;
  onCommentPress?: () => void;
  onDeletePress?: () => void;
  isMine?: boolean;
}

export const ThreadItem: React.FC<ThreadItemProps> = ({
  author,
  lat,
  lng,
  userLat,
  userLng,
  content,
  timestamp,
  cardName,
  cardImage,
  gender,
  likes = 0,
  comments = 0,
  onProfilePress,
  onChatPress,
  onCommentPress,
  onDeletePress,
  isMine,
}) => {
  const [isLiked, setIsLiked] = React.useState(false);

  const displayDistance = React.useMemo(() => {
    if (lat && lng && userLat && userLng) {
      const km = getDistanceKm(userLat, userLng, lat, lng);
      return formatDistance(km);
    }
    return '근처';
  }, [lat, lng, userLat, userLng]);

  const getAvatarStyle = () => {
    if (gender === 'M') {
      return { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.15)' };
    } else if (gender === 'F') {
      return { borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.15)' };
    }
    return {};
  };

  return (
    <View style={s.container}>
      {/* Left Column: Avatar & Thread Line */}
      <View style={s.leftCol}>
        <TouchableOpacity style={[s.avatar, getAvatarStyle()]} onPress={onProfilePress} activeOpacity={0.7}>
          <Txt style={s.avatarEmoji}>👤</Txt>
        </TouchableOpacity>
        <View style={s.threadLine} />
      </View>

      {/* Right Column: Content */}
      <View style={s.rightCol}>
        <View style={s.header}>
          <Txt style={s.author}>{author}</Txt>
          <Txt style={s.bullet}>·</Txt>
          <Txt style={s.distance}>{displayDistance}</Txt>
          <View style={{ flex: 1 }} />
          <Txt style={s.time}>{timestamp}</Txt>
          {isMine && (
            <TouchableOpacity onPress={onDeletePress} style={s.deleteBtn}>
              <Txt style={s.deleteIcon}>🗑️</Txt>
            </TouchableOpacity>
          )}
        </View>

        <Txt style={s.content}>{content}</Txt>

        {cardName && (
          <EmbeddedTarotCard cardName={cardName} cardImage={cardImage} />
        )}

        <View style={s.actions}>
          <View style={s.socialBtns}>
            <TouchableOpacity style={s.actionBtn} onPress={() => setIsLiked(!isLiked)} activeOpacity={0.7}>
              <Txt style={[s.actionIcon, isLiked && s.actionIconActive]}>
                {isLiked ? '💖' : '🤍'}
              </Txt>
              <Txt style={[s.actionCount, isLiked && s.actionCountActive]}>
                {isLiked ? likes + 1 : likes}
              </Txt>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} activeOpacity={0.7} onPress={onCommentPress}>
              <Txt style={s.actionIcon}>💬</Txt>
              <Txt style={s.actionCount}>{comments}</Txt>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.sayHello} onPress={onChatPress}>
            <Txt style={s.sayHelloText}>✨ 말 걸어보기</Txt>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftCol: {
    width: 44,
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarEmoji: { fontSize: 18 },
  threadLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  rightCol: {
    flex: 1,
    paddingLeft: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  bullet: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },
  content: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  socialBtns: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  actionIconActive: {
    opacity: 1,
  },
  actionCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  actionCountActive: {
    color: '#ff4d4d',
  },
  sayHello: {
    backgroundColor: 'rgba(218,165,32,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218,165,32,0.25)',
  },
  sayHelloText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DAA520',
  },
  deleteBtn: {
    marginLeft: 8,
    padding: 2,
  },
  deleteIcon: {
    fontSize: 14,
    opacity: 0.5,
  },
});

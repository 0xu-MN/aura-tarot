import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { cardUri } from '../../lib/assets';

interface EmbeddedTarotCardProps {
  cardName: string;
  cardImage?: string; // e.g. 'the-fool.png'
  keywords?: string[];
}

export const EmbeddedTarotCard: React.FC<EmbeddedTarotCardProps> = ({ cardName, cardImage, keywords }) => {
  return (
    <View style={s.container}>
      {cardImage ? (
        <Image 
          source={cardUri(cardImage)} 
          style={s.image} 
          resizeMode="cover" 
        />
      ) : (
        <View style={[s.image, s.placeholder]}>
          <Txt style={s.placeholderText}>✨</Txt>
        </View>
      )}
      <View style={s.content}>
        <Txt style={s.cardName}>{cardName}</Txt>
        {keywords && (
          <Txt style={s.keywords}>{keywords.join(' · ')}</Txt>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    marginBottom: 4,
  },
  image: {
    width: 60,
    height: 90,
    backgroundColor: '#1a1a1e',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  keywords: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});

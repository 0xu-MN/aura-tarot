import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt } from '@toss/tds-react-native';

const GOLD = '#DAA520';

interface CarouselDotsProps {
  total: number;
  current: number;
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({ total, current }) => {
  // 12개 전부 점으로 표시하면 너무 많으므로 현재 위치 중심 슬라이딩 창 표시
  const maxVisible = 7;
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(0, current - half);
  let end = Math.min(total - 1, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
  const visible = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <View style={styles.container}>
      {visible.map((idx) => {
        const isActive = idx === current;
        const isEdge = idx === start || idx === end;
        const size = isActive ? 8 : isEdge ? 4 : 6;
        return (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: isActive ? GOLD : 'rgba(218,165,32,0.3)',
              },
            ]}
          />
        );
      })}
      <Txt style={styles.label}>{current + 1} / {total}</Txt>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  dot: {
    marginHorizontal: 2,
  },
  label: {
    fontSize: 11,
    color: 'rgba(218,165,32,0.5)',
    marginLeft: 8,
    fontWeight: '600',
  },
});

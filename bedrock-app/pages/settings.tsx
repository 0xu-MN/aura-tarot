import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Txt, List } from '@toss/tds-react-native';
import { getDailyDrawCount } from '../lib/storage';

export const Route = createRoute('/settings' as any, {
  component: SettingsPage,
});

function SettingsPage() {
  const navigation = Route.useNavigation();
  const [dailyDraws, setDailyDraws] = useState(0);

  // Load daily draws
  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const count = await getDailyDrawCount();
    setDailyDraws(count);
  };

  const L = List as any;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <L>
          <L.Header>사용 통계</L.Header>
          <L.Row
            contents={<Txt>오늘 사용한 카드</Txt>}
            right={<Txt color="#DAA520">{dailyDraws}/1</Txt>}
          />
          <L.Row
            contents={<Txt>기록 저장 안내</Txt>}
            right={<Txt color="#9ca3af" typography="t7">기기 내 저장됨</Txt>}
          />
        </L>

        <L>
          <L.Header>앱 설정</L.Header>
          <L.Row
            contents={<Txt>알림 설정</Txt>}
            right={<Txt color="#6b7280" typography="t7">준비 중</Txt>}
          />
        </L>

        <L>
          <L.Header>법적 정보</L.Header>
          <L.Row
            contents={<Txt>개인정보처리방침</Txt>}
            withArrow
            onPress={() => navigation.navigate('/privacy' as any)}
          />
          <L.Row
            contents={<Txt>서비스 이용약관</Txt>}
            withArrow
            onPress={() => navigation.navigate('/privacy' as any)}
          />
        </L>

        <View style={styles.footer}>
          <Txt color="#4b5563" typography="t7">Version 1.1.0 (TDS Build)</Txt>
          <Txt color="#4b5563" typography="t7" style={{ marginTop: 4 }}>© 2026 Aura Tarot. All rights reserved.</Txt>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const BG = '#0a0a0b';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 40,
  },
});

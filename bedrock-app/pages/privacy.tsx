import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Txt, PressableEffect, List } from '@toss/tds-react-native';

export const Route = createRoute('/privacy' as any, {
    component: PrivacyPage,
});

const LAST_UPDATED = '2025년 2월 21일';
const COMPANY = '오늘의 한장 타로';

function PrivacyPage() {
    const navigation = Route.useNavigation();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Txt style={styles.topNotice}>
                    {COMPANY}(이하 "회사")은 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.
                </Txt>
                <Txt style={styles.lastUpdated}>최종 업데이트: {LAST_UPDATED}</Txt>

                <List>
                    <Txt style={styles.sectionTitle}>1. 수집하는 개인정보 항목</Txt>
                    <View style={styles.row}>
                        <Txt style={styles.body}>
                            {'회사는 서비스 제공을 위해 아래와 같은 정보를 처리합니다.\n\n' +
                                '• 자동 수집 정보: 앱 사용 기기의 식별자(광고 ID), 앱 사용 기록, 오류 로그\n\n' +
                                '• 서비스 이용 정보: 타로 카드 뽑기 기록, 질문 내용 (기기 내 저장, 서버 미전송)\n\n' +
                                '비회원(게스트)으로 이용 시 별도의 회원 가입 정보를 수집하지 않습니다.'}
                        </Txt>
                    </View>

                    <Txt style={styles.sectionTitle}>2. 개인정보의 수집 및 이용 목적</Txt>
                    <View style={styles.row}>
                        <Txt style={styles.body}>
                            {'• 서비스 제공 및 운영 (타로 카드 결과 제공, AI 상담 기능)\n' +
                                '• 서비스 품질 개선 및 오류 분석\n' +
                                '• 광고 및 마케팅 (이용자 동의 시)'}
                        </Txt>
                    </View>

                    <Txt style={styles.sectionTitle}>3. 개인정보의 보유 및 이용 기간</Txt>
                    <View style={styles.row}>
                        <Txt style={styles.body}>
                            {'이용자의 개인정보는 수집 및 이용 목적 달성 후 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.\n\n' +
                                '• 전자상거래법에 따른 계약·청약철회 기록: 5년\n' +
                                '• 소비자 불만 또는 분쟁처리 기록: 3년'}
                        </Txt>
                    </View>

                    <Txt style={styles.sectionTitle}>4. 개인정보의 제3자 제공</Txt>
                    <View style={styles.row}>
                        <Txt style={styles.body}>
                            {'회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 아래와 같은 경우 예외가 있을 수 있습니다.\n\n' +
                                '• 법령에 따른 수사기관의 요청이 있는 경우\n\n' +
                                '외부 서비스 연동 현황:\n' +
                                '• Google Gemini AI: AI 상담 기능을 위한 질문 내용 전송 (구글 개인정보처리방침 적용)\n' +
                                '• 토스 앱인토스 플랫폼: 광고 및 결제 서비스 (토스 개인정보처리방침 적용)'}
                        </Txt>
                    </View>

                    <Txt style={styles.sectionTitle}>5. 이용자 권리</Txt>
                    <View style={styles.row}>
                        <Txt style={styles.body}>
                            {'이용자는 언제든지 아래의 권리를 행사할 수 있습니다.\n\n' +
                                '• 개인정보 열람 요청\n' +
                                '• 개인정보 정정·삭제 요청\n' +
                                '• 개인정보 처리 정지 요청\n\n' +
                                '앱 내 데이터는 설정 > 앱 데이터 삭제를 통해 직접 삭제할 수 있습니다.'}
                        </Txt>
                    </View>
                </List>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const BG = '#0a0a0b';
const TEXT_MUTED = '#9ca3af';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    topNotice: {
        fontSize: 14,
        color: TEXT_MUTED,
        lineHeight: 22,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    lastUpdated: {
        fontSize: 12,
        color: TEXT_MUTED,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#e5e7eb',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    body: {
        fontSize: 14,
        color: '#d1d5db',
        lineHeight: 24,
    },
    row: {
        paddingHorizontal: 20,
    },
});

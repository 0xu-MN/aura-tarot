import { createRoute } from '@granite-js/react-native';
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

export const Route = createRoute('/privacy', {
    component: PrivacyPage,
});

const LAST_UPDATED = '2025년 2월 21일';
const COMPANY = '오늘의 한장 타로';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function Body({ children }: { children: string }) {
    return <Text style={styles.body}>{children}</Text>;
}

function PrivacyPage() {
    const navigation = Route.useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>개인정보처리방침</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.topNotice}>
                    {COMPANY}(이하 "회사")은 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.
                </Text>
                <Text style={styles.lastUpdated}>최종 업데이트: {LAST_UPDATED}</Text>

                <Section title="1. 수집하는 개인정보 항목">
                    <Body>
                        {'회사는 서비스 제공을 위해 아래와 같은 정보를 처리합니다.\n\n' +
                            '• 자동 수집 정보: 앱 사용 기기의 식별자(광고 ID), 앱 사용 기록, 오류 로그\n\n' +
                            '• 서비스 이용 정보: 타로 카드 뽑기 기록, 질문 내용 (기기 내 저장, 서버 미전송)\n\n' +
                            '비회원(게스트)으로 이용 시 별도의 회원 가입 정보를 수집하지 않습니다.'}
                    </Body>
                </Section>

                <Section title="2. 개인정보의 수집 및 이용 목적">
                    <Body>
                        {'• 서비스 제공 및 운영 (타로 카드 결과 제공, AI 상담 기능)\n' +
                            '• 서비스 품질 개선 및 오류 분석\n' +
                            '• 광고 및 마케팅 (이용자 동의 시)'}
                    </Body>
                </Section>

                <Section title="3. 개인정보의 보유 및 이용 기간">
                    <Body>
                        {'이용자의 개인정보는 수집 및 이용 목적 달성 후 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.\n\n' +
                            '• 전자상거래법에 따른 계약·청약철회 기록: 5년\n' +
                            '• 소비자 불만 또는 분쟁처리 기록: 3년'}
                    </Body>
                </Section>

                <Section title="4. 개인정보의 제3자 제공">
                    <Body>
                        {'회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 아래와 같은 경우 예외가 있을 수 있습니다.\n\n' +
                            '• 법령에 따른 수사기관의 요청이 있는 경우\n\n' +
                            '외부 서비스 연동 현황:\n' +
                            '• Google Gemini AI: AI 상담 기능을 위한 질문 내용 전송 (구글 개인정보처리방침 적용)\n' +
                            '• 토스 앱인토스 플랫폼: 광고 및 결제 서비스 (토스 개인정보처리방침 적용)'}
                    </Body>
                </Section>

                <Section title="5. 이용자 권리">
                    <Body>
                        {'이용자는 언제든지 아래의 권리를 행사할 수 있습니다.\n\n' +
                            '• 개인정보 열람 요청\n' +
                            '• 개인정보 정정·삭제 요청\n' +
                            '• 개인정보 처리 정지 요청\n\n' +
                            '앱 내 데이터는 설정 > 앱 데이터 삭제를 통해 직접 삭제할 수 있습니다.'}
                    </Body>
                </Section>

                <Section title="6. 개인정보 보호책임자">
                    <Body>
                        {'개인정보 관련 문의는 아래로 연락주세요.\n\n' +
                            '서비스명: 오늘의 한장 타로\n' +
                            '문의: 앱인토스 고객센터를 통해 접수'}
                    </Body>
                </Section>

                <Section title="7. 개인정보처리방침 변경">
                    <Body>
                        {'이 개인정보처리방침은 법령 또는 서비스 변경에 따라 업데이트 될 수 있습니다. ' +
                            '변경 시 앱 내 공지를 통해 사전 안내드립니다.'}
                    </Body>
                </Section>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const BG = '#0a0a0b';
const GOLD = '#DAA520';
const SURFACE = '#1a1b1e';
const TEXT_MUTED = '#9ca3af';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(218, 165, 32, 0.2)',
    },
    backButton: {
        padding: 8,
        width: 40,
    },
    backIcon: {
        fontSize: 22,
        color: GOLD,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: GOLD,
    },
    placeholder: {
        width: 40,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    topNotice: {
        fontSize: 14,
        color: TEXT_MUTED,
        lineHeight: 22,
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 12,
        color: TEXT_MUTED,
        marginBottom: 24,
    },
    section: {
        backgroundColor: SURFACE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(218, 165, 32, 0.15)',
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: GOLD,
        marginBottom: 10,
    },
    body: {
        fontSize: 13,
        color: '#d1d5db',
        lineHeight: 22,
    },
});

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Txt, PressableEffect } from '@toss/tds-react-native';

export interface AlertOptions {
    title: string;
    message?: string;
    buttons?: {
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }[];
}

interface AlertContextType {
    alert: (title: string, message?: string, buttons?: AlertOptions['buttons']) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

// 외부 훅/파일에서 사용하기 위한 글로벌 참조 객체
export const GlobalAlert: {
    alert: ((title: string, message?: string, buttons?: AlertOptions['buttons']) => void) | null;
    close: (() => void) | null;
} = {
    alert: null,
    close: null,
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);

    const alert = (title: string, message?: string, buttons?: AlertOptions['buttons']) => {
        setAlertConfig({ title, message, buttons: buttons || [{ text: '확인' }] });
    };

    const close = () => {
        setAlertConfig(null);
    };

    React.useEffect(() => {
        GlobalAlert.alert = alert;
        GlobalAlert.close = close;
    }, []);

    return (
        <AlertContext.Provider value={{ alert }}>
            {children}
            {alertConfig && (
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <Txt style={styles.title}>{alertConfig.title}</Txt>
                        {!!alertConfig.message && <Txt style={styles.message}>{alertConfig.message}</Txt>}
                        <View style={styles.buttonContainer}>
                            {alertConfig.buttons?.map((btn, index) => (
                                <PressableEffect
                                    key={index}
                                    style={[
                                        styles.button,
                                        btn.style === 'cancel' && styles.cancelButton,
                                    ]}
                                    onPress={() => {
                                        if (btn.onPress) btn.onPress();
                                        close();
                                    }}
                                >
                                    <Txt
                                        style={[
                                            styles.buttonText,
                                            btn.style === 'cancel' && styles.cancelButtonText,
                                            btn.style === 'destructive' && styles.destructiveButtonText,
                                        ]}
                                    >
                                        {btn.text}
                                    </Txt>
                                </PressableEffect>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </AlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1E1E22',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#BDBDBD',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
    },
    button: {
        flex: 1,
        backgroundColor: '#DAA520',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#333',
    },
    buttonText: {
        color: '#0a0a0b',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#fff',
    },
    destructiveButtonText: {
        color: '#FF6B6B',
    },
});

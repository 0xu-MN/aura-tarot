import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GoogleAdMob } from '@apps-in-toss/framework';
import { BANNER_AD_ID } from '../lib/adUtils';
import { Txt } from '@toss/tds-react-native';

export function BannerAd() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
            // SDK 미지원 환경
            setHasError(true);
            return;
        }

        GoogleAdMob.loadAppsInTossAdMob({
            options: {
                adGroupId: BANNER_AD_ID,
            },
            onEvent: (event) => {
                if (event.type === 'loaded') {
                    setIsLoaded(true);
                } else if (event.type === 'failedToLoad') {
                    setHasError(true);
                }
            },
            onError: (err) => {
                console.error('Banner Ad Load Error:', err);
                setHasError(true);
            },
        });
    }, []);

    if (hasError || !isLoaded) {
        return (
            <View style={{ height: 50, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                <Txt style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>배너 광고 (미지원/로딩실패 환경)</Txt>
            </View>
        );
    }

    if (GoogleAdMob.showAppsInTossAdMob.isSupported()) {
        try {
            GoogleAdMob.showAppsInTossAdMob({
                options: {
                    adGroupId: BANNER_AD_ID,
                },
                onEvent: () => { },
                onError: () => { },
            });
        } catch (e) {
            console.error('Banner Ad Render Error:', e);
        }
    }

    // 광고가 실제로 뜰 수 있도록 명확한 width 100% 보장
    return <View style={{ height: 50, width: '100%', alignSelf: 'stretch' }} />;
}

import { GlobalAlert } from "../components/AlertProvider";
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { Alert } from 'react-native';

export interface CaptureOptions {
    format?: 'png' | 'jpg';
    quality?: number;
}

/**
 * Capture a view as an image
 * @param viewRef Reference to the ViewShot component
 * @param options Capture options
 * @returns URI of the captured image
 */
export const captureViewAsImage = async (
    viewRef: React.RefObject<any>,
    options: CaptureOptions = {}
): Promise<string | null> => {
    try {
        if (!viewRef.current) {
            GlobalAlert.alert?.('오류', '캡처할 뷰를 찾을 수 없습니다.');
            return null;
        }

        const uri = await viewRef.current.capture();
        return uri;
    } catch (error) {
        console.error('Image capture error:', error);
        GlobalAlert.alert?.('오류', '이미지 캡처에 실패했습니다.');
        return null;
    }
};

/**
 * Share an image from URI
 * @param imageUri URI of the image to share
 * @param message Optional message to include
 */
export const shareImage = async (imageUri: string, message?: string): Promise<void> => {
    try {
        const shareOptions = {
            title: '타로 결과 공유',
            message: message || '오늘의 타로 결과를 확인하세요!',
            url: imageUri,
            subject: '타로 결과',
        };

        await Share.open(shareOptions);
    } catch (error: any) {
        // User cancelled the share - not an error
        if (error?.message !== 'User did not share') {
            console.error('Share error:', error);
            GlobalAlert.alert?.('오류', '공유에 실패했습니다.');
        }
    }
};

/**
 * Save image to device gallery (requires permissions)
 * @param imageUri URI of the image to save
 */
export const saveImageToGallery = async (imageUri: string): Promise<boolean> => {
    try {
        // For React Native, we can use the share functionality
        // or implement platform-specific saving
        await Share.open({
            url: imageUri,
            saveToFiles: true,
        });
        return true;
    } catch (error: any) {
        if (error?.message !== 'User did not share') {
            console.error('Save error:', error);
            GlobalAlert.alert?.('오류', '이미지 저장에 실패했습니다.');
        }
        return false;
    }
};

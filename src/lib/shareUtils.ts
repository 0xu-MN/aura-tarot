import html2canvas from 'html2canvas';

export const saveResultAsImage = async (elementId: string, fileName: string) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) return false;

        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#0F0F12', // Match dark theme bg
            useCORS: true,
        });

        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${fileName}.png`;
        link.click();
        return true;
    } catch (error) {
        console.error('Save image error:', error);
        return false;
    }
};

export const shareResult = async (title: string, text: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url: window.location.href,
            });
            return true;
        } catch (error) {
            console.error('Share error:', error);
            return false;
        }
    }
    return false; // Share API not supported
};

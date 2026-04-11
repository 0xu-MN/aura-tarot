/**
 * 두 좌표(위도, 경도) 사이의 거리를 계산하는 유틸리티 (Haversine 공식)
 * @returns 거리 (km)
 */
export const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // 소수점 첫째자리까지 반올림
};

/**
 * 거리를 보기 좋게 포맷팅 (예: 500m 이내, 1.2km)
 */
export const formatDistance = (km: number): string => {
    if (km < 0.1) return '방금 전 근처';
    if (km < 1) return `${Math.round(km * 1000)}m 거리`;
    return `${km}km 거리`;
};

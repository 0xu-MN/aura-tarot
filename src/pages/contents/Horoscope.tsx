import { useState } from 'react';
import { saveResultAsImage, shareResult } from '@/lib/shareUtils';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/premium/PaymentModal';
import { Star, Moon, Sun, Share2, Download, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ZODIAC_SIGNS = [
    { name: "물병자리", date: "1.20~2.18", icon: "🏺", element: "Air", trait: "창의적, 독립적" },
    { name: "물고기자리", date: "2.19~3.20", icon: "♓", element: "Water", trait: "감성적, 예술적" },
    { name: "양자리", date: "3.21~4.19", icon: "♈", element: "Fire", trait: "열정적, 도전적" },
    { name: "황소자리", date: "4.20~5.20", icon: "♉", element: "Earth", trait: "신중함, 끈기" },
    { name: "쌍둥이자리", date: "5.21~6.21", icon: "♊", element: "Air", trait: "호기심, 다재다능" },
    { name: "게자리", date: "6.22~7.22", icon: "♋", element: "Water", trait: "가정적, 감수성" },
    { name: "사자자리", date: "7.23~8.22", icon: "♌", element: "Fire", trait: "자신감, 리더십" },
    { name: "처녀자리", date: "8.23~9.23", icon: "♍", element: "Earth", trait: "섬세함, 분석적" },
    { name: "천칭자리", date: "9.24~10.22", icon: "♎", element: "Air", trait: "조화, 사교적" },
    { name: "전갈자리", date: "10.23~11.22", icon: "♏", element: "Water", trait: "통찰력, 신비로움" },
    { name: "사수자리", date: "11.23~12.24", icon: "♐", element: "Fire", trait: "자유로움, 낙천적" },
    { name: "염소자리", date: "12.25~1.19", icon: "♑", element: "Earth", trait: "성실함, 책임감" },
];

const TIMEFRAMES = [
    { id: 'daily', label: '오늘의 운세', price: 0 },
    { id: 'weekly', label: '주간 운세', price: 1 },
    { id: 'monthly', label: '월간 운세', price: 1 },
    { id: 'yearly', label: '2025년 총운', price: 1 },
];

export const Horoscope = () => {
    const [step, setStep] = useState<'select-sign' | 'select-timeframe' | 'payment-check' | 'result'>('select-sign');
    const [selectedSign, setSelectedSign] = useState<typeof ZODIAC_SIGNS[0] | null>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState<typeof TIMEFRAMES[0] | null>(null);
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleSignSelect = (sign: typeof ZODIAC_SIGNS[0]) => {
        setSelectedSign(sign);
        setStep('select-timeframe');
    };

    const handleTimeframeSelect = (timeframe: typeof TIMEFRAMES[0]) => {
        setSelectedTimeframe(timeframe);
        if (timeframe.price > 0 && !hasPaid) {
            setStep('payment-check');
        } else {
            setStep('result');
        }
    };

    const handleUnlock = () => {
        setHasPaid(true);
        setStep('result');
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-medium mb-3">
                        <Moon className="w-4 h-4 fill-current" />
                        <span>별자리 운세</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-2">
                        별들이 말하는 당신의 운명
                    </h1>
                </div>

                {/* Step 1: Select Sign */}
                {step === 'select-sign' && (
                    <div className="w-full max-w-4xl animate-fade-in">
                        <p className="text-center text-muted-foreground mb-8">
                            본인의 별자리를 선택해주세요.
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {ZODIAC_SIGNS.map((sign) => (
                                <button
                                    key={sign.name}
                                    onClick={() => handleSignSelect(sign)}
                                    className="flex flex-col items-center p-4 rounded-xl bg-card border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                                >
                                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{sign.icon}</span>
                                    <span className="font-bold text-sm text-foreground">{sign.name}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1">{sign.date}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Timeframe */}
                {step === 'select-timeframe' && selectedSign && (
                    <div className="w-full max-w-md animate-fade-in space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-gold/20 mb-6">
                            <span className="text-4xl">{selectedSign.icon}</span>
                            <div>
                                <h3 className="font-bold text-lg text-gold">{selectedSign.name}</h3>
                                <p className="text-xs text-muted-foreground">{selectedSign.date} • {selectedSign.element}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setStep('select-sign')}>
                                변경
                            </Button>
                        </div>

                        <h3 className="text-center text-lg font-medium mb-4">어떤 운세가 궁금하신가요?</h3>

                        <div className="space-y-3">
                            {TIMEFRAMES.map((tf) => (
                                <button
                                    key={tf.id}
                                    onClick={() => handleTimeframeSelect(tf)}
                                    className="w-full p-4 rounded-xl bg-card border border-border hover:border-gold hover:bg-gold/5 transition-all flex items-center justify-between group"
                                >
                                    <span className="font-medium group-hover:text-gold transition-colors">{tf.label}</span>
                                    {tf.price === 0 ? (
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">무료</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Premiun</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment Check */}
                {step === 'payment-check' && selectedSign && selectedTimeframe && (
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in py-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
                            <Lock className="w-10 h-10 text-gold" />
                        </div>

                        <div>
                            <h2 className="font-display text-2xl text-foreground mb-4">
                                프리미엄 {selectedTimeframe.label}
                            </h2>
                            <p className="text-muted-foreground">
                                {selectedSign.name}의 {selectedTimeframe.label}를<br />
                                상세하게 확인하려면 잠금 해제가 필요합니다.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 text-black font-bold h-14"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            1원으로 운세 확인
                        </Button>

                        <Button variant="ghost" onClick={() => setStep('select-timeframe')}>
                            뒤로 가기
                        </Button>
                    </div>
                )}

                {/* Result */}
                {step === 'result' && selectedSign && selectedTimeframe && (
                    <div id="horoscope-result" className="w-full max-w-2xl animate-fade-in pb-20">
                        <div className="bg-card/40 backdrop-blur-md rounded-2xl p-8 border border-gold/20 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <span className="text-9xl">{selectedSign.icon}</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <span className="text-6xl mb-4 animate-bounce-slow">{selectedSign.icon}</span>
                                    <h2 className="font-display text-2xl text-gold-gradient mb-1">
                                        {selectedSign.name} {selectedTimeframe.label}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date().toLocaleDateString()} 기준
                                    </p>
                                </div>

                                <div className="space-y-6 text-foreground/90 leading-relaxed">
                                    <div className="p-6 bg-background/50 rounded-xl border-l-4 border-indigo-500">
                                        <h3 className="font-bold text-indigo-400 mb-2 text-lg">✨ 총평</h3>
                                        <p className="opacity-90">
                                            {selectedSign.element === 'Fire' ? "열정이 넘치는 시기입니다. 당신의 에너지가 주변을 밝히고 새로운 기회를 끌어당길 것입니다." :
                                                selectedSign.element === 'Water' ? "감성적인 흐름이 강해집니다. 직관을 믿고 내면의 소리에 귀 기울이면 뜻밖의 행운을 발견할 수 있습니다." :
                                                    selectedSign.element === 'Air' ? "새로운 아이디어와 만남이 가득합니다. 활발한 소통을 통해 당신의 영역을 확장하기 좋은 때입니다." :
                                                        "안정적이고 실리적인 성과를 거둘 수 있습니다. 꾸준함이 당신의 가장 큰 무기가 되어줄 것입니다."}
                                            {selectedTimeframe.id === 'yearly' && " 특히 올해는 당신의 잠재력이 폭발하는 한 해가 될 것입니다. 두려워하지 말고 도전하세요!"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-background/50 rounded-xl">
                                            <h4 className="font-bold text-rose-400 mb-1">❤️ 애정운</h4>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'fill-rose-400 text-rose-400' : 'text-gray-600'}`} />)}
                                            </div>
                                            <p className="text-sm opacity-80">
                                                매력지수가 상승하여 주목받는 날입니다.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-background/50 rounded-xl">
                                            <h4 className="font-bold text-emerald-400 mb-1">💰 금전운</h4>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= (selectedSign.element === 'Earth' ? 5 : 3) ? 'fill-emerald-400 text-emerald-400' : 'text-gray-600'}`} />)}
                                            </div>
                                            <p className="text-sm opacity-80">
                                                {selectedSign.element === 'Earth' ? "뜻밖의 수익이 기대됩니다." : "지출 관리에 신경 써야 합니다."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-background/50 rounded-xl">
                                        <h4 className="font-bold text-gold mb-2">💡 행운의 팁</h4>
                                        <div className="flex justify-between text-sm opacity-80">
                                            <span>Lucky Color: <span className="text-white font-medium">{selectedSign.element === 'Fire' ? 'Red' : selectedSign.element === 'Water' ? 'Blue' : selectedSign.element === 'Air' ? 'White' : 'Green'}</span></span>
                                            <span>Lucky Number: <span className="text-white font-medium">{Math.floor(Math.random() * 9) + 1}</span></span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-white/10">
                                        <Button variant="outline" className="flex-1" onClick={() => saveResultAsImage('horoscope-result', `aura-horoscope-${selectedSign.name}`)}>
                                            <Download className="w-4 h-4 mr-2" /> 저장
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => shareResult(`${selectedSign.name}의 운세`, `제 별자리 운세 결과가 나왔습니다! 행운의 컬러는 ${selectedSign.element === 'Fire' ? 'Red' : 'Blue'}네요.`)}>
                                            <Share2 className="w-4 h-4 mr-2" /> 공유
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full mt-6"
                            onClick={() => {
                                setStep('select-sign');
                                setSelectedSign(null);
                                setSelectedTimeframe(null);
                            }}
                        >
                            다른 별자리 보기
                        </Button>
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleUnlock}
                featureName={`${selectedSign?.name} 프리미엄 운세`}
                price={1}
            />
        </AppLayout>
    );
};
